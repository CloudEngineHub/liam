import { renderHook } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactFlowProvider } from '@xyflow/react'
import { afterEach, expect, it, vi } from 'vitest'
import * as ReactFlowHooks from '@/features/reactflow/hooks'
import { useSubscribeZoomToFitCommand } from './useSubscribeZoomToFitCommand'

const mockFitView = vi.fn()

const originalUseCustomReactflow = ReactFlowHooks.useCustomReactflow
vi.spyOn(ReactFlowHooks, 'useCustomReactflow').mockImplementation(() => {
  const original = originalUseCustomReactflow()
  return {
    ...original,
    fitView: mockFitView,
  }
})

afterEach(() => {
  vi.clearAllMocks()
})

const wrapper = ({ children }: React.PropsWithChildren) => (
  <ReactFlowProvider>{children}</ReactFlowProvider>
)

it('zooms to fit nodes when ⇧1 is pressed', async () => {
  const user = userEvent.setup()
  renderHook(() => useSubscribeZoomToFitCommand(), { wrapper })

  await user.keyboard('{Shift>}1{/Shift}')

  expect(mockFitView).toHaveBeenCalled()
})
