<script lang="ts">
	import type { LayoutData } from './$types';
	import { onMount } from 'svelte';
	import { error } from '@sveltejs/kit';
	import type ISession from '@interfaces/ISession';

	export let data: LayoutData;

	// Sets the initial value for the expiry time
	let expires_in: number = Math.floor(
		(new Date(data['session'].access.expirationDate).getTime() - new Date().getTime()) / 1000
	);

	// Automatically update it when the token expired
	onMount(async () => {
		// Updating the expiry time
		setInterval(async () => {
			expires_in -= 1;
			if (expires_in <= 0) {
				await refresh();
			}
		}, 1000);
	});

	// Function for refreshing
	async function refresh() {
		const response = await fetch('api/auth/token-renewal');
		if (response.status !== 200) {
			const responseError = await response.json();
			throw error(500, { message: responseError.message, errorId: responseError.errorId });
		}
		const response_data = (await response.json()) as ISession;
		data = { ...response_data };
		expires_in = Math.floor(
			(new Date(data['session'].access.expirationDate).getTime() - new Date().getTime()) / 1000
		);
	}
</script>

<slot />
