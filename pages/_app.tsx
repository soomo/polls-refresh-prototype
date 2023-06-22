import Head from 'next/head';
import './index.css';

import type { AppProps } from 'next/app';

export default ({ Component, pageProps }: AppProps) => {
	return (
		<>
			<Head>
				<script
					type="text/javascript"
					src="//fast.fonts.net/jsapi/85e28b62-1821-4c6a-ad87-743a5a3f8fc9.js"></script>
				<link rel="stylesheet" href="/fonts/NeueHaasGrotesk.css" type="text/css" />
				<link rel="stylesheet" href="/fonts/Publico.css" type="text/css" />
				<title>Polls Refresh Prototype</title>
			</Head>
			<Component {...pageProps} />
		</>
	);
};
