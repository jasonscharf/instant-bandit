/**
 * @jest-environment jsdom
 */
import "whatwg-fetch"
import React from "react"
import fetchMock, { FetchMock } from "jest-fetch-mock"
import { screen, } from "@testing-library/react"

import { Call, Catch, ExpectBanditReady, ThrowIfPresented } from "./test-components"
import { Debug } from "../../../components/InstantBanditDebug"
import { InstantBandit } from "../../../components/InstantBanditComponent"
import { Variant } from "../../../components/Variant"
import { renderTest } from "../../test-utils"
import { TEST_SITE_AB } from "../../configs"


describe("Variant", () => {
  let count = 0
  let mounted = false

  beforeAll(() => {
    fetchMock.enableMocks()
    fetch.mockResponses(async (init) => {
      return await JSON.stringify(TEST_SITE_AB)
    })
  })

  afterAll(() => {
    fetchMock.resetMocks()
  })

  beforeEach(() => {
    count = 0
    mounted = false
    sessionStorage.clear()
  })

  afterEach(() => {
    fetchMock.resetMocks()
  })

  describe("visibility", () => {
    it("only presents children when it is selected", async () => {
      const invisible = "is-not-rendered"
      const visible = "is-rendered"

      const component = await renderTest(
        <InstantBandit select="B">
          <Variant name="A">
            <div data-test-id={invisible} />
          </Variant>
          <Variant name="B">
            <div data-test-id={visible} />
          </Variant>
        </InstantBandit>
      )

      // TODO: Finish
    })

    it("hides itself when the variant isn't selected", async () => {
      let countA = 0
      let countB = 0
      let countC = 0

      const component = await renderTest(
        <Catch>
          <InstantBandit select="B">

            <Variant name="A">
              <Debug onFirstRender={() => ++countA} />
            </Variant>

            <Variant name="B">
              <Debug onFirstRender={() => ++countB} />
            </Variant>

            <Variant name="C">
              <Debug onFirstRender={() => ++countC} />
            </Variant>

          </InstantBandit>
        </Catch>
      )

      expect(countA).toBe(0)
      expect(countB).toBe(1)
      expect(countC).toBe(0)
    })

    it("does not present if unnamed and a variant is selected", async () => {
      let count = 0
      const component = await renderTest(
        <InstantBandit select="B">
          <Variant><Debug onFirstEffect={() => ++count} /></Variant>
          <Variant><Debug onFirstEffect={() => ++count} /></Variant>
          <Variant><Debug onFirstEffect={() => ++count} /></Variant>
        </InstantBandit>
      )

      expect(count).toBe(0)
    })

    it("has the correct scope", async () => {

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

declare const fetch: Promise<Response> & FetchMock
