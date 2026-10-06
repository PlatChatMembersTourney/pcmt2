import type { Player } from '../types/types.ts';

export const angusRating = (player: Pick<Player, 'K' | 'D' | 'A' | 'FK' | 'FD'>, rounds: number): number => {
	const { K, D, A, FK, FD } = player;
	return (1.26 * K - 0.13 * D + 0.55 * A + 0.25 * FK - 0.26 * FD) / rounds;
};

// R1.0 for totals the site adds up itself - same formula as pcmt-bot's compute_rating (build.py)
export const toxicRating = (player: Pick<Player, 'K' | 'D' | 'A' | 'KAST' | 'ADR'>, rounds: number): number => {
	const { K, D, A, KAST, ADR } = player;
	const kpr = K / rounds;
	return (
		0.898 * kpr + 0.228 * (A / rounds) - 0.434 * (D / rounds) + 0.0025 * (ADR - 140 * kpr) + 0.313 * KAST + 0.295
	);
};
