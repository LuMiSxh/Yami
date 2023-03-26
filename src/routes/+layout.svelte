<script lang="ts">
	import 'carbon-components-svelte/css/g100.css';

	import {
		Header,
		HeaderNav,
		HeaderNavItem,
		SkipToContent,
		Content,
		Theme,
		SideNav,
		SideNavLink,
		SideNavItems,
		Loading
	} from 'carbon-components-svelte';
	import { navigating, page } from '$app/stores';

	$: routes = [
		{
			Name: 'Home',
			Route: '/',
			Active: $page.url.pathname === '/'
		},
		{
			Name: 'Optimizer',
			Route: '/guard/optimizer',
			Active: $page.url.pathname === '/guard/optimizer'
		}
	];

	let isSideNavOpen = false;
	let windowWidth;

	$: if (windowWidth > 640) isSideNavOpen = false;
</script>

<svelte:window bind:outerWidth={windowWidth} />

<Theme theme="g100" tokens={{}} />

<Header company="LuMiSxh" platformName="Yami" bind:isSideNavOpen>
	<svelte:fragment slot="skip-to-content">
		<SkipToContent />
	</svelte:fragment>
	<HeaderNav>
		{#each routes as route}
			<HeaderNavItem href={route.Route} text={route.Name} isSelected={route.Active} />
		{/each}
	</HeaderNav>
</Header>

<SideNav bind:isOpen={isSideNavOpen}>
	<SideNavItems>
		{#each routes as route}
			<SideNavLink href={route.Route} text={route.Name} isSelected={route.Active} />
		{/each}
	</SideNavItems>
</SideNav>

<Content>
	{#if $navigating}
		<Loading />
	{:else}
		<slot />
	{/if}
</Content>
