import { aTable } from '@liam-hq/db-structure'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactFlowProvider } from '@xyflow/react'
import { NuqsTestingAdapter } from 'nuqs/adapters/testing'
import { type FC, type ReactNode, useContext } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { SchemaProvider, UserEditingProvider } from '@/stores'
import type { SchemaStore } from '@/stores/schema/schema'
import { UserEditingContext } from '@/stores/userEditing/context'
import { CommandPalette } from './CommandPalette'

afterEach(() => {
  cleanup()
})

const schema: SchemaStore = {
  current: {
    tables: {
      users: aTable({ name: 'users' }),
      posts: aTable({ name: 'posts' }),
      follows: aTable({ name: 'follows' }),
      user_settings: aTable({ name: 'user_settings' }),
    },
    tableGroups: {},
    relationships: {},
  },
}

const ActiveTableNameDisplay: FC = () => {
  const userEditing = useContext(UserEditingContext)

  return (
    //  The currently selected table name is displayed via Context, and used in tests for assertions.
    <div data-testid="test-active-table-name-display">
      {userEditing?.activeTableName}
    </div>
  )
}

const wrapper = ({ children }: { children: ReactNode }) => (
  <NuqsTestingAdapter>
    <ReactFlowProvider>
      <UserEditingProvider>
        <ActiveTableNameDisplay />
        <SchemaProvider schema={schema}>{children}</SchemaProvider>
      </UserEditingProvider>
    </ReactFlowProvider>
  </NuqsTestingAdapter>
)

const prepareCommandPalette = async () => {
  const user = userEvent.setup()

  render(<CommandPalette />, { wrapper })

  await user.keyboard('{Meta>}k{/Meta}')
  const dialog = await screen.findByRole('dialog', {
    name: 'Command Palette',
  })
  const searchCombobox = within(dialog).getByRole('combobox')
  const preview = within(dialog).getByTestId('CommandPalettePreview')

  return { user, elements: { dialog, searchCombobox, preview } }
}

it('displays nothing by default', () => {
  render(<CommandPalette />, { wrapper })

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

describe('dialog opening interactions', () => {
  it('opens the dialog with typing ⌘K', async () => {
    const user = userEvent.setup()

    render(<CommandPalette />, { wrapper })

    await user.keyboard('{Meta>}k{/Meta}')

    expect(
      screen.getByRole('dialog', { name: 'Command Palette' }),
    ).toBeInTheDocument()
  })

  it('opens the dialog with typing ctrl+K', async () => {
    const user = userEvent.setup()

    render(<CommandPalette />, { wrapper })

    await user.keyboard('{Control>}k{/Control}')

    expect(
      screen.getByRole('dialog', { name: 'Command Palette' }),
    ).toBeInTheDocument()
  })
})

describe('options and combobox interactions', () => {
  it('renders options with table name', async () => {
    const {
      elements: { dialog },
    } = await prepareCommandPalette()

    expect(within(dialog).getAllByRole('option')).toHaveLength(4)
    expect(within(dialog).getByRole('option', { name: 'users' }))
    expect(within(dialog).getByRole('option', { name: 'posts' }))
    expect(within(dialog).getByRole('option', { name: 'follows' }))
    expect(within(dialog).getByRole('option', { name: 'user_settings' }))
  })

  it('filters options based on user input in the combobox', async () => {
    const {
      user,
      elements: { dialog, searchCombobox },
    } = await prepareCommandPalette()

    expect(searchCombobox).toHaveFocus()

    await user.keyboard('user')

    expect(within(dialog).getAllByRole('option')).toHaveLength(2)
    expect(within(dialog).getByRole('option', { name: 'users' }))
    expect(within(dialog).getByRole('option', { name: 'user_settings' }))
  })

  it('renders "No results found." if user input does not match any options', async () => {
    const {
      user,
      elements: { dialog, searchCombobox },
    } = await prepareCommandPalette()

    expect(searchCombobox).toHaveFocus()

    await user.keyboard('HelloWorld')

    expect(within(dialog).queryByRole('option')).not.toBeInTheDocument()
    expect(within(dialog).getByText('No results found.')).toBeInTheDocument()
  })
})

describe('preview with option interactions', () => {
  it('displays a preview of the option hovered', async () => {
    const {
      user,
      elements: { dialog, preview },
    } = await prepareCommandPalette()

    expect(within(preview).getByText('users')).toBeInTheDocument()

    await user.hover(within(dialog).getByRole('option', { name: 'follows' }))

    expect(within(preview).getByText('follows')).toBeInTheDocument()
  })

  it('displays a preview of the option selected via arrow key navigation', async () => {
    const {
      user,
      elements: { preview },
    } = await prepareCommandPalette()

    expect(within(preview).getByText('users')).toBeInTheDocument()

    await user.keyboard('{ArrowDown}')
    expect(within(preview).getByText('posts')).toBeInTheDocument()

    await user.keyboard('{ArrowDown}')
    expect(within(preview).getByText('follows')).toBeInTheDocument()

    await user.keyboard('{ArrowUp}')
    expect(within(preview).getByText('posts')).toBeInTheDocument()
  })
})

describe('go to ERD with option select', () => {
  it('go to the table of clicked option and close dialog', async () => {
    const {
      user,
      elements: { dialog },
    } = await prepareCommandPalette()

    expect(
      screen.getByTestId('test-active-table-name-display'),
    ).toBeEmptyDOMElement()

    await user.click(within(dialog).getByRole('option', { name: 'follows' }))

    expect(
      screen.getByTestId('test-active-table-name-display'),
    ).toHaveTextContent('follows')
    expect(dialog).not.toBeInTheDocument()
  })

  it('go to the table of selected option by typing Enter key and close dialog', async () => {
    const {
      user,
      elements: { dialog, preview },
    } = await prepareCommandPalette()

    expect(
      screen.getByTestId('test-active-table-name-display'),
    ).toBeEmptyDOMElement()

    // select "posts" option by typing Enter key
    await user.keyboard('{ArrowDown}')
    expect(within(preview).getByText('posts')).toBeInTheDocument()
    await user.keyboard('{Enter}')

    expect(dialog).not.toBeInTheDocument()
    expect(
      screen.getByTestId('test-active-table-name-display'),
    ).toHaveTextContent('posts')
  })
})
