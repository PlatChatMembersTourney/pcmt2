import { useEffect, useMemo, useRef, useState } from 'react';
import { cx } from '../utils/cx.ts';
import { useTimezone } from '../utils/useTimezone.ts';
import { prepareIndex, search, type SearchEntry } from '../utils/search.ts';

// Fetched the first time a search box is focused, then shared by every search box on the page
let indexRequest: Promise<SearchEntry[]> | null = null;
const loadIndex = () =>
	(indexRequest ??= fetch('/search-index.json')
		.then((response) => response.json() as Promise<SearchEntry[]>)
		.catch(() => {
			indexRequest = null; // try again next time
			return [];
		}));

// The header's search box (and the first item of the mobile menu), with results in sections by type
const Search: React.FC<{ placeholder?: string }> = ({ placeholder = 'Search' }) => {
	const [query, setQuery] = useState('');
	const [open, setOpen] = useState(false);
	const [entries, setEntries] = useState<SearchEntry[] | null>(null);
	const [active, setActive] = useState(0); // highlighted result, for the arrow keys
	const input = useRef<HTMLInputElement>(null);
	const timezone = useTimezone();

	const index = useMemo(() => entries && prepareIndex(entries, timezone), [entries, timezone]);
	const groups = useMemo(() => (index ? search(index, query) : []), [index, query]);
	const results = groups.flatMap((group) => group.results);
	const highlighted = Math.min(active, results.length - 1); // the list can shrink after a key press

	// "/" jumps to the search box, unless something else is being typed in
	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			const typing = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
			// offsetParent is null when this box is hidden (the other layout's search box)
			if (e.key !== '/' || typing || !input.current?.offsetParent) return;
			e.preventDefault();
			input.current.focus();
		};
		document.addEventListener('keydown', onKeyDown);
		return () => document.removeEventListener('keydown', onKeyDown);
	}, []);

	const onKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
			e.preventDefault();
			const step = e.key === 'ArrowDown' ? 1 : -1;
			setActive(Math.min(Math.max(highlighted + step, 0), results.length - 1));
		} else if (e.key === 'Enter' && results[highlighted]) {
			location.href = results[highlighted].entry.url;
		} else if (e.key === 'Escape') {
			input.current?.blur();
		}
	};

	let resultIdx = 0;
	return (
		<div
			className="relative w-full font-[roboto]"
			// close when focus leaves the box and its results (clicking a result keeps it open until the page changes)
			onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setOpen(false)}
		>
			<label className="group border-line bg-shade-100 focus-within:border-pb dark:focus-within:border-pb dark:focus-within:bg-shade-100 flex h-9 items-center gap-2.5 rounded-sm border px-3 transition-colors dark:border-neutral-700 dark:bg-neutral-900">
				<svg
					viewBox="0 0 24 24"
					className="stroke-subtle dark:group-focus-within:stroke-subtle h-4 w-4 flex-none dark:stroke-neutral-500"
					fill="none"
					strokeWidth="2.5"
				>
					<circle cx="11" cy="11" r="7" />
					<path d="M20 20l-4-4" strokeLinecap="round" />
				</svg>
				<input
					ref={input}
					type="text"
					autoComplete="off"
					enterKeyHint="search"
					placeholder={placeholder}
					aria-label="Search players, teams, matches and events"
					className="text-main placeholder:text-subtle dark:focus:text-main dark:focus:placeholder:text-subtle w-full bg-transparent text-sm outline-none dark:text-neutral-400 dark:placeholder:text-neutral-500"
					value={query}
					onChange={(e) => {
						setQuery(e.target.value);
						setActive(0);
						setOpen(true);
					}}
					onFocus={() => {
						setOpen(true);
						void loadIndex().then(setEntries);
					}}
					onKeyDown={onKeyDown}
				/>
			</label>

			{open && query.trim() && (
				<div className="border-line bg-shade-100 vlr-box-shadow nav:min-w-96 absolute top-full left-0 z-50 mt-1 max-h-[75vh] w-full overflow-y-auto rounded-sm border py-1">
					{!index && <p className="text-subtle px-3 py-2 text-xs">Loading…</p>}
					{index && groups.length === 0 && <p className="text-subtle px-3 py-2 text-xs">Revealed no one.</p>}
					{groups.map((group) => (
						<div key={group.type}>
							<h3 className="flex justify-between px-3 pt-2 pb-1 text-[11px] font-bold text-red-400 uppercase">
								{group.label}
								{group.total > group.results.length && (
									<span className="text-subtle font-normal normal-case">
										{group.results.length} of {group.total}
									</span>
								)}
							</h3>
							{group.results.map(({ entry, dateText }) => {
								const i = resultIdx++;
								const details = dateText ? [...entry.details, dateText] : entry.details;
								return (
									<a
										href={entry.url}
										key={entry.url}
										onMouseEnter={() => setActive(i)}
										className={cx(
											'flex items-center gap-3 px-3 py-2',
											i === highlighted && 'bg-vlr-gray-150 dark:bg-vlr-gray-500'
										)}
									>
										<div className="bg-shade-200 relative flex h-9 w-9 flex-none items-center justify-center rounded-xs">
											{entry.images.length === 2 ? (
												<>
													<img
														src={entry.images[0]}
														alt=""
														className="absolute top-0.5 left-0.5 h-5 w-5 object-contain"
													/>
													<img
														src={entry.images[1]}
														alt=""
														className="absolute right-0.5 bottom-0.5 h-5 w-5 object-contain"
													/>
												</>
											) : (
												<img
													src={entry.images[0]}
													alt=""
													className={
														entry.type === 'player'
															? 'h-4 w-auto'
															: 'h-8 w-8 object-contain'
													}
												/>
											)}
										</div>
										<div className="flex min-w-0 flex-col">
											<span className="text-main truncate text-sm">{entry.title}</span>
											<span className="text-vlr-text-gray truncate text-xs">
												<span className="text-pb">{details[0]}</span>
												{details.slice(1).map((detail) => ` • ${detail}`)}
											</span>
										</div>
									</a>
								);
							})}
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default Search;
