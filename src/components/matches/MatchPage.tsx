import type { Event } from '../../types/types.ts'
import { useStore } from '@nanostores/react'
import { $matches } from '../../stores/store.ts'
import MatchHeader from './MatchHeader.tsx'
import { useEffect, useState } from 'react'
import MatchStatsBox from './MatchStatsBox.tsx'

interface MatchPageProps {
	event: Event;
	matchId: string;
}

const shitpostPaths = [
	'coaching.png',
	'linus_stick_to_coaching.webp',
	'send_down.png',
	'we_dont_know_shit.gif',
	'what_does_he_do.gif',
	'caleb.webp',
	'ender.png',
	'zmjjkk.jpg',
	'night_2.webp',
	'night_3.webp',
	'where_is_their_team.webp',
	'where_is_my_team.webp',
	'grimisnotgrim.webp',
	'pcmt.webp',
	'tenyaku.webp',
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
				<div className="flex flex-col gap-4 max-w-200 md:w-200 min-w-0">
					<MatchHeader event={event} match={match} />
					{match.streamLink && (
						<div className="mt-2 flex flex-col">
							<h2 className="text-red-400 uppercase font-bold text-[11px] ml-4 sm:ml-5 mb-3 leading-none">
								Stream
							</h2>
							<a
								href={match.streamLink}
								target="_blank"
								rel="noopener noreferrer"
								className="h-9 pl-4 sm:pl-5 vlr-box-shadow text-[11px] flex gap-2 items-center bg-vlr-gray-200 dark:bg-vlr-gray-700
							text-[#333] dark:text-vlr-text-white hover:bg-vlr-gray-100 dark:hover:bg-vlr-gray-600"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="external-icon h-4 w-4"
									viewBox="0 0 28.57  20"
									focusable="false"
								>
									<svg
										viewBox="0 0 28.57 20"
										preserveAspectRatio="xMidYMid meet"
										xmlns="http://www.w3.org/2000/svg"
									>
										<g>
											<path
												d="M27.9727 3.12324C27.6435 1.89323 26.6768 0.926623 25.4468 0.597366C23.2197 2.24288e-07 14.285 0 14.285 0C14.285 0 5.35042 2.24288e-07 3.12323 0.597366C1.89323 0.926623 0.926623 1.89323 0.597366 3.12324C2.24288e-07 5.35042 0 10 0 10C0 10 2.24288e-07 14.6496 0.597366 16.8768C0.926623 18.1068 1.89323 19.0734 3.12323 19.4026C5.35042 20 14.285 20 14.285 20C14.285 20 23.2197 20 25.4468 19.4026C26.6768 19.0734 27.6435 18.1068 27.9727 16.8768C28.5701 14.6496 28.5701 10 28.5701 10C28.5701 10 28.5677 5.35042 27.9727 3.12324Z"
												fill="#FF0000"
											/>
											<path
												d="M11.4253 14.2854L18.8477 10.0004L11.4253 5.71533V14.2854Z"
												fill="white"
											/>
										</g>
									</svg>
								</svg>
								YouTube VOD
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									className="h-4 w-4 ml-auto mr-2 dark:stroke-vlr-text-white stroke-[#333]"
								>
									<path
										d="M0 0h24v24H0z"
										fill="none"
										stroke="none"
									/>
									<path
										fill="none"
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6m-7 1l9-9m-5 0h5v5"
									/>
								</svg>
							</a>
						</div>
					)}

					<div className="mt-2 flex flex-col">
						<h2 className="text-red-400 uppercase font-bold text-[11px] ml-4 sm:ml-5 mb-3 leading-none">
							Maps/Stats
						</h2>
						<MatchStatsBox match={match} event={event} />
					</div>
				</div>
				<div className="hidden xl:flex flex-col">
					<h2 className="text-red-400 uppercase font-bold text-[11px] ml-5 mb-3 leading-none">
						Advertisement
					</h2>
					<div className="flex flex-col gap-6">
						{pickN(shitpostPaths, 3).map((path, i) => (
							<img src={`/res/garbage/${path}`} key={path} />
						))}
					</div>
				</div>
			</div>
		</div>
	)
}

export default MatchPage;