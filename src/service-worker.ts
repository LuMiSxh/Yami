/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

const sw = self as unknown as ServiceWorkerGlobalScope;

import { build, files, version } from '$service-worker';

const CACHE = `cache-${version}`;

const ASSETS = [
	// Pages
	'/',
	'/authorized',
	// Build and static files
	...build,
	...files
];

sw.addEventListener('install', (event) => {
	async function addFilesToCache() {
		const cache = await caches.open(CACHE);
		await cache.addAll(ASSETS);
	}

	event.waitUntil(addFilesToCache());
});

sw.addEventListener('activate', (event) => {
	async function deleteOldCaches() {
		for (const key of await caches.keys()) {
			if (key !== CACHE) await caches.delete(key);
		}
	}

	event.waitUntil(deleteOldCaches());
});

sw.addEventListener('fetch', (event) => {
	const cacheableApiRoutes = ['/api/obtain/item-manifest', '/api/obtain/characters'];
	console.log(event.request.url);
	if (event.request.method !== 'GET') return;
	if (!cacheableApiRoutes.includes(new URL(event.request.url).pathname)) return;

	async function respond() {
		const url = new URL(event.request.url);
		const cache = await caches.open(CACHE);

		// If route is cacheable, cache it
		if (cacheableApiRoutes.includes(url.pathname) && !(await cache.match(url.pathname))) {
			const fetchResponse = await fetch(event.request.url);
			await cache.put(event.request.url, fetchResponse.clone());
			return fetchResponse;
		}

		// Return cached data
		if (await cache.match(url.pathname)) {
			return cache.match(url.pathname) as Promise<Response>;
		}

		return fetch(url);
	}

	event.respondWith(respond());
});
