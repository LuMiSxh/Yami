import type { RequestHandler } from '@sveltejs/kit';
import { SECRET_API_KEY } from '$env/static/private';
import { error, json } from '@sveltejs/kit';
import type IAccessSession from '@interfaces/IAccessSession';
import type ICharacters from '@interfaces/ICharacters';
import type { ICharacter } from '@interfaces/ICharacters';

export const GET = (async ({ cookies, fetch }) => {
	const session_cookie = cookies.get('AccessSession');
	const character_cookie = cookies.get('CharacterSession');

	if (!session_cookie) {
		throw error(500, { message: 'No access session cookie exists', error_id: crypto.randomUUID() });
	}

	if (character_cookie) {
		if (new Date(JSON.parse(character_cookie).refresh_at) < new Date()) {
			return json(JSON.parse(character_cookie));
		}
	}

	const session_data = JSON.parse(session_cookie) as IAccessSession;

	// Retrieving the characters
	const url = `https://bungie.net/Platform/Destiny2/${session_data.d2.type}/Profile/${session_data.d2.id}/?components=200`;
	const character_request = await fetch(url, {
		headers: {
			Authorization: `Bearer ${session_data.access.token}`,
			'X-API-Key': SECRET_API_KEY
		}
	});
	if (character_request.status !== 200) {
		throw error(500, {
			message: `Something went wrong obtaining the Destiny2 character information: '${character_request.statusText}'`,
			error_id: crypto.randomUUID()
		});
	}
	const character_data = await character_request.json();

	const refresh = new Date();
	refresh.setDate(refresh.getDate() + 1);

	// Create Data and iterate characters
	const data: ICharacters = {
		refresh_at: refresh,
		characters: []
	};

	for (const chara of Object.values(character_data.Response.characters.data)) {
		const char = chara as {
			characterId: string;
			classType: number;
			emblemPath: string;
			emblemBackgroundPath: string;
			emblemColor: { red: number; green: number; blue: number };
		};

		let class_name: string;

		switch (char.classType) {
			case 0:
				class_name = 'Titan';
				break;
			case 1:
				class_name = 'Hunter';
				break;
			case 2:
				class_name = 'Warlock';
				break;
			default:
				class_name = 'Unknown';
		}

		const character: ICharacter = {
			id: char.characterId,
			class: class_name,
			emblem: {
				icon: 'https://bungie.net' + char.emblemPath,
				background: 'https://bungie.net' + char.emblemBackgroundPath,
				color: [char.emblemColor.red, char.emblemColor.green, char.emblemColor.blue]
			}
		};

		data.characters.push(character);
	}

	cookies.set('CharacterSession', JSON.stringify(data), {
		path: '/',
		httpOnly: true,
		maxAge: 14_300 // 4 hours
	});
	return json(data);
}) satisfies RequestHandler;
