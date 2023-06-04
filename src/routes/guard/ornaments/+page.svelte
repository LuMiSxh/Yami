<script lang="ts">
	import type { PageData } from './$types';
	import type ICharacter from '$interfaces/destiny/ICharacter';
	import type IItemManifest from '$interfaces/destiny/manifest/IItemManifest';

	import {
		Grid,
		Row,
		Column,
		Dropdown,
		ImageLoader,
		SkeletonPlaceholder,
		Button,
		InlineLoading,
		Tag
	} from 'carbon-components-svelte';
	import Tooltip from '$components/Tooltip.svelte';
	import { asyncDelay } from '$lib/utils';

	export let data: PageData;
	let characters = data['character'];
	let ornaments = data['ornament'];

	const dropdownList = [];
	for (const [i, char] of characters.entries()) {
		dropdownList.push({ id: i, char: char });
	}

	let index = 0;
	let current_char: ICharacter = characters[index];

	$: current_char = characters[index];

	// listen

	let chunkSize = 7;

	function generateList(list: IItemManifest[]): IItemManifest[][] {
		const temp = [];
		for (let i = 0; i < list.length; i += chunkSize) {
			const chunk = list.slice(i, i + chunkSize);
			temp.push(chunk);
		}
		return temp;
	}

	let obtainedList = [];
	$: obtainedList = generateList(ornaments[current_char.id]['obtained']);

	let unobtainedList = [];
	$: unobtainedList = generateList(ornaments[current_char.id]['unobtained']);

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
		const ornamentRequest = await fetch(`/api/obtain/ornaments`);
		if (ornamentRequest.status !== 200) {
			throw Error((await ornamentRequest.json()).message);
		}

		data = {
			ornament: { ...(await ornamentRequest.json()) },
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
		<!-- Refresh -->
		<Column style="align-items: end; display: flex; flex-direction: row; justify-content: center;">
			<Button on:click={press} style="margin: 0.5rem; height: 50%;">
				<InlineLoading status={state} description={status} />
			</Button>
		</Column>
	</Row>
	<!-- Ornament Stats -->
	<Row style="margin-bottom: 1.25rem; margin-top: 1.25rem;">
		<Column padding>
			<h1>
				{ornaments[current_char.id].unobtained.length + ornaments[current_char.id].obtained.length}
			</h1>
			<h2 style="font-weight: bold; color: #0f62fe;">Total</h2>
		</Column>
		<Column padding>
			<h1>{ornaments[current_char.id].obtained.length}</h1>
			<h2 style="font-weight: bold; color: #0f62fe;">Obtained</h2>
		</Column>
		<Column padding>
			<h1>{ornaments[current_char.id].unobtained.length}</h1>
			<h2 style="font-weight: bold; color: #0f62fe;">Unobtained</h2>
		</Column>
	</Row>
	<!-- Ornament Visualization -->
	{#each obtainedList as obChunk}
		<Row style="margin-bottom: 1.25rem; margin-top: 1.25rem; display: flex; justify-items: center">
			{#each obChunk as obItem}
				<Column padding sm={1} md={2} lg={2}>
					<Tooltip>
						<div
							style="position: relative; min-width: 48px; min-height: 48px; width: 96px; height: 96px;"
						>
							<SkeletonPlaceholder
								style="min-width: 48px; min-height: 48px; width: 96px; height: 96px; aspect-ratio: 1/1; position: absolute; top: 0; left: 0;"
							/>
							<img
								alt=""
								src={obItem.displayProperties.icon}
								style="min-width: 48px; min-height: 48px; width: 96px; height: 96px; aspect-ratio: 1/1; position: absolute; top: 0; left: 0;"
							/>
							<img
								alt=""
								src={obItem.displayProperties.watermark}
								style="min-width: 48px; min-height: 48px; width: 96px; height: 96px; aspect-ratio: 1/1; position: absolute; top: 0; left: 0;"
							/>
						</div>
						<Tag slot="text" type="high-contrast"><h5>{obItem.displayProperties.name}</h5></Tag>
					</Tooltip>
				</Column>
			{/each}
		</Row>
	{/each}
	{#each unobtainedList as ubChunk}
		<Row style="margin-bottom: 1.25rem; margin-top: 1.25rem;">
			{#each ubChunk as ubItem}
				<Column padding sm={1} md={2} lg={2}>
					<Tooltip>
						<div
							style="position: relative; min-width: 48px; min-height: 48px; width: 96px; height: 96px;"
						>
							<SkeletonPlaceholder
								style="min-width: 48px; min-height: 48px; width: 96px; height: 96px; aspect-ratio: 1/1; position: absolute; top: 0; left: 0;"
							/>
							<img
								alt=""
								src={ubItem.displayProperties.icon}
								style="min-width: 48px; min-height: 48px; width: 96px; height: 96px; aspect-ratio: 1/1; position: absolute; top: 0; left: 0;"
							/>
							<img
								alt=""
								src={ubItem.displayProperties.watermark}
								style="min-width: 48px; min-height: 48px; width: 96px; height: 96px; aspect-ratio: 1/1; position: absolute; top: 0; left: 0; background: #00000040;"
							/>
						</div>
						<Tag slot="text" type="high-contrast"><h5>{ubItem.displayProperties.name}</h5></Tag>
					</Tooltip>
				</Column>
			{/each}
		</Row>
	{/each}
</Grid>

<style lang="postcss">
	:global(.bx--list-box__menu-item, .bx--list-box__menu-item__option) {
		height: auto;
	}
</style>
