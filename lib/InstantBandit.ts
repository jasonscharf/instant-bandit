import * as constants from "./constants"
import { Algorithm, AlgorithmBlock, TimerLike } from "./types"
import { EpsilonGreedyAlgo } from "./algos/EpsilonGreedyAlgo"
import { MetricsSample, Site, Variant } from "./models"
import { defined, env, getBaseUrl, isBrowserEnvironment } from "./utils"


/**
 * Initialization options for the client
 */
export interface ClientOptions {
  baseUrl: string
  sitePath: string
  metricsPath: string
  batchSize: number
  flushInterval: number
  defaultAlgo: Algorithm | string
  algorithms: AlgorithmBlock
}

//
// Default base options for the client.
// Will pull from Node/Next.js env vars on the server if present
//
export const DEFAULT_BANDIT_OPTS: ClientOptions = {

  // TODO: Fallback behaviour when metrics are unavailable or 0

  baseUrl: getBaseUrl(),
  sitePath: env("DEFAULT_SITE_PATH") ?? constants.DEFAULT_SITE_PATH,
  metricsPath: env("DEFAULT_METRICS_PATH") ?? constants.DEFAULT_METRICS_PATH,
  batchSize: 10,
  flushInterval: 50,
  defaultAlgo: Algorithm.EPSILON_GREEDY,
  algorithms: {
    [Algorithm.EPSILON_GREEDY]: new EpsilonGreedyAlgo(),

    // [Algorithm.RANDOM]: new RandomDistribution(),
    // [Algorithm.RANDOM_WEIGHTED]: new RandomWeightDistribution(),
  },
} as const
Object.freeze(DEFAULT_BANDIT_OPTS)



/**
 * Handles loading of metadata for variants.
 * Performs variant selection, and metrics reporting.
 * This client runs in the browser and in Node.
 * Components have contextual access to this through the global ClientContext.
 */
export class InstantBanditClient {
  protected _state: "init" | "wait" | "ready" = "init"
  protected _error: Error | null = null
  protected _options: ClientOptions = Object.assign({}, DEFAULT_BANDIT_OPTS)
  protected _metrics: MetricsSample[] = []
  protected _timer: TimerLike | null = null
  protected _site: Site | null = null
  protected _variant: string = constants.DEFAULT_VARIANT
  protected _loadPromise: Promise<Site> | null = null


  get state() {
    return this._state
  }

  get isOnServer() {
    return typeof window === "undefined"
  }

  get origin() {
    if (isBrowserEnvironment()) {
      return location.origin
    } else {
      return constants.DEFAULT_NAME
    }
    return
  }

  constructor(opts: Partial<ClientOptions> = DEFAULT_BANDIT_OPTS) {
    Object.assign(this._options, DEFAULT_BANDIT_OPTS, opts)
    Object.freeze(this._options)
  }

  /**
   * Returns a site from a remote endpoint, given an origin and site.
   * Only runs once, unless it fails, in which case it can be retried.
   * @param origin 
   * @param session
   * @param site 
   * @returns 
   */
  async load(origin?: string, session?: string, site: string = constants.DEFAULT_SITE_NAME) {
    try {
      const { baseUrl, sitePath: siteUrl } = this._options
      const url = new URL(siteUrl, baseUrl)
      url.searchParams.append("ts", new Date().getTime() + "")

      const resp = await fetch(url.toString())
      const siteData = await resp.json() as Site

      this._state = "ready"
      this._variant = siteData?.select ?? constants.DEFAULT_NAME

      const siteWithSelection = await this.select(siteData, this._options.defaultAlgo)
      return siteWithSelection
    } catch (err) {
      console.warn(`[IB] Error loading site definition: ${err}`)
      this._loadPromise = null
      this._error = err
    }

    return this._loadPromise!
  }

  /**
   * Creates a session ID
   * @param origin 
   * @param authority 
   * @param oid 
   */
  async getSessionIdLocally(origin: string, authority: string, oid: string) {
    // TODO
  }

  /**
   * Pushes a metrics item into the internal queue for batch sending
   * @param metric 
   */
  async push(metric: MetricsSample) {
    const { flushInterval, batchSize, metricsPath } = this._options

    if (!defined(metricsPath) || metricsPath!.trim() === "") {
      return
    }

    this._metrics.push(metric)

    if (this._metrics.length >= batchSize) {
      this.flush()
    } else if (!this._timer) {
      this._timer = setTimeout(() => this.flush(), flushInterval)
    }
  }

