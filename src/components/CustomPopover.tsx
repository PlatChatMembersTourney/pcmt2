import type { ReactNode } from 'react';
import { Popover } from '@base-ui/react/popover';
import InfoIcon from './icons/InfoIcon.tsx';

interface CustomPopoverProps {
	children: ReactNode;
	title: string;
	content: ReactNode;
	side: 'top' | 'bottom';
	hover?: boolean;
}
const CustomPopover: React.FC<CustomPopoverProps> = ({ children, title, content, side, hover }) => {
	return (
		<Popover.Root>
			<Popover.Trigger className="cursor-help" openOnHover={hover ?? false} delay={500}>
				{children}
			</Popover.Trigger>
			<Popover.Portal>
				<Popover.Positioner sideOffset={8} side={side} align="center">
					<Popover.Popup className="bg-vlr-gray-100 dark:bg-vlr-gray-900 vlr-box-shadow p-2 font-[roboto]">
						<Popover.Arrow
							className={
								'before:bg-vlr-gray-100 dark:before:bg-vlr-gray-900 popover-arrow ' +
								(side === 'top' ? 'popover-arrow-top' : 'popover-arrow-bottom')
							}
						/>
						<Popover.Title className="mb-1 text-sm font-medium text-black dark:text-white">
							{title}
						</Popover.Title>
						<Popover.Description className="">{content}</Popover.Description>
					</Popover.Popup>
				</Popover.Positioner>
			</Popover.Portal>
		</Popover.Root>
	);
};

export default CustomPopover;
