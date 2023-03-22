import * as SentrySvelte from '@sentry/svelte';
import { BrowserTracing } from '@sentry/tracing';
import type { HandleClientError } from '@sveltejs/kit';
import { PUBLIC_ENV, PUBLIC_SENTRY_DSN } from '$env/static/public';
import * as SentryNode from '@sentry/node';

SentrySvelte.init({
	dsn: PUBLIC_SENTRY_DSN,
	integrations: [new BrowserTracing()],
	tracesSampleRate: 1.0
});

SentrySvelte.setTag('SvelteKit', 'Browser');

export const handleError = (({ error, event }) => {
	const errorId = crypto.randomUUID();

	if (PUBLIC_ENV === 'dev') {
		SentrySvelte.setTag('ENV', 'Dev');
	} else {
		SentrySvelte.setTag('ENV', 'Prod');
	}

	SentryNode.setTag('Error ID', errorId);

	SentrySvelte.captureException(error, {
		contexts: { Sveltekit: { event } },
		tags: { errorId: errorId }
	});

	return {
		message: (error as { message: string }).message,
		errorId
	};
}) satisfies HandleClientError;
