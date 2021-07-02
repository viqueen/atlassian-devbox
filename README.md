# atlassian-devbox

## requirements

* [java - 8 / 11](https://adoptopenjdk.net/)
* [maven - 3.6.x / 3.8.x](https://maven.apache.org/install.html)
* [node](https://nodejs.org/en/)

## install it

### from source

```bash
git clone git@github.com:viqueen/atlassian-devbox.git
cd atlassian-devbox

npm install
npm link
```

## use it

It comes with the following enterprise product scripts that behave exactly the same

```bash
# running and debugging atlassian server instances
confluence -h
jira -h
bitbucket -h
bamboo -h
crowd -h
```

For example this is what the Confluence script documentation looks like

```bash
Usage: confluence [options] [command]

Options:
  -hp, --http-port <httpPort>        with http port (default: "1990")
  -dp, --debug-port <debugPort>      with debug port (default: "5005")
  -cp, --context-path <contextPath>  with context path (default: "/confluence")
  -ap, --ajp-port <ajpPort>          with ajp port (default: "8009")
  -V, --version                      output the version number
  -h, --help                         display help for command

Commands:
  start <version>                    runs confluence
  debug <version>                    runs confluence with debug port open
  instances                          lists installed confluence instances
  versions                           lists available versions in local maven repo
  help [command]                     display help for command
```
