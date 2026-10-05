import { useEffect, useState } from 'react';

const setUrlParam = (key: string, value: string | null) => {
	const url = new URL(location.href);
	if (value === null) url.searchParams.delete(key);
	else url.searchParams.set(key, value);
	history.replaceState(null, '', url);
};

// Selected-tab index that is mirrored in the URL (?key=Option Name) so it survives a refresh.
// Uses defaultIndex unless the URL param matches one of the options.
export const useUrlTab = (key: string, options: string[], defaultIndex = 0) => {
	const [index, setIndex] = useState(defaultIndex);

	// Read after mount (not in useState) so the first render matches the static HTML
	useEffect(() => {
		const i = options.indexOf(new URLSearchParams(location.search).get(key) ?? '');
		if (i !== -1) setIndex(i);

		// Remove the param once this tab is closed (unmounted)
		return () => setUrlParam(key, null);
	}, []);

	const select = (i: number) => {
		setIndex(i);
		setUrlParam(key, options[i]);
	};

	return [index, select] as const;
};
