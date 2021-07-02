#! /usr/bin/env node

import AtlassianProduct from '../product/atlassian-product';

const Bamboo = new AtlassianProduct({
    name: 'bamboo',
    groupId: 'com.atlassian.bamboo',
    webappName: 'atlassian-bamboo-web-app',
    httpPort: 6990,
    contextPath: '/bamboo',
    debugPort: 5005,
    ajpPort: 6009
});

const program = Bamboo.get();

program.version(require('../../package.json').version);
program.parse(process.argv);
