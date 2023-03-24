<script>
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
</script>

<!-- YOU CAN DELETE EVERYTHING IN THIS PAGE -->

<div class="h-full mx-auto flex flex-col items-center">
	<div class="flex flex-col justify-center items-center h-1/2 w-full">
		<h1 class="font-bold">
			<span
				class="bg-gradient-to-br from-secondary-500 to-tertiary-500 bg-clip-text text-transparent box-decoration-clone text-9xl"
				>Yami</span
			>
		</h1>
	</div>
	<div class="flex flex-col h-full w-2/3 md:mb-0 mb-10">
		<Accordion autocollapse>
			<AccordionItem open>
				<svelte:fragment slot="summary">
					<h4 class="text-secondary-500">What is Yami</h4>
				</svelte:fragment>
				<svelte:fragment slot="content">
					Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
					invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et
					accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata
					sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing
					elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed
					diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd
					gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
				</svelte:fragment>
			</AccordionItem>
			<AccordionItem>
				<svelte:fragment slot="summary">
					<h4 class="text-secondary-500">What happens with my data</h4>
				</svelte:fragment>
				<svelte:fragment slot="content">
					Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
					invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et
					accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata
					sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing
					elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed
					diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd
					gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
				</svelte:fragment>
			</AccordionItem>
			<AccordionItem>
				<svelte:fragment slot="summary">
					<h4 class="text-tertiary-500">Cookie policy</h4>
				</svelte:fragment>
				<svelte:fragment slot="content">
					Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
					invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et
					accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata
					sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing
					elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed
					diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd
					gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit
					amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
					dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores
					et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit
					amet.
				</svelte:fragment>
			</AccordionItem>
		</Accordion>
	</div>
</div>
