import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { PUBLIC_PATH } from '$env/static/public';
import type IItemManifest from '$interfaces/destiny/manifest/IItemManifest';

export const load = (async ({ fetch, parent }) => {
	const { session, character } = await parent();

	const ornamentRequest = await fetch(`${PUBLIC_PATH}/api/obtain/ornaments`);
	if (ornamentRequest.status !== 200) {
		const ornamentError = await ornamentRequest.json();
		throw error(500, { message: ornamentError.message, errorId: ornamentError.errorId });
	}

	return {
		session: session,
		character: character,
		ornament: {
			...((await ornamentRequest.json()).data as Record<
				string,
				Record<'obtained' | 'unobtained', IItemManifest[]>
			>)
		}
	};
}) satisfies PageServerLoad;
