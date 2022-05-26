import { PropsWithChildren, useCallback, useContext, useRef, useState } from "react"
import { InstantBanditContext } from "../lib/contexts"
import { useMutationObservable } from "../lib/hooks"


export interface MarkProps {
  id: string
  detail?: string
}

export interface MarkState {
  layouts: number
  renders: number
  effects: number
  mutations: number,
}

export const DEFAULT_STATE: MarkState = {
  layouts: 0,
  renders: 0,
  effects: 0,
  mutations: 0,
}

// Callback function to execute when mutations are observed
function report(mutationList, observer) {
  // Use traditional "for loops" for IE 11
  for (const mutation of mutationList) {
    if (mutation.type === "childList") {
      console.log("A child node has been added or removed.")
    }
    else if (mutation.type === "attributes") {
      console.log("The " + mutation.attributeName + " attribute was modified.")
    }
  }
}


export function Mark(props: PropsWithChildren<any>) {
  const { detail: detailProp, id, dump } = props
  const [state, setState] = useState(Object.assign({}, DEFAULT_STATE))
  const { state: banditState, siteName, variant } = useContext(InstantBanditContext)

  const ref = useRef()
  const detail = `IB: ${banditState} S: ${siteName} V: ${variant}`

  const onListMutation = useCallback(
    (recs: MutationRecord[]) => {
      recs.forEach(m => {
        const additions = m.addedNodes
        m.addedNodes.forEach(n => {
          console.log(`---> Added`, n)
        })

        m.removedNodes.forEach(n => {
          console.log(`<--- Removed`, n)
        })
      })



      //debugger
      ++state.mutations
    },
    []
  )

  if (typeof document !== "undefined") {
    let foo = document.querySelectorAll("#foo")[0]
    useMutationObservable(ref.current, onListMutation)
  }

  /*
  useLayoutEffect(() => {
    ++state.layouts

    console.log(`MARK: ${id} layouts: ${state.layouts}`)

    // Options for the observer(which mutations to observe)
    const config = { attributes: true, childList: true, subtree: true }

  
    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(report)

    // Start observing the target node for configured mutations
    observer.observe(ref.current, config)

    return () => observer.disconnect()

  }, [banditState])*/

  ++state.renders

  performance.mark(id, {
    detail: detail ?? detailProp,
  })
  return (
    <div ref={ref as any}>
      {props.children}
    </div>
  )
}
