import type { LayoutServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import type ISession from '@interfaces/ISession';
import type ICharacters from '@interfaces/ICharacters';
import type IPower from '@interfaces/IPower';
import { PUBLIC_PATH } from '$env/static/public';

export const load = (async ({ cookies, fetch }) => {
	const session = cookies.get('Session');
	if (!session) {
		throw redirect(303, `${PUBLIC_PATH}/api/auth/login`);
	}

	const characterRequest = await fetch(`${PUBLIC_PATH}/api/obtain/characters`);
	if (characterRequest.status !== 200) {
		const characterError = await characterRequest.json();
		throw error(500, { message: characterError.message, errorId: characterError.errorId });
	}

	const powerRequest = await fetch(`${PUBLIC_PATH}/api/obtain/character-power`);
	if (powerRequest.status !== 200) {
		const powerError = await powerRequest.json();
		throw error(500, { message: powerError.message, errorId: powerError.errorId });
	}

	return {
		session: { ...(JSON.parse(session) as ISession) },
		character: { ...((await characterRequest.json()) as ICharacters) },
		power: { ...((await powerRequest.json()) as IPower) }
	};
}) satisfies LayoutServerLoad;
