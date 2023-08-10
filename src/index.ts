#!/usr/bin/env node
import { checkbox, confirm, input } from "@inquirer/prompts"
import { logger } from "./utils/logger"
import {
  datoBlockFragmentTemplate,
  datoBlockTemplate,
  uiComponenentStoryTemplate,
  uiComponenentTemplate,
} from "./templates/templates"
import fs from "fs"
import path from "path"
import figlet from "figlet"
import terminalLink from "terminal-link"
import { exec } from "child_process"
import semver from "semver"
import ora from "ora"

type CLIProcesses = "dato-block-scaffold"

const promptCLIProcesses = async (): Promise<CLIProcesses[]> =>
  checkbox({
    message: "Which CLI utilities would you like to run?",
    choices: [
      {
        name: "React Dato component scaffold",
        value: "dato-block-scaffold",
        checked: true,
      },
    ],
  })

type DatoComponentFiles =
  | "dato-block"
  | "ui-component"
  | "graphql-fragment"
  | "storybook-story"

const promptDatoComponentFiles = async (): Promise<DatoComponentFiles[]> =>
  checkbox({
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

const promptUseDefaultPaths = async () => {
  const useDefaultPaths = await confirm({
    message: "Use default paths for component files?",
  })
  if (!useDefaultPaths) logger.warn("Custom file paths not supported!")
}

const promptUpdatePackage = async () =>
  await confirm({
    message: "Do you want to update package to latest version?",
  })

const promptComponentName = async () => {
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

export function writeLocalFile({
  filePath,
  data,
}: {
  filePath: string
  data: string | Buffer
}) {
  fs.writeFileSync(path.join(process.cwd(), filePath), data, "utf-8")
}

export function createFolder({ folderPath }: { folderPath: string }) {
  fs.mkdirSync(path.join(process.cwd(), folderPath), { recursive: true })
}

async function createDatoBlockScaffold() {
  const datoComponents = await promptDatoComponentFiles()

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
        const template = uiComponenentTemplate({ componentName })

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
          folderPath: `src/components/ui/${componentName}/stories`,
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
          folderPath: `src/graphql/dato/operations/queries/fragments`,
        })

        const filePath = `${folderPath}/${componentName}.fragment.graphql`
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

async function terminalPrompt(prompt: string) {
  return await new Promise((resolve, reject) => {
    exec(prompt, (error, stdout, stderr) => {
      if (error) {
        reject(error)
      } else {
        resolve(stdout)
      }
    })
  })
}

async function checkForNewerVersion({ skip }: { skip: boolean }) {
  if (skip) return false

  const packageName = process.env.npm_package_name
  const localVersion = process.env.npm_package_version

  if (!localVersion) return false

  const packageVersionFromNpm = await terminalPrompt(
    `npm view ${packageName} version`
  )

  if (typeof packageVersionFromNpm !== "string") return false

  const newerPackageAvailableFromNPM = semver.lt(
    localVersion,
    packageVersionFromNpm
  )

  if (newerPackageAvailableFromNPM) {
    logger.info("Newer package version available from NPM")

    const update = await promptUpdatePackage()

    if (update) {
      const spinner = ora(`Updating ${packageName}`).start()

      const updatePrompt = await terminalPrompt(`npm i -g ${packageName}`)

      spinner.stop()

      console.log(updatePrompt)
    }

    return true
  }

  return false
}

async function main({
  restartAfterUpdate = false,
}: {
  restartAfterUpdate?: boolean
}) {
  if (!restartAfterUpdate) {
    console.log(
      `
      `
    )
    console.log(
      figlet.textSync("Nitro", {
        font: "ANSI Regular",
      })
    )

    const nitro = terminalLink("Nitro", "https://nitro.fi")

    logger.success(`
************
  
This is a collection of CLI utils used at ${nitro} 🔥
  
************
    `)
  }

  const updated = await checkForNewerVersion({ skip: restartAfterUpdate })

  if (updated) {
    // Restart process
    main({ restartAfterUpdate: true })
    return
  }

  if (!updated) {
    const cliProcesses = await promptCLIProcesses()

    cliProcesses.forEach(async (process) => {
      switch (process) {
        case "dato-block-scaffold":
          await createDatoBlockScaffold()
          break
      }
    })
  }
}

main({})
