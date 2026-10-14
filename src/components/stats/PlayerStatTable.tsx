import type { PlayerStatsWithEventId } from '../../types/types.ts';

import {
	useTable,
	tableFeatures,
	rowSortingFeature,
	columnVisibilityFeature,
	createSortedRowModel,
	sortFn_alphanumeric,
	sortFn_basic,
	sortFn_datetime,
	sortFn_text,
	createColumnHelper,
	flexRender,
	type SortingState,
	type Column,
} from '@tanstack/react-table';
import { useState } from 'react';

interface PlayerStatTableProps {
	playerStats: PlayerStatsWithEventId[];
	showSeason?: boolean;
	stickyPlayerNames: boolean;
	combined?: boolean; // Combine Seasons rows: no Team/Season columns, every team's logo by the name
}

import { eventById } from '../../stores/events.ts';

import { angusRating } from '../../utils/rating.ts';
import { teams } from '../../stores/teams.ts';
import slugify from 'slugify';
import { cx } from '../../utils/cx.ts';
import { playerSlug } from '../../utils/playerSlug.ts';
import { SortHeader } from '../SortHeader.tsx';
import { pctFormatter } from '../../utils/format.ts';
import { AcsHeader, AngusHeader, ToxicHeader } from './RatingHeaders.tsx';

// Table features used: sorting, plus column visibility for getVisibleLeafColumns()
const features = tableFeatures({
	rowSortingFeature,
	columnVisibilityFeature,
	sortedRowModel: createSortedRowModel(),
	// the sort functions automatic sorting can pick (registering all of them would bundle every one)
	sortFns: {
		alphanumeric: sortFn_alphanumeric,
		basic: sortFn_basic,
		datetime: sortFn_datetime,
		text: sortFn_text,
	},
});

