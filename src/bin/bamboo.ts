#! /usr/bin/env node

import { executable } from '../lib/executable';

const program = executable({
    name: 'bamboo',
    contextPath: '/bamboo',
    httpPort: 6990,
    ajpPort: 6009,
    plugins: ['com.atlassian.bamboo.plugins:atlassian-bamboo-plugin-test-utils']
});

program.version(require('../../package.json').version);
program.parse(process.argv);
