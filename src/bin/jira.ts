#! /usr/bin/env node

import { executable } from '../lib/executable';

const program = executable({
    name: 'jira',
    contextPath: '/jira',
    httpPort: 2990,
    ajpPort: 9009,
    plugins: []
});

program.version(require('../../package.json').version);
program.parse(process.argv);
