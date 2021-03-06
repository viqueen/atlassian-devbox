#! /usr/bin/env node

import AtlassianProduct from '../product/atlassian-product';

const Confluence = new AtlassianProduct({
    name: 'confluence',
    groupId: 'com.atlassian.confluence',
    webappName: 'confluence-webapp',
    plugins: [],
    httpPort: 1990,
    contextPath: '/confluence',
    debugPort: 5005,
    ajpPort: 8009,
    jvmArgs: [
        '-Datlassian.plugins.startup.options=disable-addons=com.atlassian.migration.agent'
    ]
});

const program = Confluence.get();

program.version(require('../../package.json').version);
program.parse(process.argv);
