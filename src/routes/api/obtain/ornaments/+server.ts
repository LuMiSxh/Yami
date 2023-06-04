import type { RequestHandler } from '@sveltejs/kit';
import { error, json } from '@sveltejs/kit';
import type IItemManifest from '$interfaces/destiny/manifest/IItemManifest';
import type ISession from '$interfaces/ISession';
import { SECRET_API_KEY } from '$env/static/private';
import { PUBLIC_API_ROOT, PUBLIC_PATH } from '$env/static/public';
import type IResponse from '$interfaces/IResponse';
import type ICharacter from '$interfaces/destiny/ICharacter';

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
	const session = ((await sessionRequest.json()) as IResponse<ISession>).data;

	// Fetch characters
	const charactersRequest = await fetch(`${PUBLIC_PATH}/api/obtain/characters`);
	// Check charactersRequest
	if (charactersRequest.status !== 200) {
		const characterError = await charactersRequest.json();
		throw error(500, {
			message: characterError.message,
			errorId: characterError.errorId
		});
	}
	// Extract data
	const characterData = (await charactersRequest.json()) as IResponse<ICharacter[]>;

	// Fetch item manifest
	const manifestRequest = await fetch(
		`${PUBLIC_PATH}/api/obtain/manifest?manifest=DestinyInventoryItemLiteDefinition`
	);
	// Check manifestRequest
	if (manifestRequest.status !== 200) {
		const manifestError = await manifestRequest.json();
		throw error(500, {
			message: manifestError.message,
			errorId: manifestError.errorId
		});
	}
	// Extract data
	const manifestData = (await manifestRequest.json()) as IResponse<Record<string, IItemManifest>>;

	// Fetch profile plugs
	const profilePlugsRequest = await fetch(
		`${PUBLIC_API_ROOT}/Destiny2/${session.destiny2.membershipType}/Profile/${session.destiny2.membershipId}/?components=305`,
		{
			headers: {
				Authorization: `Bearer ${session.access.token}`,
				'X-API-Key': SECRET_API_KEY
			}
		}
	);

	// Check pr
	if (profilePlugsRequest.status !== 200) {
		console.log(await profilePlugsRequest.text());
		throw error(500, {
			message: `Something went wrong obtaining the plugs from your Destiny 2 profile: '${profilePlugsRequest.statusText}'`,
			errorId: crypto.randomUUID()
		});
	}
	// Extract data
	const profilePlugsData = await profilePlugsRequest.json();

	// Check if inventory items are available
	if (!profilePlugsData.Response.profilePlugSets.data) {
		throw error(500, {
			message: `There was a problem fetching your vault and characters inventory items`,
			errorId: crypto.randomUUID()
		});
	}

	// plug cleanup
	const plugs: string[] = [];
	for (const rawPlugs of Object.values<{ plugItemHash: number }[]>(
		profilePlugsData.Response.profilePlugSets.data.plugs
	)) {
		for (const rawPlug of rawPlugs) {
			plugs.push('' + rawPlug.plugItemHash);
		}
	}

	// character cleanup
	const charIndex: Record<number, string[]> = {};
	for (const char of characterData.data) {
		if (!charIndex[char.classId]) charIndex[char.classId] = [];
		charIndex[char.classId].push(char.id);
	}

	// Iterating Ornaments from Manifest and checking of they are obtained by the user
	const ornaments: Record<string, Record<'obtained' | 'unobtained', IItemManifest[]>> = {};
	for (const [hash, obj] of Object.entries(manifestData.data)) {
		if (
			obj.itemTypeAndTierDisplayName?.toLowerCase().includes('exotic') &&
			obj.itemTypeAndTierDisplayName?.toLowerCase().includes('ornament')
		) {
			if (obj.classType === 3) continue;
			for (const charId of charIndex[obj.classType]) {
				if (!ornaments[charId]) {
					ornaments[charId] = { obtained: [], unobtained: [] };
				}

				const obtained = plugs.includes(hash);

				ornaments[charId][obtained ? 'obtained' : 'unobtained'].push(obj);
			}
		}
	}

	const returnData: IResponse<Record<string, Record<'obtained' | 'unobtained', IItemManifest[]>>> =
		{
			data: ornaments,
			status: 'ok',
			message: ''
		};

	return json(returnData);
}) satisfies RequestHandler;
