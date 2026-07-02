import type { Player } from '../types/types.ts'

export const angusRating = (player: Player, rounds: number): number => {
	const {
		K, D, A, FK, FD
	} = player;
	return (1.26 * K - 0.13 * D + 0.55 * A + 0.25 * FK - 0.26 * FD) / rounds;
}