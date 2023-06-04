import type { RequestHandler } from '@sveltejs/kit';
import { error, json } from '@sveltejs/kit';
import { SECRET_API_KEY } from '$env/static/private';
import { PUBLIC_API_ROOT } from '$env/static/public';
import type IItemManifest from '$interfaces/destiny/manifest/IItemManifest';
import type IActivityManifest from '$interfaces/destiny/manifest/IActivityManifest';
import type IResponse from '$interfaces/IResponse';

const CACHE: Record<
	string,
	{ version: string; data: Record<string, IItemManifest | IActivityManifest> }
> = {};

export const GET = (async ({ url }) => {
	// Check type
	const manifestType = url.searchParams.get('manifest') ?? 'DestinyInventoryItemLiteDefinition';
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

	// Check if in cache and if so and version is the same, return the cache
	if (CACHE[manifestType]) {
		if (CACHE[manifestType].version === manifestVersion) {
			const returnData: IResponse<Record<string, IItemManifest | IActivityManifest>> = {
				data: CACHE[manifestType].data,
				status: 'ok',
				message: manifestType
			};
			return json(returnData);
		}
	}

	// Fetch item manifest
	const manifestRequest = await fetch(
		`https://bungie.net${manifestPathData.Response.jsonWorldComponentContentPaths.en[manifestType]}`,
		{
			headers: {
				'X-API-Key': SECRET_API_KEY
			}
		}
	);
	// Check itemManifestResponse
	if (manifestRequest.status !== 200) {
		throw error(500, {
			message: `Something went wrong obtaining the DestinyInventoryItemLiteDefinition manifest: '${manifestRequest.statusText}'`,
			errorId: crypto.randomUUID()
		});
	}
	// Extract data
	const manifestData = await manifestRequest.json();

	// Separating onto the different Categories
	if (manifestType === 'DestinyInventoryItemLiteDefinition') {
		const cleanManifest: Record<string, IItemManifest> = {};

		for (const [item_hash, obj] of Object.entries<
			IItemManifest & { iconWatermark: string | undefined }
		>(manifestData)) {
			const temp_data: IItemManifest = {
				displayProperties: {
					name: obj.displayProperties.name,
					icon: obj.displayProperties.icon
						? 'https://bungie.net' + obj.displayProperties.icon
						: undefined,
					watermark: obj.iconWatermark ? 'https://bungie.net' + obj.iconWatermark : undefined
				},
				itemTypeDisplayName: obj.itemTypeDisplayName,
				itemCategoryHashes: obj.itemCategoryHashes,
				classType: obj.classType,
				itemSubType: obj.itemSubType,
				itemTypeAndTierDisplayName: obj.itemTypeAndTierDisplayName ?? undefined
			};
			if (obj.itemCategoryHashes) {
				if (
					// Weapons
					[2, 3, 4].includes(obj.itemCategoryHashes['0'] as number) ||
					// Armor
					[45, 46, 47, 48, 49].includes(obj.itemCategoryHashes['1'] as number) ||
					// Ornaments
					[1742617626].includes(obj.itemCategoryHashes['4'] as number)
				) {
					cleanManifest[item_hash] = temp_data;
				}
			}
		}

		CACHE[manifestType] = { version: manifestVersion, data: cleanManifest };

		const returnData: IResponse<Record<string, IItemManifest>> = {
			data: cleanManifest,
			status: 'ok',
			message: ''
		};

		return json(returnData);
	}

	if (manifestType === 'DestinyActivityDefinition') {
		const cleanManifest: Record<string, IActivityManifest> = {};

		for (const [item_hash, obj] of Object.entries<IActivityManifest>(manifestData)) {
			cleanManifest[item_hash] = {
				displayProperties: {
					name: obj.displayProperties.name,
					icon: 'https://bungie.net' + obj.displayProperties.icon ?? undefined
				},
				completionUnlockHash: obj.completionUnlockHash,
				activityLightLevel: obj.activityLightLevel,
				destinationHash: obj.destinationHash,
				placeHash: obj.placeHash,
				activityTypeHash: obj.activityTypeHash,
				matchmaking: obj.matchmaking,
				directActivityModeHash: obj.directActivityModeHash,
				directActivityModeType: obj.directActivityModeType,
				activityModeHashes: obj.activityModeHashes,
				activityModeTypes: obj.activityModeTypes,
				hash: obj.hash
			};
		}

		CACHE[manifestType] = { version: manifestVersion, data: cleanManifest };
		const returnData: IResponse<Record<string, IActivityManifest>> = {
			data: cleanManifest,
			status: 'ok',
			message: ''
		};

		return json(returnData);
	}

	throw error(500, {
		message: "No valid 'manifest' parameter was supplied",
		errorId: 'ee2eacb4-c8d8-11ed-afa1-0242ac120002'
	});
}) satisfies RequestHandler;
