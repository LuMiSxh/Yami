<script lang="ts">
	// Skeleton setup
	import 'shared/theme-lightblue.pcss';
	import '@skeletonlabs/skeleton/styles/all.css';
	import '../app.postcss';

	// Popup setup
	import { arrow, computePosition, flip, offset, shift } from '@floating-ui/dom';
	import type { PopupSettings } from '@skeletonlabs/skeleton';
	// Styling
	import { AppBar, AppShell, LightSwitch, popup, storePopup } from '@skeletonlabs/skeleton';
	import { navigating, page } from '$app/stores';
	import Loader from '@components/Loader.svelte';

	storePopup.set({ computePosition, flip, shift, offset, arrow });

	$: routes = [
		{
			Name: 'Home',
			Route: '/',
			Active: $page.url.pathname === '/'
		},
		{
			Name: 'Optimizer',
			Route: '/optimizer',
			Active: $page.url.pathname === '/optimizer'
		}
	];

	// Mobile popup
	let popupSettings: PopupSettings = {
		event: 'click',
		target: 'navigation',
		placement: 'bottom'
	};
</script>

<AppShell>
	<svelte:fragment slot="header">
		<AppBar class="hidden md:flex">
			<svelte:fragment slot="lead">
				<h1>Yami - LuMiSxh</h1>
			</svelte:fragment>
			<svelte:fragment slot="trail">
				{#each routes as route}
					<a
						href={route.Route}
						class="btn btn-base"
						class:variant-ghost-surface={!route.Active}
						class:ring-2={route.Active}
						class:ring-surface-500={route.Active}
						class:ring-inset={route.Active}
						class:variant-ghost-tertiary={route.Active}
						disabled={route.Active}>{route.Name}</a
					>
				{/each}
			</svelte:fragment>
		</AppBar>
		<AppBar class="md:hidden">
			<svelte:fragment slot="lead">
				<h1>Yami</h1>
			</svelte:fragment>
			<svelte:fragment slot="trail">
				<div class="relative">
					<button use:popup={popupSettings} class="btn variant-ghost-surface">Navigation </button>
					<nav class="list-nav card p-4 shadow-xl" data-popup="navigation">
						<ul>
							{#each routes as route}
								<li>
									<a
										href={route.Route}
										class="btn btn-base"
										class:variant-ghost-surface={!route.Active}
										class:ring-2={route.Active}
										class:ring-surface-500={route.Active}
										class:ring-inset={route.Active}
										class:variant-ghost-tertiary={route.Active}
										disabled={route.Active}
									>
										{route.Name}
									</a>
								</li>
							{/each}
						</ul>
					</nav>
				</div>
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>
	<!-- Router -->
	{#if $navigating}
		<Loader />
	{:else}
		<slot />
	{/if}
	<!--/ -->
	<!--Footer -->
	<svelte:fragment slot="pageFooter">
		{#if $page.url.pathname !== '/optimizer'}
			<div class="w-full h-[2px] bg-surface-500/50" />
			<div class="w-full h-32 grid grid-cols-2 grid-rows-1 justify-around z-50 p-2">
				<div class="flex flex-col justify-center items-center text-center">
					<h4>Designed by <span class="text-secondary-500">LuMiSxh</span></h4>
					<LightSwitch class="m-3" />
				</div>
				<div class="flex flex-col justify-center items-center text-center">
					<h4>Social Media</h4>
					<nav class="list-nav">
						<ul class="list">
							<li>
								<a
									href="https://www.bungie.net/7/de/User/Profile/2/4611686018492790408"
									rel="noreferrer"
									target="_blank">Bungie</a
								>
								<a href="https://github.com/LuMiSxh" rel="noreferrer" target="_blank">Github</a>
								<a href="https://twitter.com/LuMiSxh" rel="noreferrer" target="_blank">Twitter</a>
							</li>
						</ul>
					</nav>
				</div>
			</div>
		{/if}
	</svelte:fragment>
	<!--/ -->
</AppShell>
