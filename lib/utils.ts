import { useEffect, useLayoutEffect } from "react"


/**
 * Returns `true` if something is non-null and not `undefined`
 * @param thing 
 * @returns 
 */
export function defined(thing: unknown) {
  return (thing !== undefined && thing !== null)
}

export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect 


const scheduler = typeof setImmediate === "function" ? setImmediate : setTimeout
export const flushPromises = async () => new Promise((resolve) => { scheduler(resolve) })
