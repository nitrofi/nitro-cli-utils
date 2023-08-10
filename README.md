# Nitro CLI utility collection

A collection of helpful CLI utilities

## Features

- Scaffold React component files for DatoCMS
  - Block
  - UI component
  - Storybook story
  - GraghQL fragment
  - CSS Module
- Automated package update

## Install

Install the CLI tool globally

```bash
npm i -g @nitrofi/cli-utils
```

## Use

Access the tool via terminal

```bash
nitro-cli
```

## Contributing for a release

Easiest way to contribute is to open new issues for API suggestions and bugs.

```bash
git clone git@github.com:nitrofi/nitro-cli-utils.git
cd nitro-cli-utils
git switch dev # or alternatively create a feature branch
npm run dev
```

`main` branch should only be merged to via pull requests.

Run build:

```bash
npm run start
```

When all changes are done:

```bash
$ npm run create-release
$ git add . && git commit && git push
```

Create PR on GitHub or with GitHub CLI

```bash
gh pr create --base main --head dev
```

If the PR needs changes before a merge to `main` can be made, push more changes to the working branch until the PR can be merged.
