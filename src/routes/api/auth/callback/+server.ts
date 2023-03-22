import type { RequestHandler } from '@sveltejs/kit';
import { error, redirect } from '@sveltejs/kit';
import { SECRET_API_KEY, SECRET_CLIENT_ID, SECRET_CLIENT_SECRET } from '$env/static/private';
import type ISession from '@interfaces/ISession';
import { addSecondsToDate } from '@lib/utils';

export const GET = (async ({ url, cookies, fetch }) => {
	// Variable declaration
	const oAuthUrl = 'https://www.bungie.net/Platform/App/OAuth/Token/';
	const bnetUserUrl = `https://www.bungie.net/Platform/User/GetCurrentBungieNetUser/`;
	const authCode = url.searchParams.get('code');
	const authToken = btoa(`${SECRET_CLIENT_ID}:${SECRET_CLIENT_SECRET}`);

	// Check if authCode available
	if (!authCode) {
		throw error(500, {
			message: "The callback url is missing the 'code' query parameter",
			errorId: 'ee2eacb4-c8d8-11ed-afa1-0242ac120002'
		});
	}

	// Fetch access token
	const accessRequest = await fetch(oAuthUrl, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			Authorization: `Basic ${authToken}`,
			'X-API-Key': SECRET_API_KEY
		},
		body: `grant_type=authorization_code&code=${authCode}`
	});
	// Check accessRequest
	if (accessRequest.status !== 200) {
		throw error(500, {
			message: `Something went wrong obtaining the bungie access token: '${
				(await accessRequest.json()).Message
			}'`,
			errorId: crypto.randomUUID()
		});
	}
	// Extract data
	const accessData = await accessRequest.json();

	// Fetch Bungie user account
	const bnetResponse = await fetch(bnetUserUrl, {
		headers: {
			Authorization: `Bearer ${accessData.access_token}`,
			'X-API-Key': SECRET_API_KEY
		}
	});
	// Check bnetUserResponse
	if (bnetResponse.status !== 200) {
		throw error(500, {
			message: `Something went wrong obtaining the Bungie.net user information: '${
				(await bnetResponse.json()).Message
			}'`,
			errorId: crypto.randomUUID()
		});
	}
	// Extract data
	const bnetData = await bnetResponse.json();

	// Fetch Destiny2 user account
	const d2UserUrl = `https://www.bungie.net/Platform/Destiny2/254/Profile/${bnetData.Response.membershipId}/LinkedProfiles/`;
	const d2Response = await fetch(d2UserUrl, {
		headers: {
			Authorization: `Bearer ${accessData.access_token}`,
			'X-API-Key': SECRET_API_KEY
		}
	});
	// Check bnetUserResponse
	if (d2Response.status !== 200) {
		throw error(500, {
			message: `Something went wrong obtaining the Destiny 2 user information: '${
				(await d2Response.json()).Message
			}'`,
			errorId: crypto.randomUUID()
		});
	}
	// Extract data
	const d2Data = await d2Response.json();

	// Construct return data
	const returnData: ISession = {
		access: {
			token: accessData.access_token,
			expirationDate: addSecondsToDate(new Date(), accessData.expires_in)
		},
		refresh: {
			token: accessData.refresh_token,
			expirationDate: addSecondsToDate(new Date(), accessData.refresh_expires_in)
		},
		bnetId: bnetData.Response.membershipId,
		destiny2: {
			membershipId: d2Data.Response.profiles[0].membershipId,
			membershipType: d2Data.Response.profiles[0].membershipType,
			name: d2Data.Response.profiles[0].bungieGlobalDisplayName
		}
	};

	cookies.set('Session', JSON.stringify(returnData), {
		path: '/',
		httpOnly: true,
		maxAge: accessData.refresh_expires_in
	});

	throw redirect(303, '/authorized');
}) satisfies RequestHandler;
