<script>
	import { page } from '$app/stores';
	import { Column, Grid, Row } from 'carbon-components-svelte';
</script>

<Grid>
	<Row>
		<Column>
			<h1 style="color: #0f62fe; font-weight: bold">
				I'm sorry but something went wrong: {$page.status}
			</h1>
		</Column>
	</Row>
	<Row padding>
		<Column>
			{#if $page.error.message}
				<h3>{$page.error.message}</h3>
			{:else}
				<h3>No error information available</h3>
			{/if}
		</Column>
		{#if $page.error.errorId}
			<Column>
				<h3>Error code:</h3>
				<pre>{$page.error.errorId}</pre>
			</Column>
		{/if}
	</Row>
</Grid>
