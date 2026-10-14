import { cx } from '../utils/cx.ts';

interface ToggleButtonProps {
	on: boolean;
	onClick: () => void;
	className?: string; // spacing/placement only - the look is shared by every toggle
	children: React.ReactNode;
}

// An on/off option button - every toggle on the site uses this, so restyling it restyles them all.
// Off: raised (drop shadow below, faint highlight along the top). On: pressed in (darker, inner shadow at the top)
// with a red underline like the Region/Season pickers. Shadows and the underline (::after) take no space, so the
// button never changes size. Animations (motion-safe only): it sinks 1px while held, and the underline grows
// from the centre when switched on (and shrinks back when switched off)
const ToggleButton: React.FC<ToggleButtonProps> = ({ on, onClick, className, children }) => (
	<button
		onClick={onClick}
		aria-pressed={on}
		className={cx(
			'relative cursor-pointer p-2 text-xs transition-[background-color,box-shadow,color,translate] duration-150 motion-safe:active:translate-y-px',
			'after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-center after:bg-red-400 after:duration-200 motion-safe:after:transition-transform',
			on
				? 'bg-shade-200 text-bright shadow-[inset_0_2px_4px_rgba(0,0,0,0.35)] after:scale-x-100'
				: 'bg-shade-100 text-muted shadow-[0_2px_3px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.08)] after:scale-x-0 active:shadow-[0_1px_1px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.08)]',
			className
		)}
	>
		{children}
	</button>
);

export default ToggleButton;
