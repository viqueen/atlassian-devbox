#! /usr/bin/env node

import { executable } from '../lib/executable';

const program = executable({
    name: 'fecru',
    groupId: 'com.atlassian.crucible',
    webappName: 'atlassian-crucible',
    contextPath: '/fecru',
    httpPort: 3990,
    ajpPort: 3009,
    debugPort: 5005,
    plugins: [],
    jvmArgs: []
});

// eslint-disable-next-line @typescript-eslint/no-var-requires
program.version(require('../../package.json').version);
program.parse(process.argv);
