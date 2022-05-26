/**
 * @jest-environment jsdom
 */
import "whatwg-fetch"
import React from "react"
import fetchMock, { FetchMock } from "jest-fetch-mock"

import { Debug } from "../../../components/InstantBanditDebug"
import { Experiment } from "../../../components/Experiment"
import { InstantBandit } from "../../../components/InstantBandit"
import { LoadState } from "../../../lib/contexts"
import { disableJestLogging, renderTest } from "../../test-utils"
import { TEST_SITE_AB } from "../../configs"
import { screen, waitFor } from "@testing-library/react"


declare const fetch: Promise<Response> & FetchMock


describe("Experiment", () => {
  beforeAll(() => {
    fetchMock.enableMocks()
  })

  afterAll(() => {
    fetchMock.resetMocks()
  })

  beforeEach(() => {
    sessionStorage.clear()
  })

  afterEach(() => {
    fetchMock.resetMocks()
  })

  describe("visibility", () => {
    describe("before selection", () => {
      it("does not render children", async () => {
        fetch.mockResponseOnce(async (init) => await JSON.stringify(TEST_SITE_AB))

        const visible = "is-rendered"
        const invisible = "is-not-rendered"

        const component = await renderTest(
          <InstantBandit select="B">
            <span data-testid={visible}>visible</span>
            <Debug onFirstEffect={({ bandit }) => {
              expect(bandit.state).toStrictEqual(LoadState.WAIT)
            }} />

            <Experiment name="A">
              <span data-testid={invisible}>invisible</span>
              <Debug onFirstEffect={({ bandit }) => {
                throw new Error("This element should not be presented")
              }} />
            </Experiment>

          </InstantBandit>
        )

        const [vis] = await component.findAllByTestId(visible)
        expect(vis).toBeVisible()

        const invis = screen.queryByTestId(invisible);
        expect(invis).toBeNull()
      })

      it("does render children if instructed to", async () => {
        fetch.mockResponseOnce(async (init) => await JSON.stringify(TEST_SITE_AB))

        let presented = false
        const component = await renderTest(
          <InstantBandit select="B">

            <Experiment name="A" default>
              <Debug onFirstEffect={({ bandit }) => {
                expect(bandit.state).toStrictEqual(LoadState.WAIT)
                presented = true
              }} />

            </Experiment>
          </InstantBandit>
        )

        expect(presented).toBe(true)
      })
    })
  })

  // TODO: Placeholders, invariants
  /*
 <InstantBandit {...serverSideProps}>
  <Placeholder>
    <div>
      This block will be rendered during loading.
      Placeholders hold layout in place while variants are loaded, preventing CLS
    </div>
  </Placeholder

  <Invariant>
    This is shown when there no variant has been loaded
  </Invariant>
  */

  describe("suspense", () => {
    it("suspends its children while it's unselected", async () => {
      // TODO: TEST
    })

    it("correctly handles an error in suspended children", async () => {
      // TODO: TEST
    })
  })


  describe("JSX declarations", () => {
    it("registers with the IB parent if present", async () => {
      // TODO: TEST
    })

    it("fails gracefully if no IB parent is present", async () => {
      // TODO: TEST
    })
  })

  describe("context", () => {
    it("children under it receive the correct scope context", async () => {
      // TODO: TEST
    })
  })

  describe("nesting", () => {
    it("supports nesting", () => {
      // TODO: TEST
    })
  })

  describe("metrics", () => {
    it("properly scopes metrics", () => {
      // TODO: TEST
    })
  })
})
