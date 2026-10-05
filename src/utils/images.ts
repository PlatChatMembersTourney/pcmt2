import flagsRaw from '../data/flags.json'
import type { Flags, Round } from '../types/types.ts'
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

export const eventLogo = (showmatch: boolean, region: string) => {
	if (showmatch) return '/icons/PC%20Logo%20Box.png';
	return region === 'na' ? '/icons/NA%20Logo.png' : '/icons/EMEA%20Logo.png';
}

const roundIcons: Record<NonNullable<Round['endType']>, string> = {
	Eliminated: 'elim.webp',
	'Bomb detonated': 'boom.webp',
	'Bomb defused': 'defuse.webp',
	'Round timer expired': 'time.webp',
};

export const roundIcon = (endType: NonNullable<Round['endType']>) => {
	return `/icons/rounds/${roundIcons[endType]}`;
}
