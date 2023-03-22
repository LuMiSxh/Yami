import type { RequestHandler } from '@sveltejs/kit';
import { error, redirect } from '@sveltejs/kit';
import { SECRET_API_KEY, SECRET_CLIENT_ID, SECRET_CLIENT_SECRET } from '$env/static/private';
import type IAccessSession from '@interfaces/IAccessSession';

function addSeconds(date: Date, seconds: number): Date {
	date.setTime(date.getTime() + seconds * 1000);
	return date;
}

export const GET = (async ({ url, cookies, fetch }) => {
	// URLs
	const auth_url = 'https://www.bungie.net/Platform/App/OAuth/Token/';
	const bnet_user_url = `https://www.bungie.net/Platform/User/GetCurrentBungieNetUser/`;
	const auth_code = url.searchParams.get('code');
	const auth_token = btoa(`${SECRET_CLIENT_ID}:${SECRET_CLIENT_SECRET}`);

	// Check for auth code
	if (!auth_code) {
		throw error(500, {
			message: "The callback url is missing the 'code' query parameter.",
			error_id: crypto.randomUUID()
		});
	}

	// Get access token
	const access_request = await fetch(auth_url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			Authorization: `Basic ${auth_token}`,
			'X-API-Key': SECRET_API_KEY
		},
		body: `grant_type=authorization_code&code=${auth_code}`
	});
	if (access_request.status !== 200) {
		throw error(500, {
			message: `Something went wrong obtaining the bungie access token: '${access_request.statusText}'`,
			error_id: crypto.randomUUID()
		});
	}
	const access_data = await access_request.json();

	console.warn(access_data);

	// Fetch the bungie.net user account
	const bnet_user_response = await fetch(bnet_user_url, {
		headers: {
			Authorization: `Bearer ${access_data.access_token}`,
			'X-API-Key': SECRET_API_KEY
		}
	});
	if (bnet_user_response.status !== 200) {
		console.log(await bnet_user_response.text(), access_data, {
			Authorization: `Bearer ${access_data.access_token}`,
			'X-API-Key': SECRET_API_KEY
		});
		throw error(500, {
			message: `Something went wrong obtaining the Bungie.net user information: '${bnet_user_response.statusText}'`,
			error_id: crypto.randomUUID()
		});
	}
	const bnet_user_data = await bnet_user_response.json();

	console.warn(bnet_user_data);

	// Fetch the destiny2 user account
	const d2_user_url = `https://www.bungie.net/Platform/Destiny2/254/Profile/${bnet_user_data.Response.membershipId}/LinkedProfiles/`;
	const d2_user_response = await fetch(d2_user_url, {
		headers: {
			Authorization: `Bearer ${access_data.access_token}`,
			'X-API-Key': SECRET_API_KEY
		}
	});
	if (d2_user_response.status !== 200) {
		throw error(500, {
			message: `Something went wrong obtaining the Destiny 2 user information: '${d2_user_response.statusText}'`,
			error_id: crypto.randomUUID()
		});
	}
	const d2_user_data = await d2_user_response.json();

	// Building the data
	const data: IAccessSession = {
		access: {
			token: access_data.access_token,
			expires_at: addSeconds(new Date(), access_data.expires_in)
		},
		refresh: {
			token: access_data.refresh_token,
			expires_at: addSeconds(new Date(), access_data.refresh_expires_in)
		},
		bnet: {
			id: bnet_user_data.Response.membershipId,
			name: bnet_user_data.Response.displayName,
			icon: 'https://bungie.net' + bnet_user_data.Response.profilePicturePath
		},
		d2: {
			id: d2_user_data.Response.profiles[0].membershipId,
			type: d2_user_data.Response.profiles[0].membershipType,
			name: d2_user_data.Response.profiles[0].bungieGlobalDisplayName
		}
	};

	// Storing the cookie
	cookies.set('AccessSession', JSON.stringify(data), {
		path: '/',
		httpOnly: true,
		maxAge: access_data.refresh_expires_in
	});

	throw redirect(303, '/optimizer');
}) satisfies RequestHandler;
