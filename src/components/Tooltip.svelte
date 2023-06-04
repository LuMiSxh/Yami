<script lang="ts">
	let isHovered = false;
</script>

<div
	on:mouseover={() => (isHovered = true)}
	on:mouseout={() => (isHovered = false)}
	on:blur
	on:focus
	style="position: relative"
>
	<slot style="position: absolute; top: 0; left: 0;" />
	{#if isHovered === true}
		<div style="position: absolute; top: -30%; left: 0; z-index: 40">
			<slot name="text" />
		</div>
	{/if}
</div>
