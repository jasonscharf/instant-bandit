import * as constants from "./constants"
import { Algorithm, Algorithms, AlgorithmResults, SessionDescriptor, TimerLike, SelectionArgs, AlgorithmImpl } from "./types"
import { EpsilonGreedyBanditAlgo } from "./algos/EpsilonGreedyAlgo"
import { LoadState } from "./types"
import { MetricsSample, Site, Variant } from "./models"
import { defined, env, getBaseUrl, isBrowserEnvironment } from "./utils"


/**
 * Handles loading of metadata for variants, variant selection, and variant metrics.
 * Components have contextual access to an instance through a hook.
 * This client runs in the browser and in Node.
 */
export class InstantBanditClient {
  protected _state: LoadState
  protected _error: Error | null = null
  protected _options: ClientOptions = Object.assign({}, DEFAULT_BANDIT_OPTS)
  protected _metrics: MetricsSample[] = []
  protected _timer: TimerLike | null = null
  protected _session: SessionDescriptor | null = null
  protected _site: Site | null = null
  protected _variant: Variant | null = null


  get state() {
    return this._state
  }

  get error() {
    return this._error
  }

  get isOnServer() {
    return typeof window === "undefined"
  }

  get origin() {
    if (isBrowserEnvironment) {
      return location.origin
    } else {
      return constants.DEFAULT_ORIGIN
    }
  }

  get site() {
    return this._site
  }

  get variant() {
    return this._variant
  }


  constructor(opts: Partial<ClientOptions> = {}) {
    Object.assign(this._options, opts)
    Object.freeze(this._options)
  }

  /**
   * Returns a site from a remote endpoint, given an origin and site.
   * This means the latest properties defined in the metrics store will be pulled down.
   * This request is still issued even if the user has a specific variant.
   * @param select 
   * @returns 
   */
  async load(select?: string): Promise<Site> {
    let siteUrl = ""
    try {
      this._session = await this.upsertClientSession()
      const { baseUrl, sitePath } = this._options

      const url = new URL(sitePath, baseUrl)

      const headers = new Headers()

      if (this._options.appendTimestamp === true) {
        url.searchParams.append(PARAM_TIMESTAMP, new Date().getTime() + "")
      }
      if (defined(select)) {
        url.searchParams.append(PARAM_SELECT, select!)
      }
      if (defined(this._session)) {
        const session = this._session!
        if (defined(session.sid)) {
          headers.append(constants.HEADER_SESSION_ID, session.sid)
        }
      }

      this._state = LoadState.WAIT

      siteUrl = url.toString()
      const resp = await fetch(siteUrl)
      const site = await resp.json() as Site
      await this.init(site, select)

    } catch (err) {
      this._error = err
      console.warn(`[IB] An error occurred while loading from '${siteUrl}': ${err}`)

      await this.init(FALLBACK_SITE, select)
      console.info(`[IB] Using site '${FALLBACK_SITE.name}' instead`)
    } finally {
      this._state = LoadState.READY
      return this._site!
    }
  }

  /**
  * Initializes from a site object provided locally
  * @param site
  * @param select
  * @returns 
  */
  async init(site: Site, select?: string): Promise<Site> {
    try {
      const variant = await this.select(site, select)
      this._variant = Object.assign({}, variant)
      this._site = Object.freeze(Object.assign({}, site))
      this._state = LoadState.READY

      return this._site!
    } catch (err) {
      this._error = err
      console.warn(`[IB] Error initializing: ${err}`)
    }

    return this._site!
  }

  /**
   * Pushes a metrics sample into the internal queue for batch sending
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
      const url = new URL(metricsPath, getBaseUrl())
      const site = this._site?.name || constants.DEFAULT_SITE_NAME
      const variant = this._site?.select ?? constants.DEFAULT_NAME

      if (site) {
        url.searchParams.append("site", site)
      }
      if (variant) {
        url.searchParams.append("variant", variant)
      }

      interface MetricsBatch {
        origin: string
        site: string
        token?: string
        entries: MetricsSample[]
      }

      // Entirely possible that this is a cross-domain POST.
      // Be aware that reading the resp may throw.
      try {
        // TODO: Use sendBeacon when in browser
        await fetch(url.toString(), {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(batch),
        })

        this._metrics.splice(0, count)
      } catch (err) {
        console.error(`Error flushing queue: '${err}'`)
      }
      console.info(`[IB] Flushed ${count} entries`)
    } catch (err) {
      console.error(`Error sending metrics: ${err}`)

      // TODO: Retry logic? Keep a double-ended queue as not to exhaust memory?
    }

    if (this._timer) {
      clearTimeout(this._timer)
      this._timer = null
    }
  }

  // NOTE: This is basically just a stub for now.
  // This method is more for storing pointers to any sites/variants this user may
  // have visited.
  async upsertClientSession(props?: Partial<SessionDescriptor>): Promise<SessionDescriptor> {
    if (!isBrowserEnvironment) {
      // console.debug(`No concept of session on server yet. No action taken.`)
      return Object.assign({}, props) as SessionDescriptor
    } else {
      const origin = window.location.origin
      const storageKey = `${origin}`
      const sessionJson = localStorage.getItem(storageKey)

      let existingSession: SessionDescriptor

      // TODO: Error handling / fault tolerance here
      if (defined(sessionJson)) {
        existingSession = <SessionDescriptor>JSON.parse(sessionJson!)
      } else {

        //
        // Create new session (temporary)
        // The issuance of session and user identifiers should be server-side
        // This is temporary and for convenience for holding site/variant/etc in one place
        //
        const sid = null as unknown as string
        const uid = null as unknown as string

        const site = this._site ? this._site.name : null
        const variant = this._variant?.name || constants.DEFAULT_VARIANT_NAME

        existingSession = {
          origin,
          site,
          sid,
          uid,
          variant,
        }
      }

      if (props) {
        Object.assign(existingSession, props)
        localStorage.setItem(storageKey, JSON.stringify(existingSession))
      }

      this._session = existingSession
      return this._session
    }
  }

  /**
   * Selects the appropriate variant given a site and an optional, explicit selection.
   * 
   * If the "select" property of the site model is set, it indicates that selection
   * was performed server-side, or intentionally set by hand.
   * 
   * @param site
   * @param explicitSelection
   */
  async select(site: Site, explicitSelection?: string) {
    let variant: Variant | null = null

    // Precedence:
    // 1. Explicit (props or env vars)
    // 2. Specified (relayed in the site via the "select" field)
    // 3. Algorithm (multi-armed bandit)
    // 4. Fallback (default site with no variants)

    if (defined(explicitSelection)) {
      variant = this.selectSpecific(site, explicitSelection!)
    } else if (defined(site.select)) {
      variant = this.selectSpecific(site, site.select!)
    } else {
      variant = await this.selectWithAlgorithm(site)
    }

    if (!variant) {
      variant = this.selectFallbackFor(site, constants.DEFAULT_VARIANT_NAME)
    }

    // Save the chosen variant by way of the client-side session object
    try {
      await this.upsertClientSession({ variant: variant!.name })
    } catch (err) {
      console.error(`Error encountered while persisting variant`)
    }

    return variant
  }

  /**
  * Performs variant selection using an algorithm such as a multi-armed bandit
  * Returns the default variant if not found
  * @param site 
  * @param args 
  * @param algo 
  * @returns 
  */
  async selectWithAlgorithm<TArgs = unknown>(site: Site, args?: TArgs, algo: string = DEFAULT_BANDIT_OPTS.defaultAlgo): Promise<Variant> {

    // TODO: Time this - will affect initial load time for new users
    const { metrics, pValue, winner } = await this.runAlgorithm(site, algo, args)
    return winner
  }

  /**
   * Selects a winning variant based on a particular algorithm.
   * @param site
   * @param algoName
   * @returns
   */
  async runAlgorithm<TArgs = unknown>(site: Site, algoName: string, args?: TArgs): Promise<AlgorithmResults> {
    const { variants } = site

    const factory = this._options.algorithms[algoName]
    if (typeof factory !== "function") {
      console.warn(`Could not find implementation for selection algorithm '${algoName}'`)
    }

    try {
      const algo = factory()
      const args: SelectionArgs = {
        site,
        algo: algoName,
      }

      const results = await algo.select(args)
      return results;

    } catch (err) {
      console.warn(`[IB] There was an error selecting a variant: ${err}`)
    }

    // TEMP
    const results: AlgorithmResults = {
      winner: site.variants[0],
      metrics: {},
      pValue: 0.0,
    }

    return results
  }

  /**
   * Selects a fallback variant when none is available
   * @param site 
   * @param variant 
   * @returns 
   */
  selectFallbackFor(site: Site, variant: string) {
    console.warn(`[IB] Could not find variant '${variant}'. Falling back to '${constants.DEFAULT_VARIANT_NAME}'`)
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

  // 
  selectSpecific(site: Site, variant: string) {
    const selected = site!.variants.find(e => e.name === variant) ?? null
    return selected ?? this.selectFallbackFor(site, variant)
  }
}

export const PARAM_TIMESTAMP = "ts"
export const PARAM_SELECT = "select"

// If a site model can't be loaded remotely and none was supplied locally,
// this model is used as the fallback, specifying only the invariant
export const FALLBACK_SITE: Site = {
  name: constants.DEFAULT_SITE_NAME,
  select: constants.DEFAULT_VARIANT_NAME,
  variants: [
    {
      name: constants.DEFAULT_VARIANT_NAME,
      metrics: {
        exposures: 0,
        clicks: 0,
      }
    }
  ]
} as const
Object.freeze(FALLBACK_SITE)

/**
 * Initialization options for the client
 */
export interface ClientOptions {
  baseUrl: string
  sitePath: string
  metricsPath: string
  appendTimestamp: boolean
  batchSize: number
  flushInterval: number
  defaultAlgo: Algorithm | string
  algorithms: Algorithms
}

//
// Default base options for the client.
// Will pull from Node/Next.js env vars on the server if present
//
export const DEFAULT_BANDIT_OPTS: ClientOptions = {
  baseUrl: getBaseUrl(),
  sitePath: env("DEFAULT_SITE_PATH") ?? constants.DEFAULT_SITE_PATH,
  metricsPath: env("DEFAULT_METRICS_PATH") ?? constants.DEFAULT_METRICS_PATH,
  appendTimestamp: false,
  batchSize: 10,
  flushInterval: 50,
  defaultAlgo: Algorithm.RANDOM,
  algorithms: {
    [Algorithm.RANDOM]: () => new RandomAlgo(),
    [Algorithm.MAB_EPSILON_GREEDY]: () => new EpsilonGreedyBanditAlgo(),
  },
} as const
Object.freeze(DEFAULT_BANDIT_OPTS)


export class RandomAlgo implements AlgorithmImpl {
  async select(args: SelectionArgs) {
    const { site } = args
    const { variants } = site

    const winner = variants[variants.length * Math.random() >> 0]
    const results: AlgorithmResults = {
      winner,
      metrics: {},
      pValue: 0,
    }
    return results
  }
}
