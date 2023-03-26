import type { RequestHandler } from '@sveltejs/kit';
import { addSecondsToDate } from '$lib/utils';
import { error, json, redirect } from '@sveltejs/kit';
import type ISession from '$interfaces/ISession';
import { SECRET_API_KEY, SECRET_CLIENT_ID, SECRET_CLIENT_SECRET } from '$env/static/private';
import { PUBLIC_API_ROOT, PUBLIC_PATH } from '$env/static/public';
import type IResponse from '$interfaces/IResponse';

export const GET = (async ({ cookies, fetch }) => {
	// Variable declaration
	const sessionCookie = cookies.get('Session');
	if (!sessionCookie) {
		throw error(500, { message: 'No session cookie was found', errorId: crypto.randomUUID() });
	}
	const session = JSON.parse(sessionCookie) as ISession;

	const authUrl = `${PUBLIC_API_ROOT}/App/OAuth/Token/`;
	const authToken = btoa(`${SECRET_CLIENT_ID}:${SECRET_CLIENT_SECRET}`);

	// Only renew if token expired or 5 minutes before
	if (addSecondsToDate(new Date(), 3600) < new Date(session.access.expirationDate)) {
		return json(session);
	}

	// If refresh token expired (or expires in next 5 minutes, redirect to login page
	if (addSecondsToDate(new Date(), 3600) > new Date(session.refresh.expirationDate)) {
		throw redirect(303, `${PUBLIC_PATH}/api/auth/login`);
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
			message: `Something went wrong refreshing the bungie access token: '${accessRequest.statusText}'`,
			errorId: crypto.randomUUID()
		});
	}
	// Extract data
	const accessData = await accessRequest.json();

	// Build new return data
	const returnData: IResponse<ISession> = {
		data: {
			...session,
			access: {
				token: accessData.access_token,
				expirationDate: addSecondsToDate(new Date(), accessData.expires_in)
			},
			refresh: {
				token: accessData.refresh_token,
				expirationDate: addSecondsToDate(new Date(), accessData.refresh_expires_in)
			}
		},
		status: 'ok',
		message: ''
	};

	cookies.set('Session', JSON.stringify(returnData.data), {
		path: '/',
		httpOnly: true,
		maxAge: accessData.refresh_expires_in
	});

	return json(returnData);
}) satisfies RequestHandler;
