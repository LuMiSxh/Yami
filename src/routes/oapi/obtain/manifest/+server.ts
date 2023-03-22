import type { RequestHandler } from '@sveltejs/kit';
import { error, json } from '@sveltejs/kit';
import { SECRET_API_KEY } from '$env/static/private';
import type IAccessSession from '@interfaces/IAccessSession';
import type IItemManifest from '@interfaces/IItemManifest';
import type IItemManifestCookie from '@interfaces/IItemManifestCookie';

// CACHE
let cached_manifest: IItemManifestCookie | undefined;

export const GET = (async ({ cookies }) => {
	// Getting access session
	const access_cookie = cookies.get('AccessSession');
	if (!access_cookie) {
		throw error(500, {
			message: 'No access session cookie was found',
			error_id: crypto.randomUUID()
		});
	}
	const access_data = JSON.parse(access_cookie) as IAccessSession;

	// Retrieve manifest paths and version
	const manifest_path_response = await fetch('https://bungie.net/Platform/Destiny2/Manifest/', {
		headers: {
			Authorization: `Bearer ${access_data.access.token}`,
			'X-API-Key': SECRET_API_KEY
		}
	});
	if (manifest_path_response.status !== 200) {
		throw error(500, {
			message: `Something went wrong obtaining the manifest paths: '${manifest_path_response.statusText}'`,
			error_id: crypto.randomUUID()
		});
	}
	const manifest_path_data = await manifest_path_response.json();
	const manifest_version = manifest_path_data.Response.version;

	// If manifest in cache and version is the same, return the manifest from cache
	if (cached_manifest) {
		if (cached_manifest.version === manifest_version) {
			return json(cached_manifest);
		}
	}

	// No manifest in cookies or invalid => Retrieve new one
	const item_manifest_response = await fetch(
		`https://bungie.net${manifest_path_data.Response.jsonWorldComponentContentPaths.en.DestinyInventoryItemLiteDefinition}`,
		{
			headers: {
				Authorization: `Bearer ${access_data.access.token}`,
				'X-API-Key': SECRET_API_KEY
			}
		}
	);
	if (item_manifest_response.status !== 200) {
		throw error(500, {
			message: `Something went wrong obtaining the DestinyInventoryItemLiteDefinition manifest: '${item_manifest_response.statusText}'`,
			error_id: crypto.randomUUID()
		});
	}
	const item_manifest_data = await item_manifest_response.json();

	// Clean up the data
	const clean_item_manifest: Record<string, IItemManifest> = {};
	for (const [item_hash, obj] of Object.entries<IItemManifest>(item_manifest_data)) {
		const temp_data: IItemManifest = {
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
				clean_item_manifest[item_hash] = temp_data;
			}
		}
	}

	const data: IItemManifestCookie = {
		version: manifest_version,
		manifest: clean_item_manifest
	};

	// Set cache
	cached_manifest = data;

	return json(data);
}) satisfies RequestHandler;
