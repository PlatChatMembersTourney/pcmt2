import type { Column, RowData, TableFeatures } from '@tanstack/react-table';
import { cx } from '../utils/cx.ts';

// What SortHeader uses from a TanStack column - any column of a table with sorting enabled has these
interface SortableColumn {
	getCanSort: () => boolean;
	getIsSorted: () => 'asc' | 'desc' | false;
	getNextSortingOrder: () => 'asc' | 'desc' | false;
	getToggleSortingHandler: () => ((event: unknown) => void) | undefined;
}

// A sortable column's header (the TanStack tables: /stats, team map stats, player agents): click to sort, with a
// hint of what the next click does, and ▲/▼ while sorted. children: the header's content (flexRender of it)
export const SortHeader = ({ column, children }: { column: SortableColumn; children: React.ReactNode }) => {
	const next = column.getNextSortingOrder();
	return (
		<div
			className={cx(column.getCanSort() && 'text-bright cursor-pointer select-none')}
			onClick={column.getToggleSortingHandler()}
			title={
				column.getCanSort()
					? next === 'asc'
						? 'Sort ascending'
						: next === 'desc'
							? 'Sort descending'
							: 'Clear sort'
					: undefined
			}
		>
			<div className="flex justify-center">
				{children}
				{column.getIsSorted() === 'asc' ? '▲' : column.getIsSorted() === 'desc' ? '▼' : null}
			</div>
		</div>
	);
};

// Whether a column ends its group, so gets a divider on its right - except at the table's right edge
export const isGroupBoundary = <TFeatures extends TableFeatures, TData extends RowData>(
	column: Column<TFeatures, TData>,
	lastLeafId: string | undefined
) => {
	if (column.getLeafColumns().at(-1)?.id === lastLeafId) return false;
	const parent = column.parent;
	if (!parent) return true;
	return parent.getLeafColumns().at(-1)?.id === column.id;
};
