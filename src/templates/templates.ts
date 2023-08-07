export const datoBlockTemplate = ({
  componentName,
}: {
  componentName: string
}) => `
import { Dato } from "@/graphql/dato/__generated__/types"

type DatoBlock${componentName}Props = { fragment: Dato.${componentName}Fragment }

/**
 * Function description (JSDoc)
 */
export function DatoBlock${componentName}({ fragment }: DatoBlock${componentName}Props) {

  return null
}
`

export const uiComponenentTemplate = ({
  componentName,
}: {
  componentName: string
}) => `
export type ${componentName}Props = {}

/**
 * Function description (JSDoc)
 */
export function ${componentName}(props: ${componentName}Props) {
  return null
}
`

export const uiComponenentStoryTemplate = ({
  componentName,
}: {
  componentName: string
}) => `
import { Meta, StoryObj } from '@storybook/react'
import { ${componentName} } from '../${componentName}'

const meta: Meta<typeof ${componentName}> = {
  title: 'ui/${componentName}',
  component: ${componentName},
  tags: ["autodocs"],
}

export default meta

type Story = StoryObj<typeof ${componentName}>

export const Default: Story = {
  args: {

  },
}

Default.parameters = {
  // viewport: {
  //   defaultViewport: 'xs',
  // },
  // layout: 'fullscreen',
}
`

export const datoBlockFragmentTemplate = ({
  componentName,
}: {
  componentName: string
}) => `
fragment ${componentName} on ${componentName}Record {
  __typename
}
`
