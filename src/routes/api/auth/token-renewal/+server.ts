import type { RequestHandler } from '@sveltejs/kit';
import { SECRET_CLIENT_ID, SECRET_API_KEY, SECRET_CLIENT_SECRET } from '$env/static/private';
import { error, json } from '@sveltejs/kit';
import type IAccessSession from '@interfaces/IAccessSession';

function addSeconds(date: Date, seconds: number): Date {
	date.setTime(date.getTime() + seconds * 1000);
	return date;
}

export const GET = (async ({ cookies, fetch }) => {
	const session_cookie = cookies.get('AccessSession');
	const auth_url = 'https://www.bungie.net/Platform/App/OAuth/Token/';
	const auth_token = btoa(`${SECRET_CLIENT_ID}:${SECRET_CLIENT_SECRET}`);
	const current_time = new Date();

	if (!session_cookie) {
		throw error(500, { message: 'No access session cookie exists', error_id: crypto.randomUUID() });
	}

	console.warn(session_cookie);

	const data: IAccessSession = JSON.parse(session_cookie) as IAccessSession;

	// Only renew if token expired
	if (current_time < new Date(data.access.expires_at)) {
		return json(data);
	}

	// Retrieving the new access token
	const access_request = await fetch(auth_url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			Authorization: `Basic ${auth_token}`,
			'X-API-Key': SECRET_API_KEY
		},
		body: `grant_type=refresh_token&refresh_token=${JSON.parse(session_cookie).refresh.token}`
	});
	if (access_request.status !== 200) {
		throw error(500, {
			message: `Something went wrong refreshing the bungie access token: '${access_request.statusText}'`,
			error_id: crypto.randomUUID()
		});
	}
	const access_data = await access_request.json();

	data.access.expires_at = addSeconds(new Date(), access_data.expires_in);
	data.refresh.expires_at = addSeconds(new Date(), access_data.refresh_expires_in);

	cookies.set('AccessSession', JSON.stringify(data), {
		path: '/',
		httpOnly: true,
		maxAge: access_data.refresh_expires_in
	});

	return json(data);
}) satisfies RequestHandler;
