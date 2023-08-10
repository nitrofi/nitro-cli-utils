import { confirm } from "@inquirer/prompts"
import chalk from "chalk"
import { exec, ExecException } from "child_process"
import fs from "fs"
import ora from "ora"
import path from "path"
import semver from "semver"
import { PACKAGE_NAME } from "../constants/constants"

export function toLowerCaseFirstLetter(str: string) {
  return str.charAt(0).toLowerCase() + str.slice(1)
}

export const logger = {
  error(...args: unknown[]) {
    console.log(chalk.red(...args))
  },
  warn(...args: unknown[]) {
    console.log(chalk.yellow(...args))
  },
  info(...args: unknown[]) {
    console.log(chalk.cyan(...args))
  },
  success(...args: unknown[]) {
    console.log(chalk.green(...args))
  },
}

export async function terminalPrompt(
  prompt: string
): Promise<ExecException | string> {
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

export async function getNPMPackageVersion() {
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

const promptUpdatePackage = async () =>
  await confirm({
    message: "Do you want to update package to latest version?",
  })

export async function checkForNewerVersion({
  skip,
}: {
  skip: boolean
}): Promise<{
  newPackageInstalled: boolean
}> {
  if (skip) return { newPackageInstalled: false }

  const locallyInstalledGlobalVersion =
    await checkInstalledGlobalPackageVersion(PACKAGE_NAME)

  if (typeof locallyInstalledGlobalVersion !== "string")
    return { newPackageInstalled: false }

  const updateCheckSpinner = ora(
    `Checking for package updates from NPM`
  ).start()

  const packageVersionFromNpm = await getNPMPackageVersion()

  updateCheckSpinner.stop()

  logger.info(`Latest version available from NPM: ${packageVersionFromNpm}`)

  if (typeof packageVersionFromNpm !== "string")
    return { newPackageInstalled: false }

  const newerPackageAvailableFromNPM = semver.lt(
    locallyInstalledGlobalVersion,
    packageVersionFromNpm
  )

  if (!newerPackageAvailableFromNPM) return { newPackageInstalled: false }

  logger.info("Newer package version available from NPM")

  const updatePrompt = await promptUpdatePackage()
  if (!updatePrompt) return { newPackageInstalled: false }

  const { success } = await updatePackage()

  if (!success) return { newPackageInstalled: false }

  return { newPackageInstalled: true }
}

export async function checkInstalledGlobalPackageVersion(packageName: string) {
  const grepResult = await terminalPrompt(
    `npm list --depth=0 -g | grep  ${packageName}`
  )

  if (typeof grepResult !== "string") return

  const semverPattern = new RegExp(/[0-9\.]+/)
  const version = grepResult.match(semverPattern)?.[0]

  if (typeof version !== "string") return

  return version
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
