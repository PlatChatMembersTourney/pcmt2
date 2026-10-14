import { useRandom } from '../utils/useRandom.ts';

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
	'masaoisneeded.gif',
	'what_does_caleb_do.gif',
	'mimi.webp',
	'izz.webp',
	'larp.webp',
	'james1.webp',
	'angus1.webp',
	'lucas1.webp',
];

function pickN<T>(items: T[], N: number): T[] {
	const indexes = Array.from({ length: items.length }, (_, i) => i);

	// Partial Fisher–Yates: shuffle just the first N positions
	for (let i = 0; i < N; i++) {
		const j = i + Math.floor(Math.random() * (indexes.length - i));
		[indexes[i], indexes[j]] = [indexes[j], indexes[i]];
	}

	return indexes.slice(0, N).map((i) => items[i]);
}

// The "Advertisement" column (fun mode only, on wide screens): 3 random images, picked after the page loads
const Advertisements: React.FC = () => {
	const ads = useRandom(() => pickN(shitpostPaths, 3));

	return (
		<div className="fun:xl:flex hidden flex-col">
			<h2 className="mb-3 ml-5 text-[11px] leading-none font-bold text-red-400 uppercase">Advertisement</h2>
			<div className="flex flex-col gap-6">
				{ads?.map((path) => (
					<img src={`/res/garbage/${path}`} key={path} />
				))}
			</div>
		</div>
	);
};

export default Advertisements;
