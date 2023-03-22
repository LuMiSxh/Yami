import * as SentryNode from '@sentry/node';
import '@sentry/tracing';
import type { HandleServerError } from '@sveltejs/kit';

SentryNode.init({
	dsn: 'https://9f9edafcec2b4866a51f266e6cd9e613@o4504882910003200.ingest.sentry.io/4504882914066433',
	tracesSampleRate: 1.0,
	// Add the Http integration for tracing
	integrations: [new SentryNode.Integrations.Http()]
});

SentryNode.setTag('svelteKit', 'server');

// use handleError to report errors during server-side data loading
export const handleError = (({ error, event }) => {
	const error_id = crypto.randomUUID();

	SentryNode.captureException(error, {contexts: {Sveltekit: {event}}, extra: {errorId: { error_id }}});

	return {
		message: (error as { message: string }).message,
		error_id
	};
}) satisfies HandleServerError;
