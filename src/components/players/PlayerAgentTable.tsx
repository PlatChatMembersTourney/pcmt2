import {
	useTable,
	tableFeatures,
	rowSortingFeature,
	columnVisibilityFeature,
	createSortedRowModel,
	sortFn_basic,
	sortFn_text,
	createColumnHelper,
	flexRender,
	type SortingState,
	type Column,
} from '@tanstack/react-table';
import { useState } from 'react';
import { agentIcon } from '../../utils/images.ts';
import { cx } from '../../utils/cx.ts';
import { AcsHeader, AngusHeader, ToxicHeader } from '../stats/PlayerStatTable.tsx';

// One row of the table: a player's totals on one agent, or on every map ("All")
export interface AgentRow {
	agent: string;
	MP: number;
	usePct: number | null; // share of the maps with an agent recorded - null for "All"
	Rounds: number;
	Toxic: number;
	Angus: number;
	ACS: number;
	K: number;
	D: number;
	A: number;
	KAST: number;
	ADR: number;
	FK: number;
	FD: number;
	'HS%': number;
	KMAX: number;
}

// Same features as the /stats table
const features = tableFeatures({
	rowSortingFeature,
	columnVisibilityFeature,
	sortedRowModel: createSortedRowModel(),
	sortFns: {
		basic: sortFn_basic,
		text: sortFn_text,
	},
});

const pctFormatter = new Intl.NumberFormat('en-US', {
	style: 'percent',
	maximumFractionDigits: 0,
});

const columnHelper = createColumnHelper<typeof features, AgentRow>();

const columns = columnHelper.columns([
	columnHelper.accessor('agent', {
		header: 'Agent',
		cell: ({ getValue }) =>
			getValue() === 'All' ? (
				'All'
			) : (
				<div className="flex min-w-max flex-row items-center gap-1.5">
					<img src={agentIcon(getValue())} alt="" className="h-6 w-6" />
					{getValue()}
				</div>
			),
	}),
	columnHelper.group({
		header: 'Rating',
		columns: columnHelper.columns([
			columnHelper.accessor('Toxic', { header: ToxicHeader, cell: ({ getValue }) => getValue().toFixed(2) }),
			columnHelper.accessor('Angus', { header: AngusHeader, cell: ({ getValue }) => getValue().toFixed(2) }),
			columnHelper.accessor('ACS', { header: AcsHeader, cell: ({ getValue }) => getValue().toFixed(1) }),
		]),
	}),
	columnHelper.group({
		header: 'Played',
		columns: columnHelper.columns([
			columnHelper.accessor('MP', {
				header: 'MP',
				cell: ({ getValue, row }) =>
					row.original.usePct === null
						? getValue()
						: `(${getValue()}) ${pctFormatter.format(row.original.usePct)}`,
			}),
			columnHelper.accessor('Rounds', { header: 'RP' }),
		]),
	}),
	columnHelper.group({
		header: 'Total Stats',
		columns: columnHelper.columns([
			columnHelper.accessor('K', { header: 'K' }),
			columnHelper.accessor('D', { header: 'D' }),
			columnHelper.accessor('A', { header: 'A' }),
		]),
	}),
	columnHelper.group({
		header: 'Ratio',
		columns: columnHelper.columns([
			columnHelper.accessor((row) => row.K / row.D, {
				header: 'K/D',
				cell: ({ getValue }) => getValue().toFixed(2),
			}),
			columnHelper.accessor((row) => (row.K + row.A) / row.D, {
				header: 'KDA',
				cell: ({ getValue }) => getValue().toFixed(2),
			}),
		]),
	}),
	columnHelper.group({
		header: 'Per Round',
		columns: columnHelper.columns([
			columnHelper.accessor((row) => row.K / row.Rounds, {
				header: 'KPR',
				cell: ({ getValue }) => getValue().toFixed(2),
			}),
			columnHelper.accessor((row) => row.D / row.Rounds, {
				header: 'DPR',
				cell: ({ getValue }) => getValue().toFixed(2),
			}),
			columnHelper.accessor((row) => row.A / row.Rounds, {
				header: 'APR',
				cell: ({ getValue }) => getValue().toFixed(2),
			}),
			columnHelper.accessor('KAST', { header: 'KAST', cell: ({ getValue }) => pctFormatter.format(getValue()) }),
			columnHelper.accessor('ADR', { header: 'ADR', cell: ({ getValue }) => getValue().toFixed(1) }),
		]),
	}),
	columnHelper.group({
		header: 'First Blood',
		columns: columnHelper.columns([
			columnHelper.accessor('FK', { header: 'FK' }),
			columnHelper.accessor('FD', { header: 'FD' }),
			columnHelper.accessor((row) => row.FK / row.Rounds, {
				header: 'FKPR',
				cell: ({ getValue }) => getValue().toFixed(2),
			}),
			columnHelper.accessor((row) => row.FD / row.Rounds, {
				header: 'FDPR',
				cell: ({ getValue }) => getValue().toFixed(2),
			}),
			columnHelper.accessor((row) => row.FK - row.FD, { header: '+/-' }),
		]),
	}),
	columnHelper.group({
		header: 'The GOATs',
		columns: columnHelper.columns([
			columnHelper.accessor('HS%', { header: 'HS%', cell: ({ getValue }) => pctFormatter.format(getValue()) }),
			columnHelper.accessor('KMAX', { header: 'KMAX' }),
		]),
	}),
]);

