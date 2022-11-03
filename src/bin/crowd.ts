#! /usr/bin/env node

import { executable } from '../lib/executable';

const program = executable({
    name: 'crowd',
    contextPath: '/crowd',
    httpPort: 4990,
    ajpPort: 4009,
    debugPort: 5005,
    plugins: []
});

program.version(require('../../package.json').version);
program.parse(process.argv);
