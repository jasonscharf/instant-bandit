/**
 * @jest-environment jsdom
 */
import "whatwg-fetch"
import React from "react"
import fetchMock, { FetchMock } from "jest-fetch-mock"

declare const fetch: Promise<Response> & FetchMock


describe("Placeholder", () => {
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

  it("is present during loading", () => {
    // TODO: TEST
  })
})
