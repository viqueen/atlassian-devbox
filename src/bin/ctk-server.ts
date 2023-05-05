#! /usr/bin/env node

import { executable } from '../lib/executable';

const program = executable({
    name: 'ctk-server',
    groupId: 'com.atlassian.federation',
    webappName: 'federated-api-ctk-server-distribution',
    contextPath: '/ctk',
    httpPort: 8990,
    ajpPort: 18009,
    debugPort: 5005,
    plugins: [],
    jvmArgs: []
});

// eslint-disable-next-line @typescript-eslint/no-var-requires
program.version(require('../../package.json').version);
program.parse(process.argv);
