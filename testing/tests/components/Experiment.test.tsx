/**
 * @jest-environment jsdom
 */
import "whatwg-fetch"
import React from "react"
import fetchMock, { FetchMock } from "jest-fetch-mock"

import { Debug } from "../../components/InstantBanditDebug"
import { InstantBandit } from "../../components/InstantBandit"
import { InstantBanditLoadState, InstantBanditState } from "../../lib/contexts"
import { defined } from "../../lib/utils"
import { renderTest } from "../test-utils"
import { TEST_SITE_AB } from "../configs"


declare var fetch: Promise<Response> & FetchMock

describe("Experiment", () => {

  beforeAll(() => {
    fetchMock.enableMocks()
  })

  beforeEach(() => {
    sessionStorage.clear()
    fetchMock.resetMocks()
  })

  describe("visibility", () => {
    describe("marked default", () => {
      it("renders children", async () => {
        // TODO: TEST
      })

      it("renders children unless instructed not to", async () => {
        // TODO: TEST
      })
    })

    describe("suspense", () => {
      it("suspends its children while it's unselected", async () => {
        // TODO: TEST
      })

      it("correctly handles an error in suspended children", async () => {
        // TODO: TEST
      })
    })

    // TODO: Opacity filter?
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
})
