#! /usr/bin/env node

import { executable } from '../lib/executable';

const program = executable({
    name: 'confluence',
    groupId: 'com.atlassian.confluence',
    webappName: 'confluence-webapp',
    contextPath: '/confluence',
    httpPort: 1990,
    ajpPort: 8009,
    debugPort: 5005,
    plugins: [],
    jvmArgs: [
        '-Datlassian.plugins.startup.options=disable-addons=com.atlassian.migration.agent'
    ]
});

// eslint-disable-next-line @typescript-eslint/no-var-requires
program.version(require('../../package.json').version);
program.parse(process.argv);
