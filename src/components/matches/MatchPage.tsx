import type { Event } from '../../types/types.ts'
import { useStore } from '@nanostores/react'
import { $matches } from '../../stores/store.ts'
import MatchHeader from './MatchHeader.tsx'
import { useEffect, useState } from 'react'

interface MatchPageProps {
	event: Event;
	matchId: string;
}

const shitpostPaths = [
	'coaching.png',
	'linus_stick_to_coaching.gif',
	'send_down.png',
	'we_dont_know_shit.gif',
	'what_does_he_do.gif'
]

function pickN<T>(items: T[], N: number): T[] {
	const indexes = Array.from({ length: items.length }, (_, i) => i);

	// Partial Fisher–Yates: shuffle just the first 3 positions
	for (let i = 0; i < N; i++) {
		const j = i + Math.floor(Math.random() * (indexes.length - i));
		[indexes[i], indexes[j]] = [indexes[j], indexes[i]];
	}

	return indexes.slice(0, 3).map(i => items[i]);
}

const MatchPage: React.FC<MatchPageProps> = (props: MatchPageProps) => {
	const { event, matchId } = props

	const [timezone, setTimezone] = useState('America/Chicago');

	useEffect(() => {
		// Fetch the IANA timezone string from the browser
		const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
		setTimezone(userTimezone)
	}, [])

	console.log(event);
	console.log(matchId);

	const allMatches = useStore($matches)[event.id];

	const match = allMatches.find((m) => m.id === matchId);

	if(!match) {
		return (
			<div className="font-[roboto] h-full">
				<img src={'/res/exist.png'} />
			</div>
		)
	}

	return (
		<div className="flex flex-col font-[roboto] h-full dark:bg-vlr-gray-800 bg-vlr-gray-300">
			<div className="grid grid-cols-1 xl:grid-cols-[auto_1fr] gap-6 m-6">
				<div className="flex flex-col max-w-200 md:w-200 min-w-0">
					<MatchHeader event={event} match={match} />
				</div>
				<div className="hidden xl:flex flex-col">
					<h2 className="text-red-400 uppercase font-bold text-[11px] ml-3 mb-3 leading-none">
						Advertisement
					</h2>
					<div className="flex flex-col gap-6">
						{
							pickN(shitpostPaths, 3).map((path, i) => (
								<img src={`/res/garbage/${path}`} key={path}/>
							))
						}
					</div>
				</div>
			</div>
		</div>
	)
}

export default MatchPage;