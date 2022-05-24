import { StrictMode } from "react"
import "../styles/globals.css"


// TODO: E2E test IB here

function MyApp({ Component, pageProps }) {
  return (
    <StrictMode>
      <Component {...pageProps} />
    </StrictMode>
  )
}

export default MyApp
