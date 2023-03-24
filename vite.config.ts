import { sveltekit } from '@sveltejs/kit/vite';
import * as path from 'path';
import mkcert from 'vite-plugin-mkcert';

/** @type {import("vite").UserConfig} */
const config = {
	plugins: [mkcert(), sveltekit()],
	resolve: {
		alias: {
			'@lib': path.resolve('./src/lib'),
			'@components': path.resolve('./src/components'),
			'@assets': path.resolve('./src/assets'),
			'@interfaces': path.resolve('./src/interfaces')
		}
	}
};

export default config;
