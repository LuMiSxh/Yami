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
	<div class="flex flex-col h-full w-2/3">
		<Accordion autocollapse>
			<AccordionItem open>
				<svelte:fragment slot="summary">
					<h4 class="text-secondary-500">What is Yami</h4>
				</svelte:fragment>
				<svelte:fragment slot="content">
					I would like to introduce you to Yami, a new interface for the Bungie API that allows us
					to calculate the individual power for all your Destiny 2 characters. Yami is a powerful
					tool that helps us provide accurate and up-to-date information about your Destiny 2
					characters.
				</svelte:fragment>
			</AccordionItem>
			<AccordionItem>
				<svelte:fragment slot="summary">
					<h4 class="text-secondary-500">What happens with my data</h4>
				</svelte:fragment>
				<svelte:fragment slot="content">
					I would like to inform you that the data exchanged between the Bungie API and our website
					is only temporarily stored on the Yami servers and then saved as a cookie in your browser.
					This means that the data is not permanently stored on the servers and will only be
					accessible to you while using our website. Furthermore, I would like to assure you that
					the data exchange between the Bungie API and this website uses OAuth, which is a secure
					authentication protocol that ensures no third party can spy on your data.
				</svelte:fragment>
			</AccordionItem>
			<AccordionItem>
				<svelte:fragment slot="summary">
					<h4 class="text-tertiary-500">Cookie policy</h4>
				</svelte:fragment>
				<svelte:fragment slot="content">
					I take your privacy seriously and want to inform you about the websites cookie policy.
					Yami only uses technical cookies that are essential for the proper functioning of this
					website. These cookies are small text files that are stored on your device to provide you
					with a better browsing experience. They allow the website to remember your preferences and
					settings, and to ensure the smooth and fast operation of this website. I want to reassure
					you that I do not use any advertisement cookies on this website. I understand the
					importance of protecting your personal data, and I take great care to ensure that my
					website is secure and non-invasive. Please be aware that by using this website, you
					consent to the use of technical cookies that are required for its operation. If you do not
					wish to accept these cookies, you may disable them in your browser settings. However,
					please note that this will affect the functionality of the website.
				</svelte:fragment>
			</AccordionItem>
		</Accordion>
	</div>
</div>
