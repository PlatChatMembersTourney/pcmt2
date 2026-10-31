import { useRandom } from '../utils/useRandom.ts';

// Every file in public/res/garbage, listed at build time (in astro.config.mjs) - drop an image in the folder to add it
declare const __GARBAGE__: string[];
const shitpostPaths = __GARBAGE__;

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
			<h2 className="section-label mb-3 ml-5">Advertisement</h2>
			<div className="flex flex-col gap-6">
				{ads?.map((path) => (
					<img src={`/res/garbage/${path}`} key={path} />
				))}
			</div>
		</div>
	);
};

export default Advertisements;
