import type { RequestHandler } from '@sveltejs/kit';
import { error, json } from '@sveltejs/kit';
import { SECRET_API_KEY } from '$env/static/private';
import type ICharacters from '@interfaces/ICharacters';
import type { ICharacter } from '@interfaces/ICharacters';
import type ISession from '@interfaces/ISession';

export const POST = (async ({ request, fetch }) => {
	// Variable declaration
	const session = (await request.json()) as ISession;

	// Fetch characters
	const url = `https://bungie.net/Platform/Destiny2/${session.destiny2.membershipType}/Profile/${session.destiny2.membershipId}/?components=200`;
	const charactersRequest = await fetch(url, {
		headers: {
			Authorization: `Bearer ${session.access.token}`,
			'X-API-Key': SECRET_API_KEY
		}
	});
	// Check manifestPathResponse
	if (charactersRequest.status !== 200) {
		throw error(500, {
			message: `Something went wrong obtaining the Destiny2 character information: '${
				(await charactersRequest.json()).Message
			}'`,
			errorId: crypto.randomUUID()
		});
	}
	// Extract data
	const charactersData = await charactersRequest.json();

	const refresh = new Date();
	refresh.setDate(refresh.getDate() + 1);

	// Create Data and iterate characters
	const returnData: ICharacters = {
		characters: []
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
		returnData.characters.push(character);
	}

	return json(returnData);
}) satisfies RequestHandler;
