import { Html, Head, Main, NextScript } from "next/document"
import { Mark } from "../components/Mark"
import { DEFAULT_BASE_URL, DEFAULT_SITE_PATH } from "../lib/constants"


export default function Document() {

  // Note the preload link. This allows us to cache the default site endpoint ahead of time.
  // Doing so drastically reduces visual flicker during load..
  return (
    <Html>
      <Head>
        <link rel="preload" href={`${DEFAULT_BASE_URL}/${DEFAULT_SITE_PATH}`} as="fetch" crossOrigin="anonymous" />
      </Head>
        <body>
          <Main />
          <NextScript />
        </body>
    </Html>
  )
}
