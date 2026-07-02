interface EventCardProps {
	name: string;
	id: string;
	region: string;
	status: string;
	prizePool: string;
	dates: string;
	logo: string;
}

const EventCard: React.FC<EventCardProps> = props => {
	const { name, id, region, status, prizePool, dates, logo } = props;
	return (
		<a
			className="max-w-150 flex items-center h-22.5 vlr-box-shadow cursor-pointer"
			href={'/events/' + id}
		>
			<div className="flex-1 h-22.5">
				<div className="flex flex-col px-4 py-3 h-full bg-vlr-gray-100 dark:bg-vlr-gray-600 hover:bg-[#f1f1f1] dark:hover:bg-vlr-gray-500">
					<div className="flex-1 text-[14px] font-bold text-black dark:text-vlr-text-white leading-tight">
						{name}
					</div>
					<div className="flex-none flex flex-row items-end gap-4">
						<div className="flex-none w-15 sm:w-20 flex flex-col gap-1">
							<dd
								className={
									'text-xs leading-none font-bold' +
									(status === 'completed' ? ' text-pb' : '') +
									(status === 'ongoing'
										? ' text-red-400'
										: '') +
									(status === 'upcoming'
										? ' text-green-400'
										: '')
								}
							>
								{status.charAt(0).toUpperCase() +
									status.slice(1)}
							</dd>
							<dt className="text-[10px] leading-none uppercase text-vlr-text-light dark:text-vlr-text-gray">
								Status
							</dt>
						</div>
						<div className="flex-1 flex-col gap-1 hidden md:flex">
							<dd className="text-xs leading-none font-normal text-black dark:text-vlr-text-light">
								{prizePool}
							</dd>
							<dt className="text-[10px] leading-none uppercase text-vlr-text-light dark:text-vlr-text-gray">
								Prize Pool
							</dt>
						</div>
						<div className="flex-1 flex flex-col gap-1">
							<dd className="text-xs leading-none font-normal text-black dark:text-vlr-text-light">
								{dates}
							</dd>
							<dt className="text-[10px] leading-none uppercase text-vlr-text-light dark:text-vlr-text-gray">
								Dates
							</dt>
						</div>
						<div className="flex-none flex items-end flex-col gap-1">
							<dd className="text-xs leading-none font-normal text-black dark:text-vlr-text-light h-4">
								<img
									src={
										region === 'na'
											? '/icons/flags/16/us.png'
											: '/icons/flags/16/eu.png'
									}
									alt={region}
									className="h-4 w-4"
								/>
							</dd>
							<dt className="text-[10px] leading-none uppercase text-vlr-text-light dark:text-vlr-text-gray">
								Region
							</dt>
						</div>
					</div>
				</div>
			</div>
			<div className="flex-none flex items-center justify-center h-22.5 w-22.5 dark:bg-vlr-gray-500 bg-vlr-gray-200">
				<img src={logo} alt={name} className="h-17.5 w-17.5" />
			</div>
		</a>
	)
}

export default EventCard;