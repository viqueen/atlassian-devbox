#! /usr/bin/env node

import AtlassianProduct from '../product/atlassian-product';

const Confluence = new AtlassianProduct({
    name: 'confluence',
    httpPort: 1990,
    contextPath: '/confluence',
    debugPort: 5005,
    ajpPort: 8009
});

const program = Confluence.get();

program.version(require('../../package.json').version);
program.parse(process.argv);
