import type { RequestHandler } from '@sveltejs/kit';
import { error, json } from '@sveltejs/kit';
import { SECRET_API_KEY } from '$env/static/private';
import type IItemManifest from '@interfaces/IItemManifest';
import type { IItemManifestDefinition } from '@interfaces/IItemManifest';
import type ISession from '@interfaces/ISession';

// CACHE
let cached_manifest: IItemManifest | undefined;

export const POST = (async ({ request }) => {
	// Variable declaration
	const session = (await request.json()) as ISession;

	// Fetch manifest paths
	const manifestPathRequest = await fetch('https://bungie.net/Platform/Destiny2/Manifest/', {
		headers: {
			Authorization: `Bearer ${session.access.token}`,
			'X-API-Key': SECRET_API_KEY
		}
	});
	// Check manifestPathRequest
	if (manifestPathRequest.status !== 200) {
		throw error(500, {
			message: `Something went wrong obtaining the manifest paths: '${
				(await manifestPathRequest.json()).Message
			}'`,
			errorId: crypto.randomUUID()
		});
	}
	// Extract data
	const manifestPathData = await manifestPathRequest.json();
	const manifestVersion = manifestPathData.Response.version;

	// If manifest in cache and version is the same, return the manifest from cache
	if (cached_manifest) {
		if (cached_manifest.version === manifestVersion) {
			return json(cached_manifest);
		}
	}

	// Fetch item manifest
	const itemManifestRequest = await fetch(
		`https://bungie.net${manifestPathData.Response.jsonWorldComponentContentPaths.en.DestinyInventoryItemLiteDefinition}`,
		{
			headers: {
				Authorization: `Bearer ${session.access.token}`,
				'X-API-Key': SECRET_API_KEY
			}
		}
	);
	// Check itemManifestResponse
	if (itemManifestRequest.status !== 200) {
		throw error(500, {
			message: `Something went wrong obtaining the DestinyInventoryItemLiteDefinition manifest: '${
				(await itemManifestRequest.json()).Message
			}'`,
			errorId: crypto.randomUUID()
		});
	}
	// Extract data
	const itemManifestData = await itemManifestRequest.json();

	// Cleanup
	const cleanManifest: Record<string, IItemManifestDefinition> = {};
	for (const [item_hash, obj] of Object.entries<IItemManifestDefinition>(itemManifestData)) {
		const temp_data: IItemManifestDefinition = {
			displayProperties: {
				name: obj.displayProperties.name,
				icon: 'https://bungie.net' + obj.displayProperties.icon ?? undefined
			},
			itemTypeDisplayName: obj.itemTypeDisplayName,
			itemCategoryHashes: obj.itemCategoryHashes,
			classType: obj.classType
		};
		if (obj.itemCategoryHashes) {
			if (
				[2, 3, 4].includes(obj.itemCategoryHashes['0'] as number) ||
				[45, 46, 47, 48, 49].includes(obj.itemCategoryHashes['1'] as number)
			) {
				cleanManifest[item_hash] = temp_data;
			}
		}
	}

	const returnData: IItemManifest = {
		version: manifestVersion,
		definitions: cleanManifest
	};

	// Set cache
	cached_manifest = returnData;

	return json(returnData);
}) satisfies RequestHandler;
