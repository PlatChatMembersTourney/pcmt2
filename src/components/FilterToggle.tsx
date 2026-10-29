import { useLayoutEffect, useRef, useState } from 'react';
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
	disabled?: boolean; // grayed out, and can't be changed
}

// Labelled row of options where exactly one is always selected, with a red underline that slides to the selection
const FilterToggle: React.FC<FilterToggleProps> = ({
	label,
	ariaLabel,
	options,
	value,
	onChange,
	className,
	disabled,
}) => {
	// The underline is one element that stays put and animates its position and width to the selected option
	// (measured here), so quick clicks just retarget it - nothing is remounted or scaled mid-slide
	const items = useRef<Record<string, HTMLDivElement | null>>({});
	const [bar, setBar] = useState<{ x: number; width: number } | null>(null);

	useLayoutEffect(() => {
		const measure = () => {
			const item = items.current[value];
			if (!item) return;
			// Exact (fractional) sizes, as offsetLeft/offsetWidth round - and without the option's right border
			const rect = item.getBoundingClientRect();
			const parentLeft = item.offsetParent?.getBoundingClientRect().left ?? 0;
			const [x, width] = [rect.left - parentLeft, rect.width - (item.offsetWidth - item.clientWidth)];
			setBar((bar) => (bar?.x === x && bar.width === width ? bar : { x, width }));
		};
		measure();
		// Measure again if an option changes size (e.g. when the font loads)
		const observer = new ResizeObserver(measure);
		for (const item of Object.values(items.current)) if (item) observer.observe(item);
		return () => observer.disconnect();
	}, [value]);

	return (
		<div
			className={cx(
				'bg-shade-200 vlr-box-shadow flex w-full items-stretch transition-opacity',
				className ?? 'h-12',
				disabled && 'pointer-events-none opacity-40'
			)}
		>
			<div className="border-line flex items-center border-r px-5">
				<p className="text-subtle text-[11px] font-bold uppercase">{label}</p>
			</div>
			<ToggleGroup
				aria-label={ariaLabel}
				disabled={disabled}
				value={[value]}
				// clicking the selected option would clear the selection - ignore that
				onValueChange={(newValue: string[]) => newValue.length > 0 && onChange(newValue[0])}
				className="text-main relative flex flex-none text-[12px]"
			>
				{options.map((item) => (
					<Toggle aria-label={item} value={item} key={item}>
						<div
							ref={(el) => {
								items.current[item] = el;
							}}
							className={cx(
								'border-line relative flex h-full cursor-pointer items-center justify-center border-r px-3 transition-colors duration-200',
								value === item && 'bg-vlr-gray-100 dark:bg-vlr-gray-800'
							)}
						>
							{/* Until it's measured (the static HTML, before the page loads), a plain underline */}
							{!bar && value === item && (
								<div className="absolute inset-x-0 bottom-0 h-0.75 bg-red-400" />
							)}
							<span>{item}</span>
						</div>
					</Toggle>
				))}
				{bar && (
					<motion.div
						className="pointer-events-none absolute bottom-0 left-0 h-0.75 bg-red-400"
						initial={false} // appears in place, then slides on later changes
						animate={{ x: bar.x, width: bar.width }}
						transition={{ type: 'spring', stiffness: 500, damping: 38 }}
					/>
				)}
			</ToggleGroup>
		</div>
	);
};

export default FilterToggle;
