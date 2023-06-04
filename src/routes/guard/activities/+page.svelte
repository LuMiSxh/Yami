<script lang="ts">
	import type { PageData } from './$types';
	import JsonToSvelte from '$components/JsonToSvelte.svelte';

	export let data: PageData;
</script>

<JsonToSvelte obj={data} max_depth={10} />
