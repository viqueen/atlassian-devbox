#! /usr/bin/env node

import { executable } from '../lib/executable';

const program = executable({
    name: 'bamboo',
    groupId: 'com.atlassian.bamboo',
    webappName: 'atlassian-bamboo-web-app',
    contextPath: '/bamboo',
    httpPort: 6990,
    ajpPort: 6009,
    debugPort: 5005,
    plugins: [
        'com.atlassian.bamboo.plugins:atlassian-bamboo-plugin-test-utils'
    ],
    jvmArgs: [
        '-Datlassian.darkfeature.bamboo.experimental.rest.admin.enabled=true'
    ]
});

// eslint-disable-next-line @typescript-eslint/no-var-requires
program.version(require('../../package.json').version);
program.parse(process.argv);
