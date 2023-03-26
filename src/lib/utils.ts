import type IItem from '$interfaces/extensions/IItem';

export function addSecondsToDate(date: Date, seconds: number): Date {
	date.setTime(date.getTime() + seconds * 1000);
	return date;
}

export function powerSorter(a: IItem, b: IItem): number {
	if (a.power > b.power) {
		return -1;
	} else if (a.power < b.power) {
		return 1;
	}
	return 0;
}

export function asyncDelay(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