  /**
   * Flushes the metrics queue, sending the metrics in batches.
   * Attaches site and variant headers
   */
  async flush() {
    const { baseUrl, batchSize, metricsPath } = this._options

    if (!defined(metricsPath) || metricsPath.trim() === "") {
      return
    }

    const count = Math.min(this._metrics.length, batchSize)
    const batch = this._metrics.slice(0, count)

    try {
      // TODO: Use sendBeacon when in browser
      const path = [baseUrl, metricsPath].join("/")
      const url = new URL(metricsPath, baseUrl)
      const site = this._site?.name || constants.DEFAULT_SITE_NAME
      const variant = this._site?.select ?? constants.DEFAULT_NAME

      if (site) {
        url.searchParams.append("site", site)
      }
      if (variant) {
        url.searchParams.append("variant", variant)
      }

      const resp = await fetch(path, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(batch),
      })

      this._metrics.splice(0, count)
      console.info(`[IB] Flushed ${count} entries`)
    } catch (err) {
      console.error(`Error sending metrics: ${err}`)
    }

    if (this._timer) {
      clearTimeout(this._timer)
      this._timer = null
    }
  }

  /**
   * Performs variant selection using an algorithm such as a multi-armed bandit
   * @param site 
   * @param algo 
   * @returns 
   */
  async select(site: Site, algo: Algorithm | string = Algorithm.EPSILON_GREEDY): Promise<Site> {
    const siteWithSelection = Object.assign({}, site)


    let variant = this.selectUsingAlgo(site, algo)

    // TODO: Extract selection logic to algo //
    const { variants } = site

    // TEMP: Pick random variant
    const ix = Math.min(Math.floor(Math.random() * (variants.length + 1)), variants.length - 1)
    const variantName = variants[ix]
    //

    // TODO: Delete other variants

    siteWithSelection.select = variantName.name
    Object.freeze(siteWithSelection)

    this._site = siteWithSelection

    return siteWithSelection
  }


  // Selects the appropriate variant.
  // If the "select" property of the site model is set, it indicates that selection
  // was performed server-side, or intentionally set by an author.
  selectVariant(site: Site, explicitSelection: string | null = null) {
    let selectedVariant: Variant | null = null
    let variant = constants.DEFAULT_VARIANT

    // Precedence:
    // 1. Explicitly specific, i.e. on props on a component
    // 2. Specified on the site via the "select" field
    // 3. Fallback to default (invariant)
    if (defined(explicitSelection)) {
      selectedVariant = this.selectSpecific(site, explicitSelection!)
    } else if (defined(site.select)) {
      selectedVariant = this.selectSpecific(site, site.select!)
    } else {
      selectedVariant = this.selectFallbackFor(site, constants.DEFAULT_VARIANT)
    }

    return selectedVariant
  }

  // No matching variant? Use the fallback
  selectFallbackFor(site: Site, variant: string) {
    console.warn(`[IB] Could not find variant '${variant}'. Falling back to '${constants.DEFAULT_VARIANT}'`)
    let fallback = FALLBACK_SITE.variants[0]
    if (!fallback) {
      fallback = {
        name: constants.DEFAULT_NAME,
        metrics: {
          exposures: 0,
          conversions: 0,
        },
      } as Variant
    }

    return fallback
  }

  selectSpecific(site: Site, variant: string) {
    const selected = site!.variants.find(e => e.name === variant) ?? null
    if (!selected) {
      return this.selectFallbackFor(site, variant)
    }

    return selected
  }

  /**
   * 
   */
  selectUsingAlgo(site: Site, algo: Algorithm | string = Algorithm.EPSILON_GREEDY) {

  }
}

// If a site model can't be loaded remotely and none was supplied locally,
// this model is used as the fallback, specifying only the invariant
export const FALLBACK_SITE: Site = {
  name: constants.DEFAULT_SITE_NAME,
  select: constants.DEFAULT_VARIANT,
  variants: [
    {
      name: constants.DEFAULT_VARIANT,
      metrics: {
        exposures: 0,
        clicks: 0,
      }
    }
  ]
} as const
Object.freeze(FALLBACK_SITE)
