#! /usr/bin/env node

import { executable } from '../lib/executable';

const program = executable({
    name: 'bitbucket',
    groupId: 'com.atlassian.bitbucket.server',
    webappName: 'bitbucket-webapp',
    contextPath: '/bitbucket',
    httpPort: 7990,
    ajpPort: 7009,
    debugPort: 5005,
    plugins: [],
    jvmArgs: []
});

// eslint-disable-next-line @typescript-eslint/no-var-requires
program.version(require('../../package.json').version);
program.parse(process.argv);
