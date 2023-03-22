import type { RequestHandler } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { SECRET_CLIENT_ID } from '$env/static/private';

export const GET = (async () => {
	const url = `https://www.bungie.net/en/OAuth/Authorize?client_id=${SECRET_CLIENT_ID}&response_type=code`;
	throw redirect(303, url);
}) satisfies RequestHandler;
