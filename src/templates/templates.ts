import { toLowerCaseFirstLetter } from "../utils/utils"

export const datoBlockTemplate = ({
  componentName,
}: {
  componentName: string
}) => `
import "server-only"
import { Dato } from "@/graphql/dato/__generated__/types"
import { ${componentName} } from "@/components/ui/${componentName}/${componentName}"

type DatoBlock${componentName}Props = { fragment: Dato.${componentName}Fragment }

/**
 * Function description (JSDoc)
 */
export function DatoBlock${componentName}({ fragment }: DatoBlock${componentName}Props) {

  return <${componentName} />
}
`

export const uiComponenentTemplate = ({
  componentName,
  hasCssModule,
}: {
  componentName: string
  hasCssModule: boolean
}) => `
import "server-only"
${
  hasCssModule
    ? `import styles from "./${toLowerCaseFirstLetter(
        componentName
      )}.module.css"`
    : ""
}

export type ${componentName}Props = {}

/**
 * Function description (JSDoc)
 */
export function ${componentName}(props: ${componentName}Props) {
  return (
    <div${
      hasCssModule
        ? ` className={styles.${toLowerCaseFirstLetter(componentName)}}`
        : ""
    }>
  
    </div>
  )
}
`

export const uiComponenentStoryTemplate = ({
  componentName,
}: {
  componentName: string
}) => `
import { Meta, StoryObj } from '@storybook/react'
import { ${componentName}, ${componentName}Props } from '../${componentName}'

const meta: Meta<typeof ${componentName}> = {
  title: 'ui/${componentName}',
  component: ${componentName},
  tags: ["autodocs"],
  /* Parameters for all stories. Can be defined also per story. */
  parameters: {
    /* Opens story in a predefined layout (needs to be defined in .storybook/preview.js) */
    // viewport: {
    //   defaultViewport: 'xs',
    // },
    /* Removes padding in stories */
    layout: "fullscreen",
  },
}

export default meta

type Story = StoryObj<typeof ${componentName}>

/**
 * Use this export easily when composing stories.
 *
 * @example
 *
 * <${componentName} {...${componentName}StoryDefault.args} />
 */
export const ${componentName}StoryDefault: Story & {
  /* Extending the Story type fixes problems with incorrect types when composing stories */
  args: ${componentName}Props
} = {
  name: "Default",
  args: {

  },
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

export const cssModuleTemplate = ({
  componentName,
}: {
  componentName: string
}) => `
.${toLowerCaseFirstLetter(componentName)} {

}
`
