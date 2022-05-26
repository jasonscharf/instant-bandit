import { CSSProperties, PropsWithChildren, useContext, useEffect, useState } from "react"
import { DEFAULT_NAME } from "../lib/constants"
import { InstantBanditContext, Scope, InstantBanditState, ScopeContext } from "../lib/contexts"
import { defined } from "../lib/utils"


interface DebugState {
  renders: number
  effects: number
}

const DEFAULT_STATE: DebugState = {
  renders: 0,
  effects: 0,
} as const
Object.freeze(DEFAULT_STATE)


type DebugCallbackProps = {
  debug: DebugState
  bandit: InstantBanditState
  scope: Scope
}

export interface DebugProps {
  testId?: string
  label?: string
  msg?: string
  onEffect?: (props: DebugCallbackProps) => any
  onFirstEffect?: (props: DebugCallbackProps) => any
}

const InstantBanditDebug = (props: React.PropsWithChildren<DebugProps> = {}) => {
  const [state, setState] = useState(Object.assign({}, DEFAULT_STATE))
  const banditCtx = useContext(InstantBanditContext)
  const scopeCtx = useContext(ScopeContext)

  const { children, label, msg: log, onEffect, onFirstEffect, testId } = props
  const { experiment } = scopeCtx

  const banditCtxStr = JSON.stringify(banditCtx)
  const scopeCtxStr = JSON.stringify(scopeCtx)

  useEffect(() => {

    console.info(`[IB] dbg ${label} ${experiment} debug effect ${state.effects + 1}`)

    if (onFirstEffect && state.effects === 1) {
      onFirstEffect({ debug: state, bandit: banditCtx, scope: scopeCtx })
    }

    if (onEffect) {
      onEffect({ debug: state, bandit: banditCtx, scope: scopeCtx })
    }

    if (defined(log)) {
      console.info(`[IB] dbg '${log}'`)
    }

    ++state.effects
    setState(state)
  }, [banditCtx.state])

  return (
    <>
      {children}
      <div style={hiddenStyle} data-test-id={testId}>
        <span data-testid="ib-debug-label">{label}</span>
        <span data-testid="ib-debug-experiment">{experiment}</span>
        <span data-testid="ib-debug-state">{banditCtxStr}</span>
        <span data-testid="ib-debug-scope">{scopeCtxStr}</span>
        <span data-testid="ib-debug-stats-effects">{state.effects}</span>
      </div>
    </>
  )
}

const hiddenStyle: CSSProperties = {
  position: "absolute",
  overflow: "hidden",
  width: 0,
  height: 0,
  top: 0,
  left: 0,
}

export { InstantBanditDebug as Debug }
