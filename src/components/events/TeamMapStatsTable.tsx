import type { MapStat, TeamMapStats } from '../../types/types.ts';

import {
	useReactTable,
	createColumnHelper,
	getSortedRowModel,
	flexRender,
	getCoreRowModel,
	type SortingState,
} from '@tanstack/react-table';
import { useState } from 'react';

interface TeamMapStatsTableProps {
	teamMapStats: TeamMapStats;
}

const pctFormatter = new Intl.NumberFormat('en-US', {
	style: 'percent',
	maximumFractionDigits: 0,
});

const TeamMapStatsTable: React.FC<TeamMapStatsTableProps> = (props) => {
	const { teamMapStats } = props;

	const [sorting, setSorting] = useState<SortingState>([]);

	// use TanStack table
	const columnHelper = createColumnHelper<MapStat>();

	const columns = [
		columnHelper.accessor('map', {
			header: 'Map',
		}),
		columnHelper.accessor('pick', {
			header: 'Pick',
		}),
		columnHelper.accessor('ban', {
			header: 'Ban',
		}),
		columnHelper.accessor('played', {
			header: 'Played',
		}),
		columnHelper.accessor('won', {
			header: 'Won',
		}),
		columnHelper.accessor('winPct', {
			header: 'Win %',
			cell: ({ getValue }) => {
				return pctFormatter.format(getValue());
			},
		}),
		columnHelper.accessor('roundsWon', {
			header: 'Rnd Won',
		}),
		columnHelper.accessor('roundPct', {
			header: 'Rnd %',
			cell: ({ getValue }) => {
				return pctFormatter.format(getValue());
			},
		}),
	];

	const table = useReactTable({
		data: teamMapStats.maps,
		columns,
		getSortedRowModel: getSortedRowModel(),
		getCoreRowModel: getCoreRowModel(),
		onSortingChange: setSorting,
		state: {
			sorting,
		},
	});

	return (
		<div className="dark:text-vlr-text-white text-vlr-text-dark overflow-x-auto text-base">
			<table className="vlr-box-shadow border-separate border-spacing-0">
				<thead>
					{table.getHeaderGroups().map((headerGroup, groupIdx) => (
						<tr key={headerGroup.id} className="dark:bg-vlr-gray-900 bg-gray-100">
							{headerGroup.headers.map((header) => {
								const stickyClass = (columnId: string) =>
									columnId === 'map'
										? 'sticky left-0 z-20 bg-gray-100 dark:bg-vlr-gray-900 border-r vlr-border'
										: '';
								return (
									<th
										key={header.id}
										colSpan={header.colSpan}
										className={`${stickyClass(
											header.column.id
										)} cool-border-top cool-border-pb relative px-1 pt-1.75 pb-1 after:top-0!`}
									>
										{header.isPlaceholder ? null : (
											<div
												className={
													header.column.getCanSort()
														? 'cursor-pointer text-black select-none dark:text-white'
														: ''
												}
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
												{flexRender(header.column.columnDef.header, header.getContext())}
												{{
													asc: '▲',
													desc: '▼',
												}[header.column.getIsSorted() as string] ?? null}
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
						<tr
							key={row.id}
							className="group odd:dark:bg-vlr-gray-600 even:dark:bg-vlr-gray-700 odd:bg-vlr-gray-100 even:bg-vlr-gray-200"
						>
							{row.getVisibleCells().map((cell) => (
								<td
									key={cell.id}
									className={`min-w-15 px-2.5 py-1 whitespace-nowrap ${
										cell.column.id === 'map'
											? 'vlr-border group-odd:bg-vlr-gray-100 group-even:bg-vlr-gray-200 group-odd:dark:bg-vlr-gray-600 group-even:dark:bg-vlr-gray-700 sticky left-0 z-10 border-r'
											: 'text-center'
									}`}
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

export default TeamMapStatsTable;