// The player page's agents table - sortable, and styled like the /stats table
const PlayerAgentTable: React.FC<{ rows: AgentRow[] }> = ({ rows }) => {
	const [sorting, setSorting] = useState<SortingState>([]);

	const table = useTable({
		features,
		data: rows,
		columns,
		onSortingChange: setSorting,
		state: {
			sorting,
		},
	});

	const lastLeafId = table.getVisibleLeafColumns().at(-1)?.id;

	// Same as the /stats table: a line after each column group
	const isGroupBoundary = (column: Column<typeof features, AgentRow, unknown>) => {
		if (column.getLeafColumns().at(-1)?.id === lastLeafId) return false;
		const parent = column.parent;
		if (!parent) return true;
		return parent.getLeafColumns().at(-1)?.id === column.id;
	};

	// "All" stays on top whatever the sort (the sort is stable, so the other rows keep their order)
	const sortedRows = [...table.getRowModel().rows].sort(
		(a, b) => Number(b.original.agent === 'All') - Number(a.original.agent === 'All')
	);

	return (
		<div className="text-muted vlr-box-shadow overflow-auto text-base">
			<table className="w-full border-separate border-spacing-0">
				<thead>
					{table.getHeaderGroups().map((headerGroup, groupIdx) => (
						<tr key={headerGroup.id} className="dark:bg-vlr-gray-900 bg-gray-100">
							{headerGroup.headers.map((header) => (
								<th
									key={header.id}
									colSpan={header.colSpan}
									className={cx(
										'dark:bg-vlr-gray-900 bg-gray-100',
										isGroupBoundary(header.column) && 'border-line border-r px-1 py-1',
										groupIdx === 0 &&
											'cool-border-top cool-border-pb relative h-8.75 pt-1.75 after:top-0!'
									)}
								>
									{header.isPlaceholder ? null : (
										<div
											className={cx(
												header.column.getCanSort() && 'text-bright cursor-pointer select-none'
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
							))}
						</tr>
					))}
				</thead>
				<tbody>
					{sortedRows.map((row) => (
						<tr
							key={row.id}
							className={cx(
								'odd:bg-shade-100 even:bg-shade-200',
								row.original.agent === 'All' && 'font-bold'
							)}
						>
							{row.getVisibleCells().map((cell) => (
								<td
									key={cell.id}
									className={cx(
										'px-2.5 py-1 whitespace-nowrap',
										isGroupBoundary(cell.column) && 'border-line border-r'
									)}
								>
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default PlayerAgentTable;
