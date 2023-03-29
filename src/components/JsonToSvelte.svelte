<script lang="ts">
	import {
		StructuredList,
		StructuredListHead,
		StructuredListRow,
		StructuredListCell,
		StructuredListBody,
		OutboundLink,
		CodeSnippet
	} from 'carbon-components-svelte';

	export let obj: Record<any, any>;
	export let max_depth: number;

	function isLink(value: unknown): boolean {
		if (typeof value === 'string') {
			return value.startsWith('https://');
		}
		return false;
	}

	function isNull(value: unknown): boolean {
		return typeof value === 'undefined';
	}

	function isRecord(value: unknown): boolean {
		return typeof value === 'object';
	}

	function isArray(value: unknown): boolean {
		return Array.isArray(value);
	}
</script>

<StructuredList condensed>
	<StructuredListHead>
		<StructuredListRow head>
			<StructuredListCell head>Key</StructuredListCell>
			<StructuredListCell head>Value</StructuredListCell>
		</StructuredListRow>
	</StructuredListHead>
	<StructuredListBody>
		{#each Object.entries(obj) as [key, value]}
			{#if !isNull(value)}
				<StructuredListRow>
					<StructuredListCell noWrap><span style="color: #0f62fe;">{key}</span></StructuredListCell>
					{#if max_depth <= 0}
						{#if isRecord(value)}
							<StructuredListCell>
								<CodeSnippet type="multi" code={JSON.stringify(value, undefined, 2)} />
							</StructuredListCell>
						{:else}
							<StructuredListCell>
								<CodeSnippet type="inline" code={value} />
							</StructuredListCell>
						{/if}
					{:else if isArray(value) && isRecord(value[0])}
						{#each value as item}
							<svelte:self obj={item} max_depth={max_depth - 1} />
						{/each}
					{:else if isArray(value) && !isRecord(value[0])}
						<StructuredListCell>
							{#each value as item}
								<CodeSnippet type="inline" code={item} />
							{/each}
						</StructuredListCell>
					{:else if isRecord(value)}
						<svelte:self obj={value} max_depth={max_depth - 1} />
					{:else if isLink(value)}
						<StructuredListCell>
							<OutboundLink href={value}>
								<CodeSnippet type="inline" code={value} />
							</OutboundLink>
						</StructuredListCell>
					{:else}
						<StructuredListCell>
							<CodeSnippet type="inline" code={value} />
						</StructuredListCell>
					{/if}
				</StructuredListRow>
			{/if}
		{/each}
	</StructuredListBody>
</StructuredList>
