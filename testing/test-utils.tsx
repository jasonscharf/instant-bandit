import { act, render, RenderResult } from "@testing-library/react"


/**
 * Renders a component, taking async effects into account via `act`
 * @param tree 
 * @returns 
 */
export async function renderTest(tree: React.ReactElement): Promise<RenderResult> {
  let rendered
  await act(async () => { rendered = await render(tree) })
  return rendered
}
