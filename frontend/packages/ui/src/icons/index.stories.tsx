import type { Meta, StoryObj } from '@storybook/react'
import type { FC } from 'react'
import { InfoIcon } from './InfoIcon'

const icons = [InfoIcon]

const IconList: FC = () => {
  return (
    <ul
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        padding: '16px',
      }}
    >
      {icons.map((Icon) => (
        <li
          key={Icon.name}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            width: '120px',
            padding: '8px',
            fontSize: '12px',
          }}
        >
          <Icon width={24} height={24} />
          <div
            style={{
              width: '100%',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              textAlign: 'center',
            }}
          >
            <span>{Icon.name}</span>
          </div>
        </li>
      ))}
    </ul>
  )
}

const meta = {
  component: IconList,
} satisfies Meta<typeof IconList>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
