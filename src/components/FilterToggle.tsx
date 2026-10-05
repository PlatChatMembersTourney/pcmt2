import { Toggle } from '@base-ui/react/toggle';
import { ToggleGroup } from '@base-ui/react/toggle-group';
import { motion } from 'motion/react';
import { cx } from '../utils/cx.ts';

interface FilterToggleProps {
	label: string; // shown before the options, e.g. "Region"
	ariaLabel: string;
	options: string[];
	value: string;
	onChange: (value: string) => void;
	className?: string; // height of the box, h-12 by default
}

// Labelled row of options where exactly one is always selected, with a sliding red underline
const FilterToggle: React.FC<FilterToggleProps> = ({ label, ariaLabel, options, value, onChange, className }) => (
	<div className={cx('bg-shade-200 vlr-box-shadow flex w-full items-stretch', className ?? 'h-12')}>
		<div className="border-line flex items-center border-r px-5">
			<p className="text-subtle text-[11px] font-bold uppercase">{label}</p>
		</div>
		<ToggleGroup
			aria-label={ariaLabel}
			value={[value]}
			// clicking the selected option would clear the selection - ignore that
			onValueChange={(newValue: string[]) => newValue.length > 0 && onChange(newValue[0])}
			className="text-main relative flex flex-none text-[12px]"
		>
			{options.map((item) => (
				<Toggle aria-label={item} value={item} key={item}>
					<div
						className={cx(
							'border-line relative flex h-full cursor-pointer items-center justify-center border-r px-3 transition-colors duration-200',
							value === item && 'bg-vlr-gray-100 dark:bg-vlr-gray-800'
						)}
					>
						{value === item && (
							<motion.div
								layoutId={`filter-${label}`} // unique per group, so each underline slides on its own
								className="absolute inset-0 border-b-3 border-red-400"
								transition={{
									type: 'spring',
									stiffness: 300,
									damping: 30,
								}}
							/>
						)}
						<span>{item}</span>
					</div>
				</Toggle>
			))}
		</ToggleGroup>
	</div>
);

export default FilterToggle;
