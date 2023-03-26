import type { LayoutServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { PUBLIC_PATH } from '$env/static/public';
import type ISession from '$interfaces/ISession';
import type ICharacter from '$interfaces/destiny/ICharacter';

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

	return {
		session: JSON.parse(session) as ISession,
		character: (await characterRequest.json()).data as ICharacter[]
	};
}) satisfies LayoutServerLoad;
