import type { Event, PlayerStats } from '../../types/types.ts'

import {
	useReactTable,
	createColumnHelper,
	getSortedRowModel,
	flexRender,
	getCoreRowModel,
	type SortingState,
	type ColumnDef,
	type Column,
} from '@tanstack/react-table'
import { useState } from 'react'

type PlayerStatsWithEventId = PlayerStats & { eventId?: string }

interface PlayerStatTableProps {
	playerStats: PlayerStatsWithEventId[];
	showSeason?: boolean;
	stickyPlayerNames: boolean;
}

import eventsRaw from '../../data/events.json'
import { angusRating } from '../../utils/rating.ts'
import { $teams } from '../../stores/store.ts'
import { useStore } from '@nanostores/react'
import CustomPopover from '../CustomPopover.tsx'
import slugify from 'slugify'

const events = eventsRaw as Event[]

const pctFormatter = new Intl.NumberFormat('en-US', {
	style: 'percent',
	maximumFractionDigits: 0,
})

const PlayerStatTable: React.FC<PlayerStatTableProps> = (props) => {
	const { playerStats, showSeason, stickyPlayerNames } = props
	const teams = useStore($teams);

	const [sorting, setSorting] = useState<SortingState>([])

	// use TanStack table

	const columnHelper = createColumnHelper<PlayerStatsWithEventId>()

	const playerInfoColumns: ColumnDef<PlayerStatsWithEventId, string>[] = [
		columnHelper.accessor('Team', {
			header: 'Team',
			cell: (info) => {
				const r = info.row.original
				if (!(r.Team in teams[r.eventId!])) {
					return <p>{r.Team}</p>
				}
				return (
					<a href={`/events/${r.eventId}/teams/${slugify(teams[r.eventId!][r.Team].name, { lower: true })}`}>
						{r.Team}
					</a>
				);
			},
			id: 'Team'
		}),
	]
	if (showSeason) {
		playerInfoColumns.push(
			columnHelper.accessor(
				(row) => row.eventId!.replace('-', ' ').toUpperCase(),
				{
					header: 'Season',
					id: 'Season',
					cell: (info) => {
						const r = info.row.original
						return (
							<a href={`/events/${r.eventId}`}>
								{r.eventId!.replace('-', ' ').toUpperCase()}
							</a>
						)
					}
				}
			)
		)
	}
	const columns = [
		columnHelper.accessor('Player', {
			header: 'Player',
			id: 'Player',
			cell: (info) => {
				const r = info.row.original
				if (!(r.Team in teams[r.eventId!])) {
					return <p>{r.Player}</p>
				}
				return (
					<div className="flex flex-row items-center gap-1.5 min-w-max">
						<div className="h-6 w-6 flex items-center justify-center">
							<img
								src={teams[r.eventId!][r.Team].logo}
								className="h-6 w-auto"
								alt={r.Team}
							/>
						</div>
						<a
							href={`/events/${r.eventId}/teams/${slugify(teams[r.eventId!][r.Team].name, { lower: true })}`}
						>
							{r.Player}
						</a>
					</div>
				)
			},
		}),
		columnHelper.group({
			header: 'Info',
			columns: playerInfoColumns,
		}),
		columnHelper.group({
			header: 'Rating',
			columns: [
				columnHelper.accessor((row) => Number(row['R1.0'].toFixed(2)), {
					header: (info) => (
						<CustomPopover
							side={'bottom'}
							content={
								<div className="text-xs text-vlr-text-dark dark:text-vlr-text-light flex flex-col">
									<p className="mb-1">
										I say "toxic", but really it's stolen.
									</p>

									<p>Specifically, from Mark Zhdan's </p>
									<a
										href="https://www.markzhdan.com/blogs/reverse-engineering-vlr-rating"
										className="underline mb-2"
									>
										attempt to reverse engineer VLR's Rating
										2.0.
									</a>

									<p className="mb-1">The formula:</p>
									<p className="text-black dark:text-white">
										0.898 * KPR + 0.228 * APR + 0.0025 *
										ADRa
									</p>
									<p className="text-black dark:text-white mb-1">
										+ 0.434 * SR + 0.313 * KAST + 0.175
									</p>
									<p>
										(ADRa = [(ADR * Rounds) - (140 * Kills)]
										/ Rounds)
									</p>
									<p>(SR = (Rounds - Deaths) / Rounds)</p>
								</div>
							}
							title={"Toxic's Rating"}
							hover={true}
						>
							<span className="px-0.5 border-b-2 border-vlr-text-dark dark:border-vlr-text-light border-dotted">
								Toxic
							</span>
						</CustomPopover>
					),
					id: 'Toxic',
					cell: ({ getValue }) => {
						return getValue().toFixed(2)
					},
				}),
				columnHelper.accessor(
					(row) => {
						let ar = angusRating(row, row.Rounds)
						if (row.MP <= 3) {
							ar = ar * 0.8
						}
						return Number(ar.toFixed(2))
					},
					{
						header: (info) => (
							<CustomPopover
								side={'bottom'}
								content={
									<div className="text-xs text-vlr-text-dark dark:text-vlr-text-light flex flex-col">
										<p>
											Adjusted version of VLR rating
											version 1.0.
										</p>
										<p className="mb-1">
											(So like a 1.5, according to Angus.)
										</p>

										<p className="mb-1">The formula:</p>
										<p className="text-black dark:text-white">
											1.26 * KPR - 0.13 * DPR + 0.55 * APR
										</p>
										<p className="text-black dark:text-white mb-1">
											+ 0.25 * FKPR - 0.26 * FDPR
										</p>
										<p>
											Additionally, on the stats pages,
											anyone with
										</p>
										<p>
											3 or less maps played incurs a 20%
											penalty.
										</p>
									</div>
								}
								title={"Angus's Rating"}
								hover={true}
							>
								<span className="px-0.5 border-b-2 border-vlr-text-dark dark:border-vlr-text-light border-dotted">
									Angus
								</span>
							</CustomPopover>
						),
						id: 'Angus',
						cell: ({ getValue }) => {
							return getValue().toFixed(2)
						},
					}
				),
			],
		}),
		columnHelper.group({
			header: 'Played',
			columns: [
				columnHelper.accessor('MP', {
					header: 'MP',
				}),
				columnHelper.accessor('Rounds', {
					header: 'RP',
				}),
			],
		}),
		columnHelper.group({
			header: 'Total Stats',
			columns: [
				columnHelper.accessor('K', {
					header: 'K',
				}),
				columnHelper.accessor('D', {
					header: 'D',
				}),
				columnHelper.accessor('A', {
					header: 'A',
				}),
			],
		}),
		columnHelper.group({
			header: 'Ratio',
			columns: [
				columnHelper.accessor((row) => row.K / row.D, {
					header: 'K/D',
					cell: ({ getValue }) => {
						return getValue().toFixed(2)
					},
				}),
				columnHelper.accessor((row) => (row.K + row.A) / row.D, {
					header: 'KDA',
					cell: ({ getValue }) => {
						return getValue().toFixed(2)
					},
				}),
			],
		}),
		columnHelper.group({
			header: 'Per Round',
			columns: [
				columnHelper.accessor('KPR', {
					header: 'KPR',
					cell: ({ getValue }) => {
						return getValue().toFixed(2)
					},
				}),
				columnHelper.accessor('DPR', {
					header: 'DPR',
					cell: ({ getValue }) => {
						return getValue().toFixed(2)
					},
				}),
				columnHelper.accessor((row) => row.A / row.Rounds, {
					header: 'APR',
					cell: ({ getValue }) => {
						return getValue().toFixed(2)
					},
				}),
				columnHelper.accessor('KAST', {
					header: 'KAST',
					cell: ({ getValue }) => {
						return pctFormatter.format(getValue())
					},
				}),
				columnHelper.accessor('ADR', {
					header: 'ADR',
					cell: ({ getValue }) => {
						return getValue().toFixed(1)
					},
				}),
			],
		}),
		columnHelper.group({
			header: 'First Blood',
			columns: [
				columnHelper.accessor('FK', {
					header: 'FK',
				}),
				columnHelper.accessor('FD', {
					header: 'FD',
				}),
				columnHelper.accessor('FKPR', {
					header: 'FKPR',
					cell: ({ getValue }) => {
						return getValue().toFixed(2)
					},
				}),
				columnHelper.accessor('FDPR', {
					header: 'FDPR',
					cell: ({ getValue }) => {
						return getValue().toFixed(2)
					},
				}),
				columnHelper.accessor((row) => row.FK - row.FD, {
					header: '+/-',
				}),
			],
		}),
		columnHelper.group({
			header: 'The GOATs',
			columns: [
				columnHelper.accessor(
					(row) => pctFormatter.format(row['HS%']),
					{
						header: 'HS%',
					}
				),
				columnHelper.accessor('KMAX', {
					header: 'KMAX',
				}),
			],
		}),
	]

	const table = useReactTable({
		data: playerStats,
		columns,
		getSortedRowModel: getSortedRowModel(),
		getCoreRowModel: getCoreRowModel(),
		onSortingChange: setSorting,
		state: {
			sorting,
		},
	})

	const lastLeafId = table.getVisibleLeafColumns().at(-1)?.id

	const isGroupBoundary = (
		column: Column<PlayerStatsWithEventId, unknown>
	) => {
		// no border on anything that ends at the table's right edge
		if (column.getLeafColumns().at(-1)?.id === lastLeafId) return false
		const parent = column.parent
		if (!parent) return true
		const leaves = parent.getLeafColumns()
		return leaves.at(-1)?.id === column.id
	}

	return (
		<div className="text-base dark:text-vlr-text-white text-vlr-text-dark vlr-box-shadow overflow-auto max-h-full">
			<table className="border-separate border-spacing-0">
				<thead>
					{table.getHeaderGroups().map((headerGroup, groupIdx) => (
						<tr
							key={headerGroup.id}
							className="bg-gray-100 dark:bg-vlr-gray-900"
						>
							{groupIdx === 0 && (
								<th
									rowSpan={table.getHeaderGroups().length}
									className="align-bottom border-r vlr-border sticky left-0 top-0 z-30 w-12 py-1 bg-gray-100 dark:bg-vlr-gray-900 cool-border-top cool-border-pb after:top-0! after:z-10!"
								>
									#
								</th>
							)}
							{headerGroup.headers.map((header) => {
								const stickyClass = (columnId: string) =>
									(columnId === 'Player' && stickyPlayerNames)
										? 'left-12 z-30'
										: 'z-20'
								return (
									<th
										key={header.id}
										colSpan={header.colSpan}
										className={`sticky bg-gray-100 dark:bg-vlr-gray-900 ${
											isGroupBoundary(header.column)
												? 'border-r vlr-border py-1 px-1'
												: ''
										} ${stickyClass(header.column.id)} ${
											groupIdx === 0
												? 'relative cool-border-top cool-border-pb after:top-0! pt-1.75 h-8.75 top-0'
												: 'top-8.75'
										}`}
									>
										{header.isPlaceholder ? null : (
											<div
												className={
													header.column.getCanSort()
														? 'cursor-pointer select-none dark:text-white text-black'
														: ''
												}
												onClick={header.column.getToggleSortingHandler()}
												title={
													header.column.getCanSort()
														? header.column.getNextSortingOrder() ===
															'asc'
															? 'Sort ascending'
															: header.column.getNextSortingOrder() ===
																  'desc'
																? 'Sort descending'
																: 'Clear sort'
														: undefined
												}
											>
												<div className="flex justify-center">
													{flexRender(
														header.column.columnDef
															.header,
														header.getContext()
													)}
													{{
														asc: '▲',
														desc: '▼',
													}[
														header.column.getIsSorted() as string
													] ?? null}
												</div>
											</div>
										)}
									</th>
								)
							})}
						</tr>
					))}
				</thead>
				<tbody>
					{table.getRowModel().rows.map((row, idx) => (
						<tr
							key={row.id}
							className="group odd:dark:bg-vlr-gray-600 even:dark:bg-vlr-gray-700 odd:bg-vlr-gray-100 even:bg-vlr-gray-200"
						>
							<td className="px-2.5 py-1 border-r vlr-border sticky left-0 z-10 w-12 min-w-12 group-odd:bg-vlr-gray-100 group-even:bg-vlr-gray-200 group-odd:dark:bg-vlr-gray-600 group-even:dark:bg-vlr-gray-700">
								{idx + 1}
							</td>
							{row.getVisibleCells().map((cell) => (
								<td
									key={cell.id}
									className={`px-2.5 py-1 whitespace-nowrap ${
										isGroupBoundary(cell.column)
											? 'border-r vlr-border'
											: ''
									} ${
										(cell.column.id === 'Player' && stickyPlayerNames)
											? 'sticky left-12 z-10 group-odd:bg-vlr-gray-100 group-even:bg-vlr-gray-200 group-odd:dark:bg-vlr-gray-600 group-even:dark:bg-vlr-gray-700'
											: ''
									}`}
								>
									{flexRender(
										cell.column.columnDef.cell,
										cell.getContext()
									)}
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
										: flexRender(
												header.column.columnDef.footer,
												header.getContext()
											)}
								</th>
							))}
						</tr>
					))}
				</tfoot>
			</table>
		</div>
	)
}

export default PlayerStatTable
