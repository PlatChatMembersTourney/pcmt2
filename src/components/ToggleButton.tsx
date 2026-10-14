import { cx } from '../utils/cx.ts';

interface ToggleButtonProps {
	on: boolean;
	onClick: () => void;
	className?: string; // spacing/placement only - the look is shared by every toggle
	children: React.ReactNode;
}

// An on/off option button - every toggle on the site uses this, so restyling it restyles them all.
// Off: raised (drop shadow below, faint highlight along the top). On: pressed in (darker, inner shadow at the top) with a red underline like the
// Region/Season pickers - both drawn as shadows, so the button never changes size
const ToggleButton: React.FC<ToggleButtonProps> = ({ on, onClick, className, children }) => (
	<button
		onClick={onClick}
		aria-pressed={on}
		className={cx(
			'cursor-pointer p-2 text-xs transition-[background-color,box-shadow,color] duration-150',
			on
				? 'bg-shade-200 text-bright shadow-[inset_0_-2px_0_var(--color-red-400),inset_0_2px_4px_rgba(0,0,0,0.35)]'
				: 'bg-shade-100 text-muted shadow-[0_2px_3px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.08)]',
			className
		)}
	>
		{children}
	</button>
);

export default ToggleButton;
