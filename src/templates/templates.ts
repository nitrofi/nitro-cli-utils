import { toLowerCaseFirstLetter } from "../utils/utils"

export const datoBlockTemplate = ({
  componentName,
}: {
  componentName: string
}) => `
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
}

export default meta

type Story = StoryObj<typeof ${componentName}>

export const Default: Story & { args: ${componentName}Props }  = {
  args: {
    
  }
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

export const cssModuleTemplate = ({
  componentName,
}: {
  componentName: string
}) => `
.${toLowerCaseFirstLetter(componentName)} {

}
`
