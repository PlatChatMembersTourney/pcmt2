// Percentages as whole numbers, e.g. 0.574 -> "57%"
export const pctFormatter = new Intl.NumberFormat('en-US', {
	style: 'percent',
	maximumFractionDigits: 0,
});
