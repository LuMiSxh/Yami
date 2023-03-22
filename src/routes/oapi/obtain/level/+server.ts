import type { RequestHandler } from '@sveltejs/kit';
import { error, json } from '@sveltejs/kit';
import { SECRET_API_KEY, SECRET_PATH } from '$env/static/private';
import type IAccessSession from '@interfaces/IAccessSession';
import type IItemManifestCookie from '@interfaces/IItemManifestCookie';
import type IItemManifest from '@interfaces/IItemManifest';
import type IItem from '@interfaces/IItem';
import type IPower from '@interfaces/IPower';

// sorting function
function power_sorter(a: IItem, b: IItem): number {
	if (a.power > b.power) {
		return -1;
	} else if (a.power < b.power) {
		return 1;
	}
	return 0;
}

export const GET = (async ({ cookies, fetch }) => {
	// Getting the access session
	const access_cookie = cookies.get('AccessSession');
	if (!access_cookie) {
		throw error(500, {
			message: 'No access session cookie was found',
			error_id: crypto.randomUUID()
		});
	}
	const access_data = JSON.parse(access_cookie) as IAccessSession;

	console.warn(access_data);

	// Getting the manifest
	const manifest_request = await fetch(`${SECRET_PATH}/api/obtain/manifest`);
	if (manifest_request.status !== 200) {
		throw error(500, {
			message: manifest_request.statusText,
			error_id: crypto.randomUUID()
		});
	}
	const manifest_data = (await manifest_request.json()) as IItemManifestCookie;

	// Fetch all profile character-power
	const profile_items_request = await fetch(
		`https://bungie.net/Platform/Destiny2/${access_data.d2.type}/Profile/${access_data.d2.id}/?components=102,201,205,300`,
		{
			headers: {
				Authorization: `Bearer ${access_data.access.token}`,
				'X-API-Key': SECRET_API_KEY
			}
		}
	);
	if (profile_items_request.status !== 200) {
		throw error(500, {
			message: `Something went wrong obtaining the items from your Destiny 2 profile: '${profile_items_request.statusText}'`,
			error_id: crypto.randomUUID()
		});
	}
	const profile_items_data = await profile_items_request.json();

	// Collecting all character-power here
	const item_instances: Record<
		string,
		{
			hash: number;
			instance_id: string;
			power: number;
			manifest: IItemManifest | undefined;
		}
	> = {};

	// Adding item instances
	for (const [instance_id, instance] of Object.entries<{
		primaryStat: { value: number; statHash: number } | undefined;
	}>(profile_items_data.Response.itemComponents.instances.data)) {
		if (!instance.primaryStat) continue;
		//      Weapon      Armor
		if (![1480404414, 3897883278].includes(instance.primaryStat.statHash)) continue;

		item_instances[instance_id] = {
			hash: 0,
			instance_id: instance_id,
			power: instance.primaryStat.value,
			manifest: undefined
		};
	}

	// Overlaying hash from vault
	for (const raw_item of profile_items_data.Response.profileInventory.data.items) {
		const item: { itemHash: number; itemInstanceId: string } = raw_item;
		if (!(item.itemInstanceId in item_instances)) continue;
		item_instances[item.itemInstanceId].hash = item.itemHash;
		item_instances[item.itemInstanceId].manifest = manifest_data.manifest[item.itemHash];
	}

	// Overlaying hash from character inventories
	for (const character of Object.values<{ items: { itemHash: number; itemInstanceId: string }[] }>(
		profile_items_data.Response.characterInventories.data
	)) {
		for (const item of character.items) {
			if (!(item.itemInstanceId in item_instances)) continue;
			item_instances[item.itemInstanceId].hash = item.itemHash;
			item_instances[item.itemInstanceId].manifest = manifest_data.manifest[item.itemHash];
		}
	}

	// Overlaying hash from character equipment
	for (const character of Object.values<{ items: { itemHash: number; itemInstanceId: string }[] }>(
		profile_items_data.Response.characterEquipment.data
	)) {
		for (const item of character.items) {
			if (!(item.itemInstanceId in item_instances)) continue;
			item_instances[item.itemInstanceId].hash = item.itemHash;
			item_instances[item.itemInstanceId].manifest = manifest_data.manifest[item.itemHash];
		}
	}

	const raw_item_collection: Record<string, IItem[]> = {
		kinetic: [],
		energy: [],
		power: [],
		// Titan
		'T:helmet': [],
		'T:gauntlet': [],
		'T:chest': [],
		'T:leg': [],
		'T:class': [],
		// Hunter
		'H:helmet': [],
		'H:gauntlet': [],
		'H:chest': [],
		'H:leg': [],
		'H:class': [],
		// Warlock
		'W:helmet': [],
		'W:gauntlet': [],
		'W:chest': [],
		'W:leg': [],
		'W:class': []
	};
	// Sorting into collection
	for (const item of Object.values(item_instances)) {
		// Determining the category
		let category = '';
		switch (item.manifest?.itemCategoryHashes['0']) {
			case 2:
				category = 'kinetic';
				break;
			case 3:
				category = 'energy';
				break;
			case 4:
				category = 'power';
				break;
			default: {
				switch (item.manifest?.itemCategoryHashes['1']) {
					case 45:
						category = 'helmet';
						break;
					case 46:
						category = 'gauntlet';
						break;
					case 47:
						category = 'chest';
						break;
					case 48:
						category = 'leg';
						break;
					case 49:
						category = 'class';
						break;
				}
			}
		}

		// Determining the class, if there is one
		let class_type = '';
		if (!['kinetic', 'energy', 'power'].includes(category)) {
			switch (item.manifest?.classType) {
				case 0: // Titan
					class_type = 'T:';
					break;
				case 1: // Hunter
					class_type = 'H:';
					break;
				case 2: // Warlock
					class_type = 'W:';
					break;
			}
		}

		// Adding it into their respective categories
		raw_item_collection[`${class_type}${category}`].push({
			definition: item.manifest as IItemManifest,
			power: item.power
		});
	}

	// Final collection
	const data: IPower = {
		kinetic: raw_item_collection.kinetic.sort(power_sorter)[0],
		energy: raw_item_collection.energy.sort(power_sorter)[0],
		power: raw_item_collection.power.sort(power_sorter)[0],
		// Titan
		Titan: {
			helmet: raw_item_collection['T:helmet'].sort(power_sorter)[0],
			gauntlet: raw_item_collection['T:gauntlet'].sort(power_sorter)[0],
			chest: raw_item_collection['T:chest'].sort(power_sorter)[0],
			leg: raw_item_collection['T:leg'].sort(power_sorter)[0],
			class: raw_item_collection['T:class'].sort(power_sorter)[0],
			power: {
				full: 0,
				partial: 0
			}
		},
		// Hunter
		Hunter: {
			helmet: raw_item_collection['H:helmet'].sort(power_sorter)[0] ?? 0,
			gauntlet: raw_item_collection['H:gauntlet'].sort(power_sorter)[0] ?? 0,
			chest: raw_item_collection['H:chest'].sort(power_sorter)[0] ?? 0,
			leg: raw_item_collection['H:leg'].sort(power_sorter)[0] ?? 0,
			class: raw_item_collection['H:class'].sort(power_sorter)[0] ?? 0,
			power: {
				full: 0,
				partial: 0
			}
		},
		// Warlock
		Warlock: {
			helmet: raw_item_collection['W:helmet'].sort(power_sorter)[0] ?? 0,
			gauntlet: raw_item_collection['W:gauntlet'].sort(power_sorter)[0] ?? 0,
			chest: raw_item_collection['W:chest'].sort(power_sorter)[0] ?? 0,
			leg: raw_item_collection['W:leg'].sort(power_sorter)[0] ?? 0,
			class: raw_item_collection['W:class'].sort(power_sorter)[0] ?? 0,
			power: {
				full: 0,
				partial: 0
			}
		}
	};

	// Calculations
	const weapons_power = data.kinetic.power + data.energy.power + data.power.power;
	const titan_armor =
		data.Titan.helmet.power +
		data.Titan.gauntlet.power +
		data.Titan.chest.power +
		data.Titan.leg.power +
		data.Titan.class.power;
	const hunter_armor =
		data.Hunter.helmet.power +
		data.Hunter.gauntlet.power +
		data.Hunter.chest.power +
		data.Hunter.leg.power +
		data.Hunter.class.power;
	const warlock_armor =
		data.Warlock.helmet.power +
		data.Warlock.gauntlet.power +
		data.Warlock.chest.power +
		data.Warlock.leg.power +
		data.Warlock.class.power;

	// Setting the calculations
	data.Titan.power = {
		full: Math.floor((titan_armor + weapons_power) / 8),
		partial: (titan_armor + weapons_power) % 8
	};
	data.Hunter.power = {
		full: Math.floor((hunter_armor + weapons_power) / 8),
		partial: (hunter_armor + weapons_power) % 8
	};
	data.Warlock.power = {
		full: Math.floor((warlock_armor + weapons_power) / 8),
		partial: (warlock_armor + weapons_power) % 8
	};

	return json(data);
}) satisfies RequestHandler;