const PlayerStatTable: React.FC<PlayerStatTableProps> = (props) => {
	const { playerStats, showSeason, stickyPlayerNames, combined } = props;
	// Combined rows' logo slot fits the most logos in the table, so every name starts in the same place
	const logoSlots = Math.max(0, ...playerStats.map((row) => row.logos?.length ?? 0));

	const [sorting, setSorting] = useState<SortingState>([]);

	// use TanStack table

	const columnHelper = createColumnHelper<typeof features, PlayerStatsWithEventId>();

	const playerInfoColumns = columnHelper.columns([
		columnHelper.accessor('Team', {
			header: 'Team',
			// team names mix letters and numbers (C9, 100T) - sort them alphanumerically, as before the v9 upgrade
			sortFn: 'alphanumeric',
			cell: (info) => {
				const r = info.row.original;
				if (!(r.Team in teams[r.eventId])) {
					return <p>{r.Team}</p>;
				}
				return (
					<a href={`/events/${r.eventId}/teams/${slugify(teams[r.eventId][r.Team].name, { lower: true })}`}>
						{r.Team}
					</a>
				);
			},
			id: 'Team',
		}),
	]);
	if (showSeason) {
		playerInfoColumns.push(
			columnHelper.accessor((row) => eventById[row.eventId].shortName, {
				header: 'Season',
				id: 'Season',
				cell: (info) => {
					const r = info.row.original;
					return <a href={`/events/${r.eventId}`}>{info.getValue()}</a>;
				},
			})
		);
	}
	const columns = columnHelper.columns([
		columnHelper.accessor('Player', {
			header: 'Player',
			id: 'Player',
			cell: (info) => {
				const r = info.row.original;
				if (r.logos) {
					return (
						<div className="flex min-w-max flex-row items-center gap-1.5">
							{logoSlots > 0 && (
								<div className="flex justify-end gap-0.5" style={{ width: logoSlots * 26 - 2 }}>
									{r.logos.map((logo) => (
										<img src={logo} className="h-6 w-6 object-contain" alt="" key={logo} />
									))}
								</div>
							)}
							<a href={`/players/${playerSlug(r.Player)}`}>{r.Player}</a>
						</div>
					);
				}
				if (!(r.Team in teams[r.eventId])) {
					return <a href={`/players/${playerSlug(r.Player)}`}>{r.Player}</a>;
				}
				return (
					<div className="flex min-w-max flex-row items-center gap-1.5">
						<div className="flex h-6 w-6 items-center justify-center">
							<img src={teams[r.eventId][r.Team].logo} className="h-6 w-auto" alt={r.Team} />
						</div>
						<a href={`/players/${playerSlug(r.Player)}`}>{r.Player}</a>
					</div>
				);
			},
		}),
		...(combined
			? []
			: [
					columnHelper.group({
						header: 'Info',
						columns: playerInfoColumns,
					}),
				]),
		columnHelper.group({
			header: 'Rating',
			columns: columnHelper.columns([
				// A function, as TanStack would read the key 'R1.0' as a path. No small-sample penalty here (unlike Angus):
				// the default order follows the unmodified Toxic rating
				columnHelper.accessor((row) => row['R1.0'], {
					header: () => <ToxicHeader />,
					id: 'Toxic',
					cell: ({ getValue }) => getValue().toFixed(2),
				}),
				columnHelper.accessor(
					(row) => {
						let ar = angusRating(row, row.Rounds);
						if (row.MP <= 3 && !eventById[row.eventId].showmatch) {
							ar = ar * 0.8;
						}
						return ar;
					},
					{
						header: () => <AngusHeader />,
						id: 'Angus',
						cell: ({ getValue }) => {
							return getValue().toFixed(2);
						},
					}
				),
				columnHelper.accessor('ACS', {
					header: () => <AcsHeader />,
					id: 'ACS',
					cell: ({ getValue }) => Math.round(getValue()), // combined ACS (weighted by rounds) isn't a whole number
				}),
			]),
		}),
		columnHelper.group({
			header: 'Played',
			columns: columnHelper.columns([
				columnHelper.accessor('MP', {
					header: 'MP',
				}),
				columnHelper.accessor('Rounds', {
					header: 'RP',
				}),
			]),
		}),
		columnHelper.group({
			header: 'Total Stats',
			columns: columnHelper.columns([
				columnHelper.accessor('K', {
					header: 'K',
				}),
				columnHelper.accessor('D', {
					header: 'D',
				}),
				columnHelper.accessor('A', {
					header: 'A',
				}),
			]),
		}),
		columnHelper.group({
			header: 'Ratio',
			columns: columnHelper.columns([
				columnHelper.accessor((row) => row.K / row.D, {
					header: 'K/D',
					cell: ({ getValue }) => {
						return getValue().toFixed(2);
					},
				}),
				columnHelper.accessor((row) => (row.K + row.A) / row.D, {
					header: 'KDA',
					cell: ({ getValue }) => {
						return getValue().toFixed(2);
					},
				}),
			]),
		}),
		columnHelper.group({
			header: 'Per Round',
			columns: columnHelper.columns([
				columnHelper.accessor('KPR', {
					header: 'KPR',
					cell: ({ getValue }) => {
						return getValue().toFixed(2);
					},
				}),
				columnHelper.accessor('DPR', {
					header: 'DPR',
					cell: ({ getValue }) => {
						return getValue().toFixed(2);
					},
				}),
				columnHelper.accessor((row) => row.A / row.Rounds, {
					header: 'APR',
					cell: ({ getValue }) => {
						return getValue().toFixed(2);
					},
				}),
				columnHelper.accessor('KAST', {
					header: 'KAST',
					cell: ({ getValue }) => {
						return pctFormatter.format(getValue());
					},
				}),
				columnHelper.accessor('ADR', {
					header: 'ADR',
					cell: ({ getValue }) => {
						return getValue().toFixed(1);
					},
				}),
			]),
		}),
		columnHelper.group({
			header: 'First Blood',
			columns: columnHelper.columns([
				columnHelper.accessor('FK', {
					header: 'FK',
				}),
				columnHelper.accessor('FD', {
					header: 'FD',
				}),
				columnHelper.accessor('FKPR', {
					header: 'FKPR',
					cell: ({ getValue }) => {
						return getValue().toFixed(2);
					},
				}),
				columnHelper.accessor('FDPR', {
					header: 'FDPR',
					cell: ({ getValue }) => {
						return getValue().toFixed(2);
					},
				}),
				columnHelper.accessor((row) => row.FK - row.FD, {
					header: '+/-',
				}),
			]),
		}),
		columnHelper.group({
			header: 'The GOATs',
			columns: columnHelper.columns([
				columnHelper.accessor((row) => pctFormatter.format(row['HS%']), {
					header: 'HS%',
				}),
				columnHelper.accessor('KMAX', {
					header: 'KMAX',
				}),
			]),
		}),
	]);

	const table = useTable({
		features,
		data: playerStats,
		columns,
		onSortingChange: setSorting,
		state: {
			sorting,
		},
	});

	const lastLeafId = table.getVisibleLeafColumns().at(-1)?.id;

	const isGroupBoundary = (column: Column<typeof features, PlayerStatsWithEventId, unknown>) => {
		// no border on anything that ends at the table's right edge
		if (column.getLeafColumns().at(-1)?.id === lastLeafId) return false;
		const parent = column.parent;
		if (!parent) return true;
		const leaves = parent.getLeafColumns();
		return leaves.at(-1)?.id === column.id;
	};

	return (
		<div className="text-muted vlr-box-shadow max-h-full overflow-auto text-base">
			<table className="border-separate border-spacing-0">
				<thead>
					{table.getHeaderGroups().map((headerGroup, groupIdx) => (
						<tr key={headerGroup.id} className="dark:bg-vlr-gray-900 bg-gray-100">
							{groupIdx === 0 && (
								<th
									rowSpan={table.getHeaderGroups().length}
									className="border-line dark:bg-vlr-gray-900 cool-border-top cool-border-pb sticky top-0 left-0 z-30 w-12 border-r bg-gray-100 py-1 align-bottom after:top-0! after:z-10!"
								>
									#
								</th>
							)}
							{headerGroup.headers.map((header) => {
								const stickyClass = (columnId: string) =>
									columnId === 'Player' && stickyPlayerNames ? 'left-12 z-30' : 'z-20';
								return (
									<th
										key={header.id}
										colSpan={header.colSpan}
										className={cx(
											'dark:bg-vlr-gray-900 sticky bg-gray-100',
											isGroupBoundary(header.column) && 'border-line border-r px-1 py-1',
											stickyClass(header.column.id),
											groupIdx === 0
												? 'cool-border-top cool-border-pb relative top-0 h-8.75 pt-1.75 after:top-0!'
												: 'top-8.75'
										)}
									>
										{header.isPlaceholder ? null : (
											<SortHeader column={header.column}>
												{flexRender(header.column.columnDef.header, header.getContext())}
											</SortHeader>
										)}
									</th>
								);
							})}
						</tr>
					))}
				</thead>
				<tbody>
					{table.getRowModel().rows.map((row, idx) => (
						<tr key={row.id} className="group odd:bg-shade-100 even:bg-shade-200">
							<td className="border-line group-odd:bg-shade-100 group-even:bg-shade-200 sticky left-0 z-10 w-12 min-w-12 border-r px-2.5 py-1">
								{idx + 1}
							</td>
							{row.getVisibleCells().map((cell) => (
								<td
									key={cell.id}
									className={cx(
										'px-2.5 py-1 whitespace-nowrap',
										isGroupBoundary(cell.column) && 'border-line border-r',
										cell.column.id === 'Player' &&
											stickyPlayerNames &&
											'group-odd:bg-shade-100 group-even:bg-shade-200 sticky left-12 z-10'
									)}
								>
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</td>
							))}
						</tr>
					))}
				</tbody>
				<tfoot>
					{table.getFooterGroups().map((footerGroup) => (
						<tr key={footerGroup.id}>
							{footerGroup.headers.map((header) => (
								<th key={header.id}>
									{header.isPlaceholder
										? null
										: flexRender(header.column.columnDef.footer, header.getContext())}
								</th>
							))}
						</tr>
					))}
				</tfoot>
			</table>
		</div>
	);
};

export default PlayerStatTable;
