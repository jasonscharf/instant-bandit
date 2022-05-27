import { useEffect, useLayoutEffect } from "react"
import * as constants from "./constants"


/**
 * Returns `true` if something is non-null and not `undefined`
 * @param thing 
 * @returns 
 */
export function defined(thing: unknown) {
  return (thing !== undefined && thing !== null)
}


/**
 * Pulls an environment variable from a Node process or NextJS' injected ones.
 * @param name 
 * @returns 
 */
export function env(name: string): string | null {
  if (typeof process === "undefined") {
    return null
  } else {
    return process[name]
  }
}

/**
 * Gets the base URL, observing environment variables if in a Node environment
 * @returns 
 */
export function getBaseUrl() {
  // We may have exposed a different base URL to the client via Next
  if (isBrowserEnvironment) {
    return env("NEXT_PUBLIC_DEFAULT_BASE_URL") ?? constants.DEFAULT_BASE_URL
  } else {
    return env("DEFAULT_BASE_URL") ?? constants.DEFAULT_BASE_URL
  }
}

export const isBrowserEnvironment =
  typeof window !== "undefined"

export const useIsomorphicLayoutEffect =
  isBrowserEnvironment ? useLayoutEffect : useEffect

const scheduler = typeof setImmediate === "function" ? setImmediate : setTimeout
export const flushPromises = async () => new Promise((resolve) => { scheduler(resolve) })
