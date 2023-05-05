#! /usr/bin/env node

import { executable } from '../lib/executable';

const program = executable({
    name: 'crowd',
    groupId: 'com.atlassian.crowd',
    webappName: 'crowd-web-app',
    contextPath: '/crowd',
    httpPort: 4990,
    ajpPort: 4009,
    debugPort: 5005,
    plugins: [],
    jvmArgs: []
});

// eslint-disable-next-line @typescript-eslint/no-var-requires
program.version(require('../../package.json').version);
program.parse(process.argv);
