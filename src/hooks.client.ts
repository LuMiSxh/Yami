import * as SentrySvelte from '@sentry/svelte';
import { BrowserTracing } from '@sentry/tracing';
import type { HandleClientError } from '@sveltejs/kit';

SentrySvelte.init({
	dsn: 'https://9f9edafcec2b4866a51f266e6cd9e613@o4504882910003200.ingest.sentry.io/4504882914066433',
	integrations: [new BrowserTracing()],
	tracesSampleRate: 1.0
});

SentrySvelte.setTag('svelteKit', 'browser');

// This will catch errors in load functions from +page.ts files
export const handleError = (({ error, event }) => {
	const error_id = crypto.randomUUID();

	SentrySvelte.captureException(error, {contexts: {Sveltekit: {event}}, extra: {errorId: { error_id }}});

	return {
		message: (error as { message: string }).message,
		error_id
	};
}) satisfies HandleClientError;
