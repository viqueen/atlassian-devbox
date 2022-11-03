#! /usr/bin/env node

import { executable } from '../lib/executable';

const program = executable({
    name: 'confluence',
    contextPath: '/confluence',
    httpPort: 1990,
    ajpPort: 8009,
    plugins: []
});

program.version(require('../../package.json').version);
program.parse(process.argv);
