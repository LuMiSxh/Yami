import type { RequestHandler } from '@sveltejs/kit';
import { error, json, redirect } from '@sveltejs/kit';
import type IItemManifest from '@interfaces/IItemManifest';
import type { IItemManifestDefinition } from '@interfaces/IItemManifest';
import { SECRET_API_KEY } from '$env/static/private';
import { PUBLIC_API_ROOT } from '$env/static/public';

export const GET = (async () => {
	// Fetch manifest paths
	const manifestPathRequest = await fetch(`${PUBLIC_API_ROOT}/Destiny2/Manifest/`, {
		headers: {
			'X-API-Key': SECRET_API_KEY
		}
	});
	// Check manifestPathRequest
	if (manifestPathRequest.status !== 200) {
		throw error(500, {
			message: `Something went wrong obtaining the manifest paths: '${manifestPathRequest.statusText}'`,
			errorId: crypto.randomUUID()
		});
	}
	// Extract data
	const manifestPathData = await manifestPathRequest.json();
	const manifestVersion = manifestPathData.Response.version;

	// Fetch item manifest
	const itemManifestRequest = await fetch(
		`https://bungie.net${manifestPathData.Response.jsonWorldComponentContentPaths.en.DestinyInventoryItemLiteDefinition}`,
		{
			headers: {
				'X-API-Key': SECRET_API_KEY
			}
		}
	);
	// Check itemManifestResponse
	if (itemManifestRequest.status !== 200) {
		throw error(500, {
			message: `Something went wrong obtaining the DestinyInventoryItemLiteDefinition manifest: '${itemManifestRequest.statusText}'`,
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

	return json(returnData);
}) satisfies RequestHandler;
