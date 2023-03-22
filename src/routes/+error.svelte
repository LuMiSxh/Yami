<script>
	import { page } from '$app/stores';
</script>

<main class="h-full w-full p-5 flex flex-col justify-center items-center text-center">
	<aside class="alert variant-ghost-error w-1/3 h-1/3">
		<div class="alert-message">
			<h1>{$page.status}</h1>
			{#if $page.error.message}
				<p>{$page.error.message}</p>
				<pre>{$page.error.errorId}</pre>
			{:else}
				<p>An unknown error occurred</p>
			{/if}
		</div>
	</aside>
</main>
