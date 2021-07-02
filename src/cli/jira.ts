#! /usr/bin/env node

import AtlassianProduct from '../product/atlassian-product';

const Jira = new AtlassianProduct({
    name: 'jira',
    groupId: 'com.atlassian.jira',
    webappName: 'atlassian-jira-webapp',
    plugins: [],
    httpPort: 2990,
    contextPath: '/jira',
    debugPort: 5005,
    ajpPort: 9009,
    jvmArgs: [
        '-Datlassian.mail.senddisabled=false',
        '-Djira.websudo.is.disabled=true'
    ]
});

const program = Jira.get();

program.version(require('../../package.json').version);
program.parse(process.argv);
