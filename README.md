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

## Contributing for a release

Easiest way to contribute is to open new issues for API suggestions and bugs.

#### Internal users

```bash
git clone git@github.com:nitrofi/nitro-cli-utils.git
git switch dev # or alternatively create a feature branch
npm run dev
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

#### External users

Same as for internal users but PRs need to be created against a forked branch.
