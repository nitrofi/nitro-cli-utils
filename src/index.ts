#!/usr/bin/env node
import { checkbox, confirm, input } from "@inquirer/prompts"
import { logger } from "./utils/logger"
import {
  datoBlockFragmentTemplate,
  datoBlockTemplate,
  uiComponenentStoryTemplate,
  uiComponenentTemplate,
} from "./templates/templates"
import fs from "fs-extra"
import path from "path"
import figlet from "figlet"
import terminalLink from "terminal-link"
import { exec } from "child_process"
import semver from "semver"
import ora from "ora"

type CLIProcesses = "dato-block-scaffold"

const PACKAGE_NAME = "@nitrofi/cli-utils"

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

async function getNPMPackageVersion() {
  return await terminalPrompt(`npm view ${PACKAGE_NAME} version`)
}

async function checkForNewerVersion({ skip }: { skip: boolean }) {
  if (skip) return false

  const locallyInstalledGlobalVersion =
    await checkInstalledGlobalPackageVersion(PACKAGE_NAME)

  if (typeof locallyInstalledGlobalVersion !== "string") return false

  const updateCheckSpinner = ora(
    `Checking for package updates from NPM`
  ).start()

  const packageVersionFromNpm = await getNPMPackageVersion()

  updateCheckSpinner.stop()

  logger.info(`Latest version available from NPM: ${packageVersionFromNpm}`)

  if (typeof packageVersionFromNpm !== "string") return false

  const newerPackageAvailableFromNPM = semver.lt(
    locallyInstalledGlobalVersion,
    packageVersionFromNpm
  )

  if (newerPackageAvailableFromNPM) {
    logger.info("Newer package version available from NPM")

    const update = await promptUpdatePackage()

    if (update) {
      const spinner = ora(`Updating ${PACKAGE_NAME}`).start()

      const updatePrompt = await terminalPrompt(`npm i -g ${PACKAGE_NAME}`)

      spinner.stop()

      console.log(updatePrompt)
    }

    return true
  }

  return false
}

async function checkInstalledGlobalPackageVersion(packageName: string) {
  const grepResult = await terminalPrompt(
    `npm list --depth=0 -g | grep  ${packageName}`
  )

  if (typeof grepResult !== "string") return

  const semverPattern = new RegExp(/[0-9\.]+/)
  const version = grepResult.match(semverPattern)?.[0]

  if (typeof version !== "string") return

  return version
}

async function main({
  restartAfterUpdate = false,
}: {
  restartAfterUpdate?: boolean
}) {
  const globalVersion = await checkInstalledGlobalPackageVersion(PACKAGE_NAME)

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
Locally installed package version: ${globalVersion}
  
************
    `)
  }

  const updated = await checkForNewerVersion({
    skip: restartAfterUpdate,
  })

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
