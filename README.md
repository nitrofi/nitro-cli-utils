# Nitro CLI utility collection

A collection of helpful CLI utils

## Install

Install the CLI tool globally

```bash
npm i -g @nitrofi/cli-utils
```

## Use

Access the tool via terminal

```bash
$ nitro-cli
```

## Contributing

Easiest way to contribute is to open new issues for API suggestions and bugs.

### Contributing for a release

Steps for contributing through a pull request:

- Fork `main` on Github and clone fork locally
- Install dependencies
  - `npm ci`
- Make changes
- Once all changes are complete, create a new release with [changesets](https://github.com/changesets/changesets)
  - `npm run create-release`
- Commit and push changes to fork
- Open a pull request against the fork
- If the PR needs changes before a merge to `main` can be made, push more changes to the fork until the PR is approved
