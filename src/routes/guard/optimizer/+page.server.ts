import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import type IPower from '$interfaces/IPower';
import { PUBLIC_PATH } from '$env/static/public';

export const load = (async ({ fetch, parent }) => {
	const { session, character } = await parent();

	const powerRequest = await fetch(`${PUBLIC_PATH}/api/obtain/character-power`);
	if (powerRequest.status !== 200) {
		const powerError = await powerRequest.json();
		throw error(500, { message: powerError.message, errorId: powerError.errorId });
	}

	return {
		session: session,
		character: character,
		power: { ...((await powerRequest.json()).data as IPower) }
	};
}) satisfies PageServerLoad;
