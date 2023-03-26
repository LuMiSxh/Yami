import type { RequestHandler } from '@sveltejs/kit';
import { error, json } from '@sveltejs/kit';
import type IItemManifest from '$interfaces/destiny/manifest/IItemManifest';
import type IItem from '$interfaces/extensions/IItem';
import type ISession from '$interfaces/ISession';
import type ICharacter from '$interfaces/destiny/ICharacter';
import type IPower from '$interfaces/IPower';
import { powerSorter } from '$lib/utils';
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

	// Fetch characters
	const charactersRequest = await fetch(`${PUBLIC_PATH}/api/obtain/characters`);
	// Check charactersRequest
	if (charactersRequest.status !== 200) {
		const characterError = await manifestRequest.json();
		throw error(500, {
			message: characterError.message,
			errorId: characterError.errorId
		});
	}
	// Extract data
	const characterData = (await charactersRequest.json()) as IResponse<ICharacter[]>;

	// Fetch profile character-power
	const profileItemsRequest = await fetch(
		`${PUBLIC_API_ROOT}/Destiny2/${session.destiny2.membershipType}/Profile/${session.destiny2.membershipId}/?components=102,201,205,300`,
		{
			headers: {
				Authorization: `Bearer ${session.access.token}`,
				'X-API-Key': SECRET_API_KEY
			}
		}
	);
	// Check profileItemsRequest
	if (profileItemsRequest.status !== 200) {
		console.log(await profileItemsRequest.text());
		throw error(500, {
			message: `Something went wrong obtaining the items from your Destiny 2 profile: '${profileItemsRequest.statusText}'`,
			errorId: crypto.randomUUID()
		});
	}
	// Extract data
	const profileItemsData = await profileItemsRequest.json();

	// Check if inventory items are available
	if (!profileItemsData.Response.profileInventory.data) {
		throw error(500, {
			message: `There was a problem fetching your vault and character inventory items`,
			errorId: crypto.randomUUID()
		});
	}

	// Collecting all character-power here
	const itemInstances: Record<
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
	}>(profileItemsData.Response.itemComponents.instances.data)) {
		if (!instance.primaryStat) continue;
		//      Weapon      Armor
		if (![1480404414, 3897883278].includes(instance.primaryStat.statHash)) continue;

		itemInstances[instance_id] = {
			hash: 0,
			instance_id: instance_id,
			power: instance.primaryStat.value,
			manifest: undefined
		};
	}

	// Overlaying hash from vault
	for (const raw_item of profileItemsData.Response.profileInventory.data.items) {
		const item: { itemHash: number; itemInstanceId: string } = raw_item;
		if (!itemInstances[item.itemInstanceId]) continue;
		itemInstances[item.itemInstanceId].hash = item.itemHash;
		itemInstances[item.itemInstanceId].manifest = manifestData.data[item.itemHash];
	}

	// Overlaying hash from character inventories
	for (const character of Object.values<{ items: { itemHash: number; itemInstanceId: string }[] }>(
		profileItemsData.Response.characterInventories.data
	)) {
		for (const item of character.items) {
			if (!(item.itemInstanceId in itemInstances)) continue;
			itemInstances[item.itemInstanceId].hash = item.itemHash;
			itemInstances[item.itemInstanceId].manifest = manifestData.data[item.itemHash];
		}
	}

	// Overlaying hash from character equipment
	for (const character of Object.values<{ items: { itemHash: number; itemInstanceId: string }[] }>(
		profileItemsData.Response.characterEquipment.data
	)) {
		for (const item of character.items) {
			if (!(item.itemInstanceId in itemInstances)) continue;
			itemInstances[item.itemInstanceId].hash = item.itemHash;
			itemInstances[item.itemInstanceId].manifest = manifestData.data[item.itemHash];
		}
	}

	// Map character name to ids
	const charMap: Record<string, string[]> = {};
	for (const char of characterData.data) {
		if (charMap[char.class] === undefined) {
			charMap[char.class] = [];
		}
		charMap[char.class].push(char.id);
	}

	// Item collection
	const weaponData: Record<string, IItem[]> = {
		kinetic: [],
		energy: [],
		power: []
	};

	const armorData: Record<string, Record<string, IItem[]>> = {};

	// Sorting into collection
	for (const item of Object.values(itemInstances)) {
		// Determining the category
		let category: string | undefined = undefined;
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

		if (category === undefined) continue;

		// Determining the class, if there is one
		let classType: string | undefined = undefined;
		if (!['kinetic', 'energy', 'power'].includes(category)) {
			switch (item.manifest?.classType) {
				case 0: // Titan
					classType = 'Titan';
					break;
				case 1: // Hunter
					classType = 'Hunter';
					break;
				case 2: // Warlock
					classType = 'Warlock';
					break;
			}
		}

		// Adding to respective item property
		if (classType === undefined) {
			weaponData[category].push({
				...(item.manifest as IItemManifest),
				power: item.power
			});
		} else {
			for (const charId of charMap[classType]) {
				if (armorData[charId] === undefined) {
					armorData[charId] = {};
				}
				if (armorData[charId][category] === undefined) {
					armorData[charId][category] = [];
				}
				armorData[charId][category].push({
					...(item.manifest as IItemManifest),
					power: item.power
				});
			}
		}
	}

	const weaponPower =
		weaponData.kinetic.sort(powerSorter)[0].power +
		weaponData.energy.sort(powerSorter)[0].power +
		weaponData.power.sort(powerSorter)[0].power;

	const tempArmorData: Record<
		string,
		{
			helmet: IItem;
			gauntlet: IItem;
			chest: IItem;
			leg: IItem;
			class: IItem;
			power: {
				full: number;
				partial: number;
			};
		}
	> = {};

	for (const [charId, char] of Object.entries(armorData)) {
		const helmet = char.helmet.sort(powerSorter)[0];
		const gauntlet = char.gauntlet.sort(powerSorter)[0];
		const chest = char.chest.sort(powerSorter)[0];
		const leg = char.leg.sort(powerSorter)[0];
		const class_ = char.class.sort(powerSorter)[0];

		const armorPower = helmet.power + gauntlet.power + chest.power + leg.power + class_.power;

		tempArmorData[charId] = {
			helmet,
			gauntlet,
			chest,
			leg,
			class: class_,
			// Calculate power
			power: {
				full: Math.floor((armorPower + weaponPower) / 8),
				partial: Math.floor((armorPower + weaponPower) % 8)
			}
		};
	}

	const returnData: IResponse<IPower> = {
		data: {
			kinetic: weaponData.kinetic.sort(powerSorter)[0],
			energy: weaponData.energy.sort(powerSorter)[0],
			power: weaponData.power.sort(powerSorter)[0],
			Armor: tempArmorData
		},
		status: 'ok',
		message: ''
	};
	return json(returnData);
}) satisfies RequestHandler;
