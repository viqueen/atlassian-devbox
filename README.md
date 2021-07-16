# atlassian-devbox

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=viqueen_atlassian-devbox&metric=alert_status)](https://sonarcloud.io/dashboard?id=viqueen_atlassian-devbox)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=viqueen_atlassian-devbox&metric=security_rating)](https://sonarcloud.io/dashboard?id=viqueen_atlassian-devbox)
[![Known Vulnerabilities](https://snyk.io/test/github/viqueen/atlassian-devbox/badge.svg?targetFile=package.json)](https://snyk.io/test/github/viqueen/atlassian-devbox?targetFile=package.json)
[![npm version](https://badge.fury.io/js/atlassian-devbox.svg)](https://badge.fury.io/js/atlassian-devbox)

## requirements

* [java - 8 / 11](https://adoptopenjdk.net/)
* [maven - 3.6.x / 3.8.x](https://maven.apache.org/install.html)
* [node](https://nodejs.org/en/)

## install it

### from npm

* first time
```bash
npm install -g atlassian-devbox
```

* does it need an update ?
```bash
npm outdated -g --depth=0
```

* update it
```bash
npm update -g atlassian-devbox
```

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
fecru -h
```

For example this is what the Confluence script documentation looks like

```bash
Usage: confluence [options] [command]

Options:
  -hp, --http-port <httpPort>        with http port (default: "1990")
  -dp, --debug-port <debugPort>      with debug port (default: "5005")
  -cp, --context-path <contextPath>  with context path (default: "/confluence")
  -ap, --ajp-port <ajpPort>          with ajp port (default: "8009")
  --plugins <plugins>                with plugins
  --jvm-args <jvmArgs>               with jvmargs
  --amps-version <ampsVersion>       with amps version (default: "8.2.0")
  -V, --version                      output the version number
  -h, --help                         display help for command

Commands:
  start <version>                    runs confluence
  debug <version>                    runs confluence with debug port open
  cmd <name> <version>               prints the resolved command
  list                               lists installed confluence instances
  remove <pattern>                   removes confluence instance with version matching given pattern
  logs <version>                     tails confluence logs
  versions                           lists available confluence versions in local maven repo
  purge <type>                       purges available confluence versions in local maven repo
  help [command]                     display help for command
```

* start a confluence instance
```bash
confluence start 7.4.9
```

* tail the logs
```bash
confluence logs 7.4.9
```

* debug a confluence instance
```bash
confluence debug 7.4.9
```

* print the underlying command
```bash
confluence cmd start 7.4.9
confluence cmd debug 7.4.9
```

* list installed versions
```bash
confluence list
```

* remove some installed version
```bash
confluence remove 7.4.9
confluence remove 7.4 # removes all 7.4.x instances
```

* list available versions in local cache
```bash
confluence versions
```

* purge versions in local cache
```bash
confluence purge internal # remove any snapshots / milestones / beta / release candidates
confluence purge all      # purges the whole thing
```
