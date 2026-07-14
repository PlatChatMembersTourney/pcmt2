import { regionFlag } from '../../utils/images.ts';

interface EventCardProps {
	name: string;
	id: string;
	region: string;
	status: string;
	prizePool: string;
	dates: string;
	logo: string;
}

const EventCard: React.FC<EventCardProps> = (props) => {
	const { name, id, region, status, prizePool, dates, logo } = props;
	return (
		<a className="vlr-box-shadow flex h-22.5 max-w-150 cursor-pointer items-center" href={'/events/' + id}>
			<div className="h-22.5 flex-1">
				<div className="bg-vlr-gray-100 dark:bg-vlr-gray-600 dark:hover:bg-vlr-gray-500 flex h-full flex-col px-4 py-3 hover:bg-[#f1f1f1]">
					<div className="dark:text-vlr-text-white flex-1 text-[14px] leading-tight font-bold text-black">
						{name}
					</div>
					<div className="flex flex-none flex-row items-end gap-4">
						<div className="flex w-15 flex-none flex-col gap-1 sm:w-20">
							<dd
								className={
									'text-xs leading-none font-bold' +
									(status === 'completed' ? ' text-pb' : '') +
									(status === 'ongoing' ? ' text-red-400' : '') +
									(status === 'upcoming' ? ' text-green-400' : '')
								}
							>
								{status.charAt(0).toUpperCase() + status.slice(1)}
							</dd>
							<dt className="text-vlr-text-light dark:text-vlr-text-gray text-[10px] leading-none uppercase">
								Status
							</dt>
						</div>
						<div className="hidden flex-1 flex-col gap-1 md:flex">
							<dd className="dark:text-vlr-text-light text-xs leading-none font-normal text-black">
								{prizePool}
							</dd>
							<dt className="text-vlr-text-light dark:text-vlr-text-gray text-[10px] leading-none uppercase">
								Prize Pool
							</dt>
						</div>
						<div className="flex flex-1 flex-col gap-1">
							<dd className="dark:text-vlr-text-light text-xs leading-none font-normal text-black">
								{dates}
							</dd>
							<dt className="text-vlr-text-light dark:text-vlr-text-gray text-[10px] leading-none uppercase">
								Dates
							</dt>
						</div>
						<div className="flex flex-none flex-col items-end gap-1">
							<dd className="dark:text-vlr-text-light h-4 text-xs leading-none font-normal text-black">
								<img src={regionFlag(region)} alt={region} className="h-4 w-4" />
							</dd>
							<dt className="text-vlr-text-light dark:text-vlr-text-gray text-[10px] leading-none uppercase">
								Region
							</dt>
						</div>
					</div>
				</div>
			</div>
			<div className="dark:bg-vlr-gray-500 bg-vlr-gray-200 flex h-22.5 w-22.5 flex-none items-center justify-center">
				<img src={logo} alt={name} className="h-17.5 w-17.5" />
			</div>
		</a>
	);
};

export default EventCard;
