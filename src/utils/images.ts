import flagsRaw from '../data/flags.json'
import type { Flags } from '../types/types.ts'
const flags = flagsRaw as Flags

export const playerFlag = (playerName: string, eventId: string, region: string) => {
	const name = playerName.toLowerCase();
	if(name in flags['Overrides'][eventId]) {
		return `/icons/flags/16/${flags['Overrides'][eventId][name]}.png`;
	}
	return `/icons/flags/16/${flags['All'][name] || region}.png`;
}

export const regionFlag = (region: string) => {
	return `/icons/flags/16/${region}.png`
}

export const teamFlag = (
	team: string, // team abbreviation
	eventId: string,
	region: string
) => {
	return `/icons/flags/16/${flags['Teams'][eventId][team.toLowerCase()] || region}.png`
}

export const agentIcon = (agent: string) => {
	if (agent === 'KAY/O') {
		agent = 'KAYO'
	}
	return `/agents/${agent}_icon.png`;
}