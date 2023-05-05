## environment

- **[nvm](https://github.com/nvm-sh/nvm)** to manage node versions.

```bash
brew install nvm
```

- **[yarn](https://yarnpkg.com/)** as node package manager

```bash
brew install yarn
```

## development setup

- create a fork of the repo, clone it, and install the dependencies

```bash
cd atlassian-devbox
nvm install
yarn
```

- set up git hooks

```bash
npx husky install
```

- build it in watch mode

```bash
yarn build --watch
```

- you can now use the cli

```bash
./atlasdev <product> <command_name> [command_args] [command_options]
```
