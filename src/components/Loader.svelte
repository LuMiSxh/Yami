<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { blur } from 'svelte/transition';

	const information = [
		'Loading Profile...',
		'Loading Manifest...',
		'Loading Items...',
		'Loading Items...',
		'Loading Items...',
		'Loading takes longer than usual...'
	];

	let index = 0;
	let selected: string = information[0];

	let timer;

	onMount(() => {
		timer = setInterval(() => {
			if (index === information.length - 1) {
				selected = information[index];
			} else {
				index += 1;
				selected = information[index];
			}
		}, 2000);
	});

	onDestroy(() => {
		clearInterval(timer);
	});
</script>

<div class="container h-full mx-auto flex flex-col justify-center items-center" transition:blur>
	<div class="flex flex-row justify-even h-20 m-2.5">
		<div class="bg-primary-500 rounded-full w-6 min-h-16 m-2" id="b1" />
		<div class="bg-secondary-500 rounded-full w-6 min-h-16 m-2" id="b2" />
		<div class="bg-tertiary-500 rounded-full w-6 min-h-16 m-2" id="b3" />
	</div>
	<h2 transition:blur class="mt-5">{selected}</h2>
</div>

<style>
	@keyframes bounce {
		0% {
			transform: translateY(0);
			height: 100%;
		}
		50% {
			transform: translateY(-50%);
			height: 140%;
		}
		100% {
			transform: translateY(0);
			height: 100%;
		}
	}

	#b1 {
		animation-name: bounce;
		animation-duration: 1s;
		animation-iteration-count: infinite;
		animation-delay: 0s;
	}

	#b2 {
		animation-name: bounce;
		animation-duration: 1s;
		animation-iteration-count: infinite;
		animation-delay: 0.2s;
	}

	#b3 {
		animation-name: bounce;
		animation-duration: 1s;
		animation-iteration-count: infinite;
		animation-delay: 0.3s;
	}
</style>
