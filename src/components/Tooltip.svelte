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
		<div style="position: absolute; top: -30%; left: 0; z-index: 40; min-width: max-content; min-height: max-content;" class="element {isHovered ? 'visible' : ''}">
			<slot name="text" />
	</div>
</div>


<style>
	.element {
		transition: opacity 0.3s;
		transition-timing-function: cubic-bezier(0.25, 0.1, 0, 0.1);
		opacity: 0;
	}

	.visible {
		opacity: 1;
	}
</style>