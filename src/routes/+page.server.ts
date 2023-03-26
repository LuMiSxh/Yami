import type { PageServerLoad } from './$types';

export const load = (async ({ url }) => {
	const type = url.searchParams.get('type') as 'err' | 'inf' | undefined;
	const errorId = url.searchParams.get('errorId') as string | undefined;
	const message = url.searchParams.get('message') as string | undefined;

	return { type, errorId, message };
}) satisfies PageServerLoad;
