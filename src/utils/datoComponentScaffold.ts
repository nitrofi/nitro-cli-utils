import { checkbox, confirm, input } from "@inquirer/prompts"
import {
  cssModuleTemplate,
  datoBlockFragmentTemplate,
  datoBlockTemplate,
  uiComponenentStoryTemplate,
  uiComponenentTemplate,
} from "../templates/templates"
import {
  createFolder,
  logger,
  toLowerCaseFirstLetter,
  writeLocalFile,
} from "./utils"

type DatoComponentFiles =
  | "dato-block"
  | "ui-component"
  | "css-module"
  | "graphql-fragment"
  | "storybook-story"

async function promptUseDefaultPaths() {
  const useDefaultPaths = await confirm({
    message: "Use default paths for component files?",
  })
  if (!useDefaultPaths) logger.warn("Custom file paths not supported!")
}

async function promptComponentName() {
  const userInput = () =>
    input({
      message: "Input component name in PascalCase",
    })

  let componentNameInput = await userInput()

  const pascalCaseRegExp = new RegExp(/^[A-Z][A-Za-z]*$/)

  while (!pascalCaseRegExp.test(componentNameInput)) {
    logger.error("Name not PascalCase. Try again!")

    componentNameInput = await userInput()
  }

  return componentNameInput
}

export async function promptDatoComponentFiles(): Promise<
  DatoComponentFiles[]
> {
  return checkbox({
    message: "Which Dato component files would you like to create?",
    choices: [
      {
        name: "Dato block",
        value: "dato-block",
        checked: true,
      },
      {
        name: "UI component",
        value: "ui-component",
        checked: true,
      },
      {
        name: "CSS module",
        value: "css-module",
        checked: true,
      },
      {
        name: "GraphQL fragment",
        value: "graphql-fragment",
        checked: true,
      },
      {
        name: "Storybook story",
        value: "storybook-story",
        checked: true,
      },
    ],
  })
}

export async function createDatoBlockScaffold() {
  const datoComponents = await promptDatoComponentFiles()

  const hasCssModule = datoComponents.includes("css-module")

  await promptUseDefaultPaths()

  let componentName = await promptComponentName()

  datoComponents.forEach((component) => {
    switch (component) {
      case "dato-block": {
        const template = datoBlockTemplate({ componentName })

        const folderPath = `src/components/blocks/DatoBlock${componentName}`
        createFolder({
          folderPath,
        })

        const filePath = `${folderPath}/DatoBlock${componentName}.tsx`
        writeLocalFile({
          filePath,
          data: template,
        })

        logger.success(`✅ ${filePath}`)
        break
      }
      case "ui-component": {
        const template = uiComponenentTemplate({ componentName, hasCssModule })

        const folderPath = `src/components/ui/${componentName}`
        createFolder({
          folderPath,
        })

        const filePath = `${folderPath}/${componentName}.tsx`
        writeLocalFile({
          filePath,
          data: template,
        })

        logger.success(`✅ ${filePath}`)
        break
      }
      case "storybook-story": {
        const template = uiComponenentStoryTemplate({ componentName })

        const folderPath = `src/components/ui/${componentName}/stories`
        createFolder({
          folderPath,
        })

        const filePath = `${folderPath}/${componentName}.stories.tsx`
        writeLocalFile({
          filePath,
          data: template,
        })

        logger.success(`✅ ${filePath}`)
        break
      }
      case "graphql-fragment": {
        const template = datoBlockFragmentTemplate({ componentName })

        const folderPath = `src/graphql/dato/operations/queries/fragments`
        createFolder({
          folderPath,
        })

        const filePath = `${folderPath}/${componentName}.fragment.graphql`
        writeLocalFile({
          filePath,
          data: template,
        })

        logger.success(`✅ ${filePath}`)
        break
      }
      case "css-module": {
        const template = cssModuleTemplate({ componentName })

        const folderPath = `src/components/ui/${componentName}`
        createFolder({
          folderPath,
        })

        const filePath = `${folderPath}/${toLowerCaseFirstLetter(
          componentName
        )}.module.css`
        writeLocalFile({
          filePath,
          data: template,
        })

        logger.success(`✅ ${filePath}`)
        break
      }
    }
  })
}
