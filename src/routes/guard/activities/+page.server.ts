import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import type IActivity from '$interfaces/extensions/IActivity';
import { PUBLIC_PATH } from '$env/static/public';

export const load = (async ({ fetch, parent }) => {
	const { session, character } = await parent();

	return {
		session: session,
		character: character
	};
}) satisfies PageServerLoad;
