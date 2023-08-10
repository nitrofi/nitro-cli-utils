#!/usr/bin/env node
import { checkbox } from "@inquirer/prompts"
import { spawn } from "child_process"
import { program } from "commander"
import figlet from "figlet"
import terminalLink from "terminal-link"
import { PACKAGE_NAME } from "./constants/constants"
import { createDatoBlockScaffold } from "./utils/datoComponentScaffold"
import {
  checkForNewerVersion,
  checkInstalledGlobalPackageVersion,
  logger,
} from "./utils/utils"

type CLIProcesses = "dato-block-scaffold" | "new-process"

async function promptCLIProcesses(): Promise<CLIProcesses[]> {
  return checkbox({
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
}

async function main() {
  // CLI flags
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
  
This is a CLI utility collection used at ${nitro}.
Locally installed package version: ${globalVersion}
  
************
    `)
  }

  if (cliFlagUpdated) {
    logger.info(`Running updated package version: ${globalVersion}`)
  }

  const { newPackageInstalled } = await checkForNewerVersion({
    skip: cliFlagUpdated,
  })

  if (newPackageInstalled) {
    // Spawn a child process to run updated package
    spawn("nitro-cli --updated", {
      stdio: "inherit",
      shell: true,
    })

    // Exit stale package after child process has been terminated
    return
  }

  if (!newPackageInstalled) {
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
