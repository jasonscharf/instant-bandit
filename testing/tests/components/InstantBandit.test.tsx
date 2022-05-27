/**
 * @jest-environment jsdom
 */
import "whatwg-fetch"
import React from "react"
import fetchMock, { FetchMock } from "jest-fetch-mock"

import { Debug } from "../../../components/InstantBanditDebug"
import { Call, ExpectBanditReady } from "./test-components"
import { InstantBandit } from "../../../components/InstantBanditComponent"
import { InstantBanditState } from "../../../lib/contexts"
import { LoadState } from "../../../lib/types"
import { defined } from "../../../lib/utils"
import { disableJestLogging, renderTest, siteErrorResponse } from "../../test-utils"
import { TEST_SITE_AB } from "../../configs"


declare const fetch: Promise<Response> & FetchMock

disableJestLogging()

describe("InstantBandit component", () => {
  let count = 0
  let mounted = false

  beforeAll(() => {
    fetchMock.enableMocks()
    fetch.mockResponse(async (init) => await JSON.stringify(TEST_SITE_AB))
  })

  afterAll(() => {
    fetchMock.resetMocks()
  })

  beforeEach(() => {
    count = 0
    mounted = false
    sessionStorage.clear()
  })

  describe("initialization", () => {
    it("invokes a fetch for the the default config", async () => {
      fetch.mockResponseOnce(async (init) => {
        ++count
        return await JSON.stringify(TEST_SITE_AB)
      })

      await renderTest(<InstantBandit />)
      expect(count).toStrictEqual(1)
    })

    it("invokes a fetch for the variants", async () => {
      fetch.mockResponseOnce(async (init) => {
        ++count
        return await JSON.stringify(TEST_SITE_AB)
      })

      await renderTest(<InstantBandit />)
      expect(count).toStrictEqual(1)
    })

    it("should not invoke multiple load requests when mounted multiple times", async () => {
      fetch.mockResponses(async (init) => {
        ++count
        return await JSON.stringify(TEST_SITE_AB)
      })

      await renderTest(
        <>
          <InstantBandit />
          <InstantBandit />
          <InstantBandit />
        </>
      )

      expect(count).toStrictEqual(1)
    })

    it("renders child components during initialization", async () => {
      await renderTest(
        <InstantBandit>
          <ExpectBanditReady />
          <Call onFirstEffect={() => mounted = true} />
        </InstantBandit>
      )

      expect(mounted).toBe(true)
    })

    it("allows overriding the selection via props", async () => {
      // TODO: TEST
    })
  })

  describe("JSX variant declarations", () => {
    it("warns when an unknown variant registers", async () => {
      // TODO: TEST
    })
  })

  describe("metrics", () => {
    it("pushes metrics to the server when an variant is presented", async () => {
      // TODO: TEST
    })
  })

  describe("scope", () => {
    it("provides the variant to children via context", async () => {
      fetch.mockResponseOnce(async () => {
        return JSON.stringify(TEST_SITE_AB)
      })

      let gotVariant = false
      const component = await renderTest(
        <InstantBandit>
          <Debug onEffect={({ bandit }) => {
            if (!defined(bandit.variant)) return

            gotVariant = true
            expect(defined(bandit.variant)).toBe(true)
            expect(bandit.variant!.name.length).toBeGreaterThan(0)
          }} />
        </InstantBandit>
      )

      expect(gotVariant).toBe(true)
    })
  })

  describe("onReady", () => {
    it("calls the onReady callback", async () => {

      // NOTE: Can't assign type here or shows an error. TypeScript bug?
      let readyState
      await renderTest(
        <InstantBandit onReady={state => {
          readyState = state
          ++count
        }} />
      )
      expect(count).toStrictEqual(1)
      expect(defined(readyState)).toBe(true)
    })

    it("calls the onReady callback once for each instance", async () => {
      await renderTest(
        <>
          <InstantBandit onReady={() => ++count} />
          <InstantBandit onReady={() => ++count} />
          <InstantBandit onReady={() => ++count} />
        </>
      )
      expect(count).toStrictEqual(3)
    })
  })
})
