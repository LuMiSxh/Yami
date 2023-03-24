<script>
	import { page } from '$app/stores';
</script>

<main class="h-full w-full p-5 flex flex-col justify-center items-center text-center">
	<aside class="alert variant-ghost-error md:w-1/3 xl:h-1/3 md:3/4 w-1/2 h-1/2">
		<div class="alert-message">
			<h1>{$page.status}</h1>
			{#if $page.error.message}
				<p>{$page.error.message}</p>
				{#if $page.error.errorId}
					<div class="lg:pt-7 pt-3">
						<h3>Error code:</h3>
						<pre>{$page.error.errorId}</pre>
					</div>
				{/if}
			{:else}
				<p>An unknown error occurred</p>
			{/if}
		</div>
	</aside>
</main>
