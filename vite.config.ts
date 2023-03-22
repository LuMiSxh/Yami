import { sveltekit } from '@sveltejs/kit/vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
import * as path from 'path';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [basicSsl(), sveltekit()],
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
