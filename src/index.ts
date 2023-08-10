#!/usr/bin/env node
import { checkbox, confirm, input } from "@inquirer/prompts"
import { logger } from "./utils/logger"
import {
  cssModuleTemplate,
  datoBlockFragmentTemplate,
  datoBlockTemplate,
  uiComponenentStoryTemplate,
  uiComponenentTemplate,
} from "./templates/templates"
import fs from "fs-extra"
import path from "path"
import figlet from "figlet"
import terminalLink from "terminal-link"
import { exec, ExecException } from "child_process"
import semver from "semver"
import ora from "ora"
import { toLowerCaseFirstLetter } from "./utils/utils"
import { program } from "commander"

type CLIProcesses = "dato-block-scaffold" | "new-process"

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
      {
        name: "Add your own commands",
        value: "new-process",
        checked: false,
      },
    ],
  })

type DatoComponentFiles =
  | "dato-block"
  | "ui-component"
  | "css-module"
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

async function terminalPrompt(prompt: string): Promise<ExecException | string> {
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

async function updatePackage(): Promise<{ success: boolean }> {
  const spinner = ora(`Updating ${PACKAGE_NAME}`).start()

  const updatePrompt = await terminalPrompt(`npm i -g ${PACKAGE_NAME}`)
  spinner.stop()
  console.log(updatePrompt)

  if (typeof updatePrompt !== "string")
    return {
      success: false,
    }

  return { success: true }
}

async function checkForNewerVersion({ skip }: { skip: boolean }): Promise<{
  updated: boolean
}> {
  if (skip) return { updated: false }

  const locallyInstalledGlobalVersion =
    await checkInstalledGlobalPackageVersion(PACKAGE_NAME)

  if (typeof locallyInstalledGlobalVersion !== "string")
    return { updated: false }

  const updateCheckSpinner = ora(
    `Checking for package updates from NPM`
  ).start()

  const packageVersionFromNpm = await getNPMPackageVersion()

  updateCheckSpinner.stop()

  logger.info(`Latest version available from NPM: ${packageVersionFromNpm}`)

  if (typeof packageVersionFromNpm !== "string") return { updated: false }

  const newerPackageAvailableFromNPM = semver.lt(
    locallyInstalledGlobalVersion,
    packageVersionFromNpm
  )

  if (!newerPackageAvailableFromNPM) return { updated: false }

  logger.info("Newer package version available from NPM")

  const updatePrompt = await promptUpdatePackage()
  if (!updatePrompt) return { updated: false }

  const { success } = await updatePackage()

  if (!success) return { updated: false }

  return { updated: true }
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

async function main() {
  program.option("--updated")
  program.parse()

  const cliOptions = program.opts()

  /**
   * If update flag was passed to cli
   *
   * @example
   *
   * ```bash
   * $ nitro-cli --updated
   * or when developing
   * $ npm run start -- --updated
   * ```
   */
  const cliFlagUpdated = cliOptions.updated

  const globalVersion = await checkInstalledGlobalPackageVersion(PACKAGE_NAME)

  if (!cliFlagUpdated) {
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

  if (cliFlagUpdated) {
    logger.info(`Running updated package version: ${globalVersion}`)
  }

  const { updated } = await checkForNewerVersion({
    skip: cliFlagUpdated,
  })

  if (updated) {
    // Restart process after update
    await terminalPrompt("nitro-cli --updated")
    return
  }

  if (!updated) {
    const cliProcesses = await promptCLIProcesses()

    cliProcesses.forEach(async (process) => {
      switch (process) {
        case "dato-block-scaffold":
          await createDatoBlockScaffold()
          break
        case "new-process":
          logger.success("Follow collaboration guide in README.md")
          break
      }
    })
  }
}

main()
