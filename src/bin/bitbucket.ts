#! /usr/bin/env node

import { executable } from '../lib/executable';

const program = executable({
    name: 'bitbucket',
    contextPath: '/bitbucket',
    httpPort: 7990,
    ajpPort: 7009,
    debugPort: 5005,
    plugins: []
});

program.version(require('../../package.json').version);
program.parse(process.argv);