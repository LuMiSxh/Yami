<script lang="ts">
	import type { PageData } from './$types';
	import type { ICharacter } from '@interfaces/ICharacters';
	import type IPower from '@interfaces/IPower';

	export let data: PageData;
	let characters = data['character'].characters as ICharacter[];
	let leveling = data['power'] as IPower;

	let current_char: ICharacter = characters[0];
	let current_char_armor;

	$: current_char_armor = leveling.Armor[current_char.id];
	let waiting = false;

	// async button function
	async function press() {
		waiting = true;
		await refresh();
		waiting = false;
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

<div
	class="min-h-full w-full flex flex-col justify-center items-center content-center"
	id="bg1"
	style="--r:{current_char.emblem.color[0]};--g:{current_char.emblem.color[1]};--b:{current_char
		.emblem.color[2]};"
>
	<div
		class="flex md:flex-row flex-col h-1/3 md:w-2/3 w-full justify-center items-center content-center"
	>
		{#each characters as char, i}
			{#if char.id === current_char.id}
				<div
					class="sm:w-[474px] sm:h-[96px] w-[316px] h-[64px] aspect-[79/16] relative m-2 justify-end p-2 drop-shadow-md"
				>
					<img
						alt=""
						src={char.emblem.background}
						class="h-full w-full absolute top-0 left-0 z-10"
					/>
					<div class="h-full w-full absolute top-0 left-0 z-20">
						<div class="h-full w-full flex justify-end">
							<h2 class="bg-surface-500/75 rounded-full w-min h-min p-1 m-2 !text-white">
								{char.class}
							</h2>
						</div>
					</div>
				</div>
			{:else}
				<button
					class="sm:w-[96px] sm:h-[96px] w-[64px] h-[64px] aspect-[1/1] m-2 justify-center drop-shadow-md"
					on:click={() => (current_char = characters[i])}
				>
					<img alt="" src={char.emblem.icon} class="h-full w-full" />
				</button>
			{/if}
		{/each}
	</div>
	<div class="h-full w-2/3">
		<div class="grid grid-cols-2 grid-rows-1 w-full h-[90%] md:pt-5 pt-20">
			<div class="grid grid-cols-1 grid-rows-3 h-full w-full">
				<div
					class="flex flex-row justify-center content-center text-center md:m-1 drop-shadow-md h-1/2 md:h-full m-2.5 md:m-auto"
				>
					<div class="flex flex-col justify-center items-center">
						<p>Kinetic</p>
						<h2>{leveling.kinetic.power}</h2>
					</div>
					<img
						alt=""
						src={leveling.kinetic.definition.displayProperties.icon}
						class="aspect-square sm:w-[96px] sm:h-[96px] w-[64px] h-[64px] m-auto ml-2 mr-2"
					/>
				</div>
				<div
					class="flex flex-row justify-center content-center text-center md:m-1 drop-shadow-md h-1/2 md:h-full m-2.5 md:m-auto"
				>
					<div class="flex flex-col justify-center items-center">
						<p>Energy</p>
						<h2>{leveling.energy.power}</h2>
					</div>
					<img
						alt=""
						src={leveling.energy.definition.displayProperties.icon}
						class="aspect-square sm:w-[96px] sm:h-[96px] w-[64px] h-[64px] m-auto ml-2 mr-2"
					/>
				</div>
				<div
					class="flex flex-row justify-center content-center text-center m-1 drop-shadow-md h-1/2 md:h-full m-2.5 md:m-auto"
				>
					<div class="flex flex-col justify-center items-center">
						<p>Power</p>
						<h2>{leveling.power.power}</h2>
					</div>
					<img
						alt=""
						src={leveling.power.definition.displayProperties.icon}
						class="aspect-square sm:w-[96px] sm:h-[96px] w-[64px] h-[64px] m-auto ml-2 mr-2"
					/>
				</div>
			</div>
			<div class="grid grid-cols1 grid-rows-5 h-full w-full">
				<div class="flex flex-row justify-center content-center text-center m-2.5 drop-shadow-md">
					<div class="flex flex-col justify-center items-center">
						<p>Helmet</p>
						<h2>{current_char_armor.helmet.power}</h2>
					</div>
					<img
						alt=""
						src={current_char_armor.helmet.definition.displayProperties.icon}
						class="aspect-square sm:w-[96px] sm:h-[96px] w-[64px] h-[64px] m-auto ml-2 mr-2"
					/>
				</div>
				<div class="flex flex-row justify-center content-center text-center m-2.5 drop-shadow-md">
					<div class="flex flex-col justify-center items-center">
						<p>Gauntlet</p>
						<h2>{current_char_armor.gauntlet.power}</h2>
					</div>
					<img
						alt=""
						src={current_char_armor.gauntlet.definition.displayProperties.icon}
						class="aspect-square sm:w-[96px] sm:h-[96px] w-[64px] h-[64px] m-auto ml-2 mr-2"
					/>
				</div>
				<div class="flex flex-row justify-center content-center text-center m-2.5 drop-shadow-md">
					<div class="flex flex-col justify-center items-center">
						<p>Chest</p>
						<h2>{current_char_armor.chest.power}</h2>
					</div>
					<img
						alt=""
						src={current_char_armor.chest.definition.displayProperties.icon}
						class="aspect-square sm:w-[96px] sm:h-[96px] w-[64px] h-[64px] m-auto ml-2 mr-2"
					/>
				</div>
				<div class="flex flex-row justify-center content-center text-center m-2.5 drop-shadow-md">
					<div class="flex flex-col justify-center items-center">
						<p>Leg</p>
						<h2>{current_char_armor.leg.power}</h2>
					</div>
					<img
						alt=""
						src={current_char_armor.leg.definition.displayProperties.icon}
						class="aspect-square sm:w-[96px] sm:h-[96px] w-[64px] h-[64px] m-auto ml-2 mr-2"
					/>
				</div>
				<div class="flex flex-row justify-center content-center text-center m-2.5 drop-shadow-md">
					<div class="flex flex-col justify-center items-center">
						<p>Class Item</p>
						<h2>{current_char_armor.class.power}</h2>
					</div>
					<img
						alt=""
						src={current_char_armor.class.definition.displayProperties.icon}
						class="aspect-square sm:w-[96px] sm:h-[96px] w-[64px] h-[64px] m-auto ml-2 mr-2"
					/>
				</div>
			</div>
		</div>
		<div class="w-full h-[10%] flex justify-center md:m-auto m-4">
			<div class="flex flex-col justify-center items-center p-2 m-5 drop-shadow-md">
				<p>Power</p>
				<h2>
					{current_char_armor.power.full}
					<span class="text-secondary-500"
						><span class="font-bold">{current_char_armor.power.partial}</span>/8</span
					>
				</h2>
			</div>
			<button class="btn btn base variant-soft-error m-5 drop-shadow-md" on:click={press}>
				{#if waiting}
					Loading...
				{:else}
					Refresh
				{/if}
			</button>
		</div>
	</div>
</div>

<style>
	#bg1 {
		background: radial-gradient(
				circle at bottom right,
				rgba(var(--r), var(--g), var(--b), 230),
				transparent 60%
			)
			no-repeat bottom right;
		background-size: cover;
	}
</style>
