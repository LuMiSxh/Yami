import type { RequestHandler } from '@sveltejs/kit';
import { error, json } from '@sveltejs/kit';
import type ICharacter from '$interfaces/destiny/ICharacter';
import type ISession from '$interfaces/ISession';
import { SECRET_API_KEY } from '$env/static/private';
import { PUBLIC_API_ROOT, PUBLIC_PATH } from '$env/static/public';
import type IResponse from '$interfaces/IResponse';

export const GET = (async ({ fetch }) => {
	// Fetch session
	const sessionRequest = await fetch(`${PUBLIC_PATH}/api/auth/token-renewal`);
	// Check sessionRequest
	if (sessionRequest.status !== 200) {
		const sessionError = await sessionRequest.json();
		throw error(500, {
			message: sessionError.message,
			errorId: sessionError.errorId
		});
	}
	// Extract data
	const session = (await sessionRequest.json()).data as ISession;

	// Fetch characters
	const charactersRequest = await fetch(
		`${PUBLIC_API_ROOT}/Destiny2/${session.destiny2.membershipType}/Profile/${session.destiny2.membershipId}/?components=200`,
		{
			headers: {
				Authorization: `Bearer ${session.access.token}`,
				'X-API-Key': SECRET_API_KEY
			}
		}
	);
	// Check charactersRequest
	if (charactersRequest.status !== 200) {
		throw error(500, {
			message: `Something went wrong obtaining the Destiny2 character information: '${charactersRequest.statusText}'`,
			errorId: crypto.randomUUID()
		});
	}
	// Extract data
	const charactersData = await charactersRequest.json();

	const refresh = new Date();
	refresh.setDate(refresh.getDate() + 1);

	// Create Data and iterate characters
	const characters: IResponse<ICharacter[]> = {
		data: [],
		status: 'ok',
		message: ''
	};

	for (const char of Object.values<{
		characterId: string;
		classType: number;
		emblemPath: string;
		emblemBackgroundPath: string;
		emblemColor: { red: number; green: number; blue: number };
	}>(charactersData.Response.characters.data)) {
		let className: 'Titan' | 'Hunter' | 'Warlock' = 'Titan';

		switch (char.classType) {
			case 0:
				className = 'Titan';
				break;
			case 1:
				className = 'Hunter';
				break;
			case 2:
				className = 'Warlock';
				break;
		}

		const character: ICharacter = {
			id: char.characterId,
			class: className,
			emblem: {
				icon: 'https://bungie.net' + char.emblemPath,
				background: 'https://bungie.net' + char.emblemBackgroundPath,
				color: [char.emblemColor.red, char.emblemColor.green, char.emblemColor.blue]
			}
		};
		characters.data.push(character);
	}

	return json(characters);
}) satisfies RequestHandler;
