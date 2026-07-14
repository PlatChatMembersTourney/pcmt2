import { useState } from 'react';
import type { TeamInfo } from '../types/types.ts';

export interface TeamsProps {
	teams: Record<string, TeamInfo>;
}

const Teams: React.FC<TeamsProps> = (props: TeamsProps) => {
	const { teams } = props;

	const sortedTeams = Object.values(teams).sort((a, b) => {
		return a.name.localeCompare(b.name);
	});

	return (
		<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
			{sortedTeams.map(({ name, abbr, logo, players }) => (
				<div
					key={name}
					className="my-auto flex h-40 flex-col items-center justify-center rounded-lg bg-neutral-200 dark:bg-neutral-800"
				>
					<img src={logo} className="h-20 w-20" />
					<h1>{name}</h1>
				</div>
			))}
		</div>
	);
};

export default Teams;
