import { cx } from '../../utils/cx.ts';

interface TabBarProps {
	tabs: string[];
	active: string;
	onSelect: (tab: string) => void;
	matchCount: number; // shown next to the Matches tab
	arrowFill: string; // fill-* class matching the background below the bar, so the active tab's arrow blends into it
}

// Row of page tabs, with a small arrow under the active one
const TabBar: React.FC<TabBarProps> = ({ tabs, active, onSelect, matchCount, arrowFill }) => (
	<div className="bg-shade-100 vlr-box-shadow border-line flex flex-row border-t border-b pl-4 sm:pl-6 dark:border-b-0">
		{tabs.map((tab) => (
			<button
				className={cx(
					'border-line hover:bg-vlr-gray-300 dark:hover:bg-vlr-gray-500 relative cursor-pointer border-r px-5 py-5 text-xs font-bold first:border-l',
					active === tab ? 'text-bright' : 'text-pb'
				)}
				onClick={() => onSelect(tab)}
				key={tab}
			>
				{tab}
				{tab === 'Matches' && <sup className="text-vlr-text-gray font-normal"> ({matchCount})</sup>}
				{active === tab && (
					<>
						<svg
							height="8"
							width="16"
							className={cx('absolute -bottom-px left-1/2 -translate-x-1/2', arrowFill)}
						>
							<path d="M0 8 L16 8 L8 0 Z" />
						</svg>
						<svg
							height="8"
							width="16"
							className="stroke-vlr-border-light absolute -bottom-px left-1/2 -translate-x-1/2 dark:hidden"
						>
							<path d="M0 8 L8 0 L16 8" fill="none" />
						</svg>
					</>
				)}
			</button>
		))}
	</div>
);

export default TabBar;
