import React from "react"
import { Debug } from "../../../components/InstantBanditDebug"
import { LoadState } from "../../../lib/types"


export const ThrowIfPresented = () =>
  <Debug onFirstEffect={() => { throw new Error("This element should not be presented") }} />

export const ExpectBanditWaiting = () =>
  <Debug onFirstRender={({ bandit }) => { expect(bandit.state).toStrictEqual(LoadState.WAIT) }} />

export const ExpectBanditReady = () =>
  <Debug onFirstRender={({ bandit }) => { expect(bandit.state).toStrictEqual(LoadState.READY) }} />

export const Call = ({ onFirstEffect }) =>
  <Debug onFirstEffect={onFirstEffect} />


export interface CatchProps {
  break?: boolean
}

export interface CatchState {
  error: Error | null
}

export class Catch extends React.Component<CatchProps, CatchState> {
  constructor(props: CatchProps) {
    super(props);
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    
    const { break: breakProp }= this.props

    // You can also log the error to an error reporting service
    console.error(error)
    if (breakProp) {
      debugger
    }
  }

  render() {
    if (this.state.error) {
      return <h1>Something went wrong.</h1>;
    }

    return <>{this.props.children}</>;
  }
}