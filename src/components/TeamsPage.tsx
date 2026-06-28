import { Toggle } from '@base-ui/react/toggle';
import { ToggleGroup } from '@base-ui/react/toggle-group';
import { Collapsible } from "@base-ui/react/collapsible";
import { motion } from "motion/react";
import {useState} from "react";
import Teams from "./Teams.tsx";
import type { TeamInfo } from "../types/types.ts";

import s1na from "../data/s1/na/teams.json"
import s2na from "../data/s2/na/teams.json"
import s3na from "../data/s3/na/teams.json"

import s1emea from "../data/s1/emea/teams.json"

export interface TeamsPageProps {

}

export function CaretRightIcon(props: React.ComponentProps<'svg'>) {   return (     <svg       width="16"       height="16"       viewBox="0 0 16 16"       fill="currentColor"       {...props}       style={{ display: 'block', ...props.style }}     >       <path d="M6 12V4l4.5 4z" />     </svg>   ); }


function Season({ label, teams }: { label: string; teams: Record<string, TeamInfo> }) {
return (
    <Collapsible.Root defaultOpen className="border-b border-neutral-700">
      <Collapsible.Trigger className="group flex items-center gap-2 py-2 text-lg font-semibold cursor-pointer">
        <CaretRightIcon className="transition-transform duration-200 group-data-[panel-open]:rotate-90" />
        {label}
      </Collapsible.Trigger>
      <Collapsible.Panel>
        <div className="py-3">
          <Teams teams={teams} />
        </div>
      </Collapsible.Panel>
    </Collapsible.Root>
  );
}		

const TeamsPage: React.FC = (props: TeamsPageProps) => {
	const [region, setRegion] = useState(['NA']);

	const handleRegionChange = (newValue: string[]) => {
		if(newValue.length === 0) {
			// don't change
			return;
		}
		setRegion(newValue);
	}

	return (
		<div className="flex flex-col mt-6">
			<div className="flex w-full">
				<div className="flex-grow">
					<h1 className="text-xl text-black dark:text-white">Teams</h1>
				</div>
				<ToggleGroup aria-label="NA or EMEA" value={region} onValueChange={handleRegionChange}
				             className="border-2 border-neutral-600 flex-none flex relative">
					<Toggle aria-label="NA" value="NA">
						<div className="transition-colors duration-200 relative">
							{region[0] === 'NA' && (
								<motion.div
									layoutId="active-pill"
									className="absolute inset-0 z-10 border-neutral-500 border-2 "
									transition={{ type: 'spring', stiffness: 300, damping: 30 }}
								/>
							)}
							<div className="z-20 px-4">
								<span>NA</span>
							</div>

						</div>
					</Toggle>
					<Toggle aria-label="EMEA" value="EMEA">
						<div className="transition-colors duration-200 relative px-4">
							{region[0] === 'EMEA' && (
								<motion.div
									layoutId="active-pill"
									className="absolute inset-0 border-neutral-500 border-2 "
									transition={{ type: 'spring', stiffness: 300, damping: 30 }}
								/>
							)}
							<span>EMEA</span>
						</div>
					</Toggle>
				</ToggleGroup>
			</div>

			<p>
				region selected is {region}
			</p>

			{region[0] === 'NA' && (
				<div className="flex flex-col gap-5 my-5">
					<Season label="S1" teams={s1na} />
					<Season label="S2" teams={s2na} />
					<Season label="S3" teams={s3na} />
				</div>
			)}

			{region[0] === 'EMEA' && (
				<div className="flex flex-col gap-5 my-5">
					<Season label="S1" teams={s1emea} />
				</div>
			)}
		</div>
	)
}

export default TeamsPage;