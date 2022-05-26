import * as constants from "./constants"
import { Algorithm, AlgorithmBlock } from "./types"
import { EpsilonGreedyAlgo } from "./algos/EpsilonGreedyAlgo"
import { MetricsSample, Site } from "./models"
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

/**
 * Handles loading of site variants, variant selection, and metrics reporting.
 * This client runs in the browser and in Node
 */
export class InstantBanditClient {
  protected _state: "init" | "wait" | "ready" = "init"
  protected _error: Error | null = null
  protected _options: ClientOptions = Object.assign({}, DEFAULT_BANDIT_OPTS)
  protected _metrics: MetricsSample[] = []
  protected _timer: TimerLike | null = null
  protected _site: Site | null = null
  protected _variant: string = constants.DEFAULT_VARIANT_NAME
  protected _loadPromise: Promise<Site> | null = null


  get state() {
    return this._state
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
   * @param site 
   * @returns 
   */
  async load(origin?: string, site: string = constants.DEFAULT_SITE_NAME) {
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

    // TODO: Extract selection logic to algo //
    const { experiments } = site

    // TEMP: Pick random experiment
    const ix = Math.min(Math.floor(Math.random() * (experiments.length + 1)), experiments.length - 1)
    const variantName = experiments[ix]
    //

    // TODO: Delete other experiments

    siteWithSelection.select = variantName.name
    Object.freeze(siteWithSelection)


    this._site = siteWithSelection

    return siteWithSelection
  }
}

//
// Default base options for the client.
// Will pull from Node/Next.js env vars on the server if present
//
export const DEFAULT_BANDIT_OPTS: ClientOptions = {
  baseUrl: getBaseUrl(),
  sitePath: env("DEFAULT_SITE_PATH") ?? constants.DEFAULT_SITE_PATH,
  metricsPath: env("DEFAULT_METRICS_PATH") ?? constants.DEFAULT_METRICS_PATH,
  batchSize: 10,
  flushInterval: 50,
  defaultAlgo: Algorithm.EPSILON_GREEDY,
  algorithms: {
    [Algorithm.EPSILON_GREEDY]: new EpsilonGreedyAlgo(),
  },
} as const
Object.freeze(DEFAULT_BANDIT_OPTS)


// Node and DOM typings differ
export type TimerLike = any
