import CustomPopover from '../CustomPopover.tsx';

interface RatingHeaderProps {
	label?: React.ReactNode; // the header's text - e.g. R<sup>T</sup> on the match page
	side?: 'top' | 'bottom'; // where the explanation opens
}

// Rating and ACS column headers with an explanation on hover - for the /stats, player agents and match tables
export const ToxicHeader = ({ label = 'toxic', side = 'bottom' }: RatingHeaderProps) => (
	<CustomPopover
		side={side}
		content={
			<div className="text-faint flex flex-col text-xs">
				<p className="mb-1">I say "toxic", but really it's stolen (with some tweaks).</p>

				<p>Specifically, from Mark Zhdan's </p>
				<a href="https://www.markzhdan.com/blogs/reverse-engineering-vlr-rating" className="mb-2 underline">
					attempt to reverse engineer VLR's Rating 2.0.
				</a>

				<p className="mb-1">The formula:</p>
				<p className="text-bright">0.898 * KPR + 0.228 * APR + 0.0025 * ADRa</p>
				<p className="text-bright mb-1">+ 0.313 * KAST + 0.295</p>
				<p>(ADRa = [(ADR * Rounds) - (140 * Kills)] / Rounds)</p>
			</div>
		}
		title={"toxic's Rating"}
		hover={true}
	>
		<span className="border-faint border-b-2 border-dotted px-0.5">{label}</span>
	</CustomPopover>
);

export const AngusHeader = ({ label = 'Angus', side = 'bottom' }: RatingHeaderProps) => (
	<CustomPopover
		side={side}
		content={
			<div className="text-faint flex flex-col text-xs">
				<p>Adjusted version of VLR rating version 1.0.</p>
				<p className="mb-1">(So like a 1.5, according to Angus.)</p>

				<p className="mb-1">The formula:</p>
				<p className="text-bright">1.26 * KPR - 0.13 * DPR + 0.55 * APR</p>
				<p className="text-bright mb-1">+ 0.25 * FKPR - 0.26 * FDPR</p>
				<p>Additionally, on the stats pages, anyone with</p>
				<p>3 or less maps played incurs a 20% penalty.</p>
			</div>
		}
		title={"Angus's Rating"}
		hover={true}
	>
		<span className="border-faint border-b-2 border-dotted px-0.5">{label}</span>
	</CustomPopover>
);

export const AcsHeader = ({ label = 'ACS', side = 'bottom' }: RatingHeaderProps) => (
	<CustomPopover
		side={side}
		content={
			<div className="text-faint flex flex-col text-xs">
				<p>You know it, you love it:</p>
				<p className="mb-1">Valorant's very own ACS.</p>

				<p className="mb-1">In case you forgot how to calculate it:</p>
				<p className="text-bright">Combat Score: 1 pt / damage dealt,</p>
				<p className="text-bright">150/130/110/90/70 pts/kill based on enemies alive,</p>
				<p className="text-bright mb-1">+50 per additional kill, +25 for non-damaging assists</p>
				<p className="text-bright">ACS = Average combat score across all rounds</p>
			</div>
		}
		title={'Average Combat Score'}
		hover={true}
	>
		<span className="border-faint border-b-2 border-dotted px-0.5">{label}</span>
	</CustomPopover>
);
