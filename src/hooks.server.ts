import * as SentryNode from '@sentry/node';
import '@sentry/tracing';
import type { HandleServerError } from '@sveltejs/kit';
import { PUBLIC_ENV, PUBLIC_SENTRY_DSN } from '$env/static/public';
import * as SentrySvelte from '@sentry/svelte';

SentryNode.init({
	dsn: PUBLIC_SENTRY_DSN,
	tracesSampleRate: 1.0,
	// Add the Http integration for tracing
	integrations: [new SentryNode.Integrations.Http()]
});

SentryNode.setTag('SvelteKit', 'Browser');

export const handleError = (({ error, event }) => {
	const errorId = crypto.randomUUID();

	if (PUBLIC_ENV === 'dev') {
		SentrySvelte.setTag('ENV', 'Dev');
	} else {
		SentryNode.setTag('ENV', 'Prod');
	}

	SentryNode.setTag('Error ID', errorId);

	SentryNode.captureException(error, {
		contexts: { Sveltekit: { event } },
		tags: { errorId: errorId }
	});

	return {
		message: (error as { message: string }).message,
		errorId: errorId
	};
}) satisfies HandleServerError;
