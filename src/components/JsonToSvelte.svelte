<script lang="ts">
	export let obj: Record<any, any>;
</script>

<div>
	{#each Object.entries(obj) as key, item}
		<pre>{key}:</pre>
		<pre><svelte:self obj={item} /></pre>
	{/each}
</div>
