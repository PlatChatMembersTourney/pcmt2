
import { Toggle } from '@base-ui/react/toggle';
import { ToggleGroup } from '@base-ui/react/toggle-group';
import { motion } from "motion/react";
import {useState} from "react";
import Teams from "./Teams.tsx";

import s1na from "../data/s1/na/teams.json"
import s2na from "../data/s2/na/teams.json"
import s3na from "../data/s3/na/teams.json"

import s1emea from "../data/s1/emea/teams.json"

export interface TeamsPageProps {

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
					<div>
						<h2>S1</h2>
						<Teams teams={s1na} />
					</div>
					<div>
						<h2>S2</h2>
						<Teams teams={s2na} />
					</div>
					<div>
						<h2>S3</h2>
						<Teams teams={s3na} />
					</div>
				</div>
			)}

			{region[0] === 'EMEA' && (
				<div className="flex flex-col gap-5 my-5">
					<div>
						<h2>S1</h2>
						<Teams teams={s1emea} />
					</div>
				</div>
			)}
		</div>
	)
}

export default TeamsPage;