// A link to the fantasy game (fantasy.pcmt.gg) - every link there uses this, so they all look the same:
// its mint color, a card icon and an arrow for leaving the site
const FantasyLink: React.FC<{ page: string; children: React.ReactNode }> = ({ page, children }) => (
	<a
		href={`https://fantasy.pcmt.gg/${page}`}
		className="text-fantasy inline-flex items-center gap-1 font-bold whitespace-nowrap hover:underline"
	>
		<svg viewBox="0 0 10 14" className="h-3.5 w-2.5 flex-none" aria-hidden="true">
			<rect
				x="0.75"
				y="0.75"
				width="8.5"
				height="12.5"
				rx="1.5"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
			/>
			<path d="M5 4 L7 7 L5 10 L3 7 Z" fill="currentColor" />
		</svg>
		{children}
		<span aria-hidden="true">↗</span>
	</a>
);

export default FantasyLink;
