import { PropsWithChildren, useContext } from "react"
import { InstantBanditContext, LoadState } from "../lib/contexts"


export interface PlaceholderComponentProps {

  /** If `true`, shows the placeholder content at all times. */
  show?: boolean
}

/**
 * Represents a specific variation of a component or tree of components.
 * Setting the property `show` keeps the placeholder present at all times.
 * @param props 
 * @returns 
 */
export function Placeholder(props: PropsWithChildren<PlaceholderComponentProps>) {
  const { show } = props

  const { variant, siteName, state: banditState } = useContext(InstantBanditContext)

  const isDefault = true
  const isSelected = false
  const notReady = banditState !== LoadState.READY

  function shouldBePresent() {
    return isSelected || (isDefault && notReady)
  }

  const present = shouldBePresent()
  return (
    <>
      {present && props.children}
    </>
  )
}
