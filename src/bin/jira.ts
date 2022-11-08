#! /usr/bin/env node

import { executable } from '../lib/executable';

const program = executable({
    name: 'jira',
    groupId: 'com.atlassian.jira',
    webappName: 'atlassian-jira-webapp',
    contextPath: '/jira',
    httpPort: 2990,
    ajpPort: 9009,
    debugPort: 5005,
    plugins: [],
    jvmArgs: [
        '-Datlassian.mail.senddisabled=false',
        '-Datlassian.mail.popdisabled=false',
        '-Djira.websudo.is.disabled=true'
    ]
});

program.version(require('../../package.json').version);
program.parse(process.argv);
