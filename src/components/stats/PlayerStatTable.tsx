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
}

import { events } from '../../stores/events.ts';

import { angusRating } from '../../utils/rating.ts';
import { teams } from '../../stores/teams.ts';
import CustomPopover from '../CustomPopover.tsx';
import slugify from 'slugify';
import { cx } from '../../utils/cx.ts';
import { playerSlug } from '../../utils/playerSlug.ts';

const eventOf = (id: string) => events.find((e) => e.id === id);

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

const pctFormatter = new Intl.NumberFormat('en-US', {
	style: 'percent',
	maximumFractionDigits: 0,
});

// Column headers with an explanation on hover - also used by the player page's agents table
export const ToxicHeader = () => (
	<CustomPopover
		side={'bottom'}
		content={
			<div className="text-faint flex flex-col text-xs">
				<p className="mb-1">I say "toxic", but really it's stolen (with some tweaks).</p>

				<p>Specifically, from Mark Zhdan's </p>
				<a href="https://www.markzhdan.com/blogs/reverse-engineering-vlr-rating" className="mb-2 underline">
					attempt to reverse engineer VLR's Rating 2.0.
				</a>

				<p className="mb-1">The formula:</p>
				<p className="text-bright">0.898 * KPR + 0.228 * APR + 0.0025 * ADRa</p>
				<p className="text-bright mb-1">+ 0.313 * KAST + 0.295</p>
				<p>(ADRa = [(ADR * Rounds) - (140 * Kills)] / Rounds)</p>
			</div>
		}
		title={"toxic's Rating"}
		hover={true}
	>
		<span className="border-faint border-b-2 border-dotted px-0.5">toxic</span>
	</CustomPopover>
);

export const AngusHeader = () => (
	<CustomPopover
		side={'bottom'}
		content={
			<div className="text-faint flex flex-col text-xs">
				<p>Adjusted version of VLR rating version 1.0.</p>
				<p className="mb-1">(So like a 1.5, according to Angus.)</p>

				<p className="mb-1">The formula:</p>
				<p className="text-bright">1.26 * KPR - 0.13 * DPR + 0.55 * APR</p>
				<p className="text-bright mb-1">+ 0.25 * FKPR - 0.26 * FDPR</p>
				<p>Additionally, on the stats pages, anyone with</p>
				<p>3 or less maps played incurs a 20% penalty.</p>
			</div>
		}
		title={"Angus's Rating"}
		hover={true}
	>
		<span className="border-faint border-b-2 border-dotted px-0.5">Angus</span>
	</CustomPopover>
);

export const AcsHeader = () => (
	<CustomPopover
		side={'bottom'}
		content={
			<div className="text-faint flex flex-col text-xs">
				<p>You know it, you love it:</p>
				<p className="mb-1">Valorant's very own ACS.</p>

				<p className="mb-1">In case you forgot how to calculate it:</p>
				<p className="text-bright">Combat Score: 1 pt / damage dealt,</p>
				<p className="text-bright">150/130/110/90/70 pts/kill based on enemies alive,</p>
				<p className="text-bright mb-1">+50 per additional kill, +25 for non-damaging assists</p>
				<p className="text-bright">ACS = Average combat score across all rounds</p>
			</div>
		}
		title={'Average Combat Score'}
		hover={true}
	>
		<span className="border-faint border-b-2 border-dotted px-0.5">ACS</span>
	</CustomPopover>
);

const PlayerStatTable: React.FC<PlayerStatTableProps> = (props) => {
	const { playerStats, showSeason, stickyPlayerNames } = props;

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
			columnHelper.accessor((row) => eventOf(row.eventId)!.shortName, {
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
		columnHelper.group({
			header: 'Info',
			columns: playerInfoColumns,
		}),
		columnHelper.group({
			header: 'Rating',
			columns: columnHelper.columns([
				columnHelper.accessor(
					(row) => {
						const tr = row['R1.0'];
						// doing this messes up the ordering, since unmodified toxic rating is the default sort
						// implement this in the calculation for toxic rating itself
						// if (row.MP <= 3 && !row.eventId?.includes('showmatch')) {
						// 	tr = tr * 0.8;
						// }
						return tr;
					},
					{
						header: ToxicHeader,
						id: 'Toxic',
						cell: ({ getValue }) => {
							return getValue().toFixed(2);
						},
					}
				),
				columnHelper.accessor(
					(row) => {
						let ar = angusRating(row, row.Rounds);
						if (row.MP <= 3 && !eventOf(row.eventId)?.showmatch) {
							ar = ar * 0.8;
						}
						return ar;
					},
					{
						header: AngusHeader,
						id: 'Angus',
						cell: ({ getValue }) => {
							return getValue().toFixed(2);
						},
					}
				),
				columnHelper.accessor('ACS', {
					header: AcsHeader,
					id: 'ACS',
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
											<div
												className={cx(
													header.column.getCanSort() &&
														'text-bright cursor-pointer select-none'
												)}
												onClick={header.column.getToggleSortingHandler()}
												title={
													header.column.getCanSort()
														? header.column.getNextSortingOrder() === 'asc'
															? 'Sort ascending'
															: header.column.getNextSortingOrder() === 'desc'
																? 'Sort descending'
																: 'Clear sort'
														: undefined
												}
											>
												<div className="flex justify-center">
													{flexRender(header.column.columnDef.header, header.getContext())}
													{{
														asc: '▲',
														desc: '▼',
													}[header.column.getIsSorted() as string] ?? null}
												</div>
											</div>
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
