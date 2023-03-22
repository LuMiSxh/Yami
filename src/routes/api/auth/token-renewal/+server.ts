import type { RequestHandler } from '@sveltejs/kit';
import { error, json } from '@sveltejs/kit';
import { SECRET_API_KEY, SECRET_CLIENT_ID, SECRET_CLIENT_SECRET } from '$env/static/private';
import type ISession from '@interfaces/ISession';
import { addSecondsToDate } from '@lib/utils';

export const GET = (async ({ cookies, fetch }) => {
	// Variable declaration
	const sessionCookie = cookies.get("Session");
	if (!sessionCookie) {
		throw error(500, { message: "No session cookie was found", errorId: crypto.randomUUID() });
	}
	const session = JSON.parse(sessionCookie) as ISession;

	const authUrl = 'https://www.bungie.net/Platform/App/OAuth/Token/';
	const authToken = btoa(`${SECRET_CLIENT_ID}:${SECRET_CLIENT_SECRET}`);
	const currentDate = new Date();

	// Only renew if token expired
	if (currentDate < new Date(session.access.expirationDate)) {
		return json(session);
	}

	// If refresh token expired, error
	if (currentDate > new Date(session.refresh.expirationDate)) {
		throw error(500, { message: 'The refresh token has expired', errorId: crypto.randomUUID() });
	}

	// Fetch new access token
	const accessRequest = await fetch(authUrl, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			Authorization: `Basic ${authToken}`,
			'X-API-Key': SECRET_API_KEY
		},
		body: `grant_type=refresh_token&refresh_token=${session.refresh.token}`
	});
	// Check accessRequest
	if (accessRequest.status !== 200) {
		throw error(500, {
			message: `Something went wrong refreshing the bungie access token: '${(await accessRequest.json()).Message ?? accessRequest.statusText}'`,
			errorId: crypto.randomUUID()
		});
	}
	// Extract data
	const accessData = await accessRequest.json();

	// Set new data
	session.access.expirationDate = addSecondsToDate(new Date(), accessData.expires_in);
	session.refresh.expirationDate = addSecondsToDate(new Date(), accessData.refresh_expires_in);

	cookies.set('Session', JSON.stringify(session), {
		path: '/',
		httpOnly: true,
		maxAge: accessData.refresh_expires_in
	});

	return json(session);
}) satisfies RequestHandler;
