import type { Event } from '../../types/types.ts'

interface MatchPageProps {
	event: Event;
	matchId: string;
}

const MatchPage: React.FC<MatchPageProps> = (props: MatchPageProps) => {
	const { event, matchId } = props

	return (
		<div className="font-[roboto] h-full">
			holy shit
		</div>
	)
}

export default MatchPage;