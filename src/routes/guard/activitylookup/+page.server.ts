import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import type IActivity from '$interfaces/extensions/IActivity';
import { PUBLIC_PATH } from '$env/static/public';

export const load = (async ({ fetch, parent }) => {
	const { session, character } = await parent();

	const activityRequest = await fetch(`${PUBLIC_PATH}/api/obtain/character-power`);
	if (activityRequest.status !== 200) {
		const activityError = await activityRequest.json();
		throw error(500, { message: activityError.message, errorId: activityError.errorId });
	}

	return {
		session: session,
		character: character,
		activity: (await activityRequest.json()).data as Record<string, IActivity>
	};
}) satisfies PageServerLoad;
