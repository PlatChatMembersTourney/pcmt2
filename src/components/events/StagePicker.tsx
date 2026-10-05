import { cx } from '../../utils/cx.ts';

interface StagePickerProps {
	stages: string[];
	active: number;
	onSelect: (idx: number) => void;
}

// "Stage:" label followed by one button per stage, with the active one underlined in red
const StagePicker: React.FC<StagePickerProps> = ({ stages, active, onSelect }) => (
	<>
		<div>
			<p className="text-[10px] font-medium text-red-400 uppercase">Stage:</p>
		</div>
		{stages.map((stage, idx) => (
			<button
				key={stage}
				className="flex h-full cursor-pointer flex-col items-start justify-center gap-1 border-b-3 border-transparent pt-0.75"
				onClick={() => onSelect(idx)}
			>
				<p
					className={cx(
						'box-border h-6 text-xs leading-6',
						active === idx
							? 'dark:text-vlr-text-fullwhite border-b-3 border-red-400 font-bold text-black'
							: 'border-vlr-border-mid text-main hover:dark:text-vlr-text-fullwhite border-b border-dotted hover:border-transparent hover:font-bold'
					)}
				>
					{stage}
				</p>
			</button>
		))}
	</>
);

export default StagePicker;
