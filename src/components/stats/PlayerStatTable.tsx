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
	playerStats: PlayerStatsWithEventId[]
	showSeason?: boolean
}

import eventsRaw from '../../data/events.json'
import { angusRating } from '../../utils/rating.ts'

const events = eventsRaw as Event[]

const pctFormatter = new Intl.NumberFormat('en-US', {
	style: 'percent',
	maximumFractionDigits: 0,
})

const PlayerStatTable: React.FC<PlayerStatTableProps> = (props) => {
	const { playerStats, showSeason } = props

	const [sorting, setSorting] = useState<SortingState>([])

	// use TanStack table

	const columnHelper = createColumnHelper<PlayerStatsWithEventId>()

	const playerInfoColumns: ColumnDef<PlayerStatsWithEventId, string>[] = [
		columnHelper.accessor('Team', {
			header: 'Team',
		}),
	]
	if (showSeason) {
		playerInfoColumns.push(
			columnHelper.accessor(
				(row) => row.eventId!.replace('-', ' ').toUpperCase(),
				{
					header: 'Season',
				}
			)
		)
	}
	const columns = [
		columnHelper.accessor('Player', {
			header: 'Player',
		}),
		columnHelper.group({
			header: 'Info',
			columns: playerInfoColumns,
		}),
		columnHelper.group({
			header: 'Rating',
			columns: [
				columnHelper.accessor((row) => Number(row['R1.0'].toFixed(2)), {
					header: 'Toxic',
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
						header: 'Angus',
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
			header: 'Per Round',
			columns: [
				columnHelper.accessor('KPR', {
					header: 'KPR',
				}),
				columnHelper.accessor('DPR', {
					header: 'DPR',
				}),
				columnHelper.accessor(
					(row) => Number((row.A / row.Rounds).toFixed(2)),
					{
						header: 'APR',
					}
				),
				columnHelper.accessor((row) => pctFormatter.format(row.KAST), {
					header: 'KAST',
				}),
				columnHelper.accessor('ADR', {
					header: 'ADR',
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
				}),
				columnHelper.accessor('FDPR', {
					header: 'FDPR',
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
		<div className="text-base dark:text-vlr-text-white text-vlr-text-dark vlr-box-shadow overflow-x-auto">
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
									className="align-bottom border-r vlr-border sticky left-0 z-20 w-12 bg-gray-100 dark:bg-vlr-gray-900"
								>
									#
								</th>
							)}
							{headerGroup.headers.map((header) => {
								const stickyClass = (columnId: string) =>
									columnId === 'Player'
										? 'sticky left-12 z-20 bg-gray-100 dark:bg-vlr-gray-900'
										: ''
								return (
									<th
										key={header.id}
										colSpan={header.colSpan}
										className={`${
											isGroupBoundary(header.column)
												? 'border-r vlr-border'
												: ''
										} ${stickyClass(header.column.id)}`}
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
							<td className="px-2.5 py-1 border-r vlr-border sticky left-0 z-10 w-12 group-odd:bg-vlr-gray-100 group-even:bg-vlr-gray-200 group-odd:dark:bg-vlr-gray-600 group-even:dark:bg-vlr-gray-700">
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
										cell.column.id === 'Player'
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
