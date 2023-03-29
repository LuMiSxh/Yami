<script lang="ts">
	import type { PageData } from './$types';
	import type ICharacter from '$interfaces/destiny/ICharacter';
	import type IPower from '$interfaces/IPower';

	import {
		Grid,
		Row,
		Column,
		Dropdown,
		ImageLoader,
		SkeletonPlaceholder,
		Button,
		InlineLoading
	} from 'carbon-components-svelte';
	import { asyncDelay } from '$lib/utils';

	export let data: PageData;
	let characters = data['character'] as ICharacter[];
	let leveling = data['power'] as IPower;

	const dropdownList = [];
	for (const [i, char] of characters.entries()) {
		dropdownList.push({ id: i, char: char });
	}

	let index = 0;
	let current_char: ICharacter;

	$: current_char = characters[index];

	$: weapons = [
		{ type: 'Kinetic', data: leveling.kinetic },
		{ type: 'Energy', data: leveling.energy },
		{ type: 'Power', data: leveling.power }
	];

	$: armor = [
		{ type: 'Helmet', data: leveling.Armor[current_char.id].helmet },
		{ type: 'Gauntlet', data: leveling.Armor[current_char.id].gauntlet },
		{ type: 'Chest Armor', data: leveling.Armor[current_char.id].chest },
		{ type: 'Leg Armor', data: leveling.Armor[current_char.id].leg },
		{ type: 'Class Armor', data: leveling.Armor[current_char.id].class }
	];

	// async refresh function with loader variables
	let state: 'active' | 'inactive' | 'error' | 'finished' = 'inactive';
	let status = 'Refresh';

	async function press() {
		state = 'active';
		status = 'Loading...';
		try {
			await refresh();
			state = 'finished';
			status = 'Finished!';
		} catch (e) {
			state = 'error';
			status = `Something went wrong: '${e}'`;
		}

		await asyncDelay(4000);
		state = 'inactive';
		status = 'Refresh';
	}

	// Function used to refresh level details
	async function refresh() {
		const level_request = await fetch(`/api/obtain/character-power`);
		if (level_request.status !== 200) {
			throw Error((await level_request.json()).message);
		}

		data = {
			power: { ...(await level_request.json()) },
			...data
		};

		return;
	}
</script>

<Grid condensed>
	<!-- Character selection -->
	<Row style="margin-bottom: 3rem;">
		<Column padding>
			<h3 style="padding: 0.25rem">Current character:</h3>
			<Dropdown
				hideLabel
				itemToString={(item) => {
					return item.char.class + ' (' + item.char.id + ')';
				}}
				titleText="Current character"
				bind:selectedId={index}
				items={dropdownList}
				let:item
				let:index
			>
				<div style="display: flex; flex-direction: row; align-items: center;">
					<ImageLoader
						src={item.char.emblem.icon}
						style="width: 48px; height: 48px; padding: 0.25rem;"
					>
						<svelte:fragment slot="loading">
							<SkeletonPlaceholder style="width: 48px; height: 48px; padding: 0.25rem;" />
						</svelte:fragment>
					</ImageLoader>
					<strong
						style="color: rgb(var(--r), var(--g), var(--b)) !important; --r: {item.char.emblem
							.color[0]}; --g: {item.char.emblem.color[1]}; --b: {item.char.emblem.color[2]}"
						>{item.char.class}</strong
					>
				</div>
			</Dropdown>
		</Column>
		<!-- Powerlevel -->
		<Column
			style="align-items: center; display: flex; flex-direction: row; justify-content: center;"
		>
			<div style="display: flex; flex-direction: row; align-items: center;">
				<div style="padding-right: 1.5rem; margin: 0.5rem;">
					<h3>Powerlevel:</h3>
					<h2 style="color: #0f62fe;">
						<span style="font-weight: bold;">
							{leveling.Armor[current_char.id].power.full}
						</span>
						{leveling.Armor[current_char.id].power.partial}/8
					</h2>
				</div>
				<Button on:click={press} style="margin: 0.5rem; height: 50%;">
					<InlineLoading status={state} description={status} />
				</Button>
			</div>
		</Column>
	</Row>
	<!-- Item Data -->
	<Row style="margin-bottom: 1.25rem; margin-top: 1.25rem;">
		{#each weapons as weapon}
			<Column padding>
				<p style="font-weight: bold; color: #0f62fe">{weapon.type}</p>
				<h2>{weapon.data.power}</h2>
				<img
					alt=""
					src={weapon.data.displayProperties.icon}
					style="min-width: 48px; min-height: 48px; width: 96px; height: 96px; aspect-ratio: 1/1;"
				/>
			</Column>
		{/each}
	</Row>
	<Row padding>
		{#each armor as armorPiece, i}
			<Column style="margin-top: 1rem; margin-bottom: 1rem;">
				<p style="font-weight: bold; color: #0f62fe">{armorPiece.type}</p>
				<h2>{armorPiece.data.power}</h2>
				<img
					alt=""
					src={armorPiece.data.displayProperties.icon}
					style="min-width: 48px; min-height: 48px; width: 96px; height: 96px; aspect-ratio: 1/1;"
				/>
			</Column>
		{/each}
	</Row>
</Grid>

<style lang="postcss">
	:global(.bx--list-box__menu-item, .bx--list-box__menu-item__option) {
		height: auto;
	}
</style>
