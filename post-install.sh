#! /usr/bin/env bash

npm run build:prod
mkdir -p ~/.atlassian-devbox
cp atlassian-settings.xml ~/.atlassian-devbox/