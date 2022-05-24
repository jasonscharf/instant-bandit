import { defined } from "../../lib/utils"


describe("utils", () => {
  describe("defined", () => {
    it("returns false for null", () => expect(defined(null)).toStrictEqual(false))
    it("returns false for undefined", () => expect(defined(undefined)).toStrictEqual(false))
    it("returns true for an empty string", () => expect(defined("")).toStrictEqual(true))
    it("returns true for 0", () => expect(defined(0)).toStrictEqual(true))
    it("returns true for NaN", async () => expect(defined(0)).toStrictEqual(true))
  })
})
