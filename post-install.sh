#! /usr/bin/env bash

npm run build:prod
mkdir -p ~/.atlassian-products
cp atlassian-settings.xml ~/.atlassian-products/