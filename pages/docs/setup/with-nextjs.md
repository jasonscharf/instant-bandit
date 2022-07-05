# Instant Bandit with Next.js
Instant Bandit pairs well with Next.js, particular with Next's Server-side Rendering (SSR) capabilities.

This article has some integration tips and notes for Next.js.


## Endpoints
The Instant Bandit package ships with Next.js endpoints you can import directly.

Import the endpoints and pass them an instance of the server you created, and your server is ready to go.

> Tip:: You can change the endpoint locations via configuration settings `sitePath` and `metricsPath`.


### Sites Endpoint
Create _pages/api/sites/[siteName].ts_ to serve sites. In that file:
```ts
import { createSiteEndpoint } from "@instantdomain/bandit/server";

// Point to the server instance you configured, i.e.:
import { server } from "../../../lib/instant-bandit";

// This helper method returns a Next.js endpoint and must be the default export
export default createSiteEndpoint(server);
```


### Metrics Endpoint
Create _pages/api/metrics/ts_ to ingest metrics. In that file:
```ts
import { createMetricsEndpoint } from "@instantdomain/bandit/server";
import { server } from "../../lib/instant-bandit";

export default createMetricsEndpoint(server);
```


## SSR
For SSR pages, use the SSR helper in `getServerSideProps`:

```tsx
import { serverSideRenderedSite } from "@instantdomain/bandit/server";

// Import the server you configured
import { server } from "../lib/server";

// ... JSX ...

const siteName = "default";
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req, res } = context;
  const { site, select, defer } = await serverSideRenderedSite(server, siteName, req, res);

  return {
    props: {
      site,
      siteName,
      select,
      defer,
    },
  };
};
```

Here, the SSR helper is providing us with a pre-initialized site, with the last probabilities backed into it.

We're also relaying:
- the `siteName` in case a non-default one is used
- the `select` prop indicating with variant was selected in the current experiment
- the `defer` flag, in case the component should perform its own variant selection client-side

> **Note:** The SSR helper sets `defer` to `true` if the sessions or metrics backends are unavailable.
> This forces client-side rendering in the case what SSR can't be fulfilled.

Be sure to pass the props to `InstantBandit`:
```tsx
 <InstantBandit {...serverSideProps}>...</InstantBandit>
```