#! /usr/bin/env node

import AtlassianProduct from '../product/atlassian-product';

const FeCru = new AtlassianProduct({
    name: 'fecru',
    groupId: 'com.atlassian.crucible',
    webappName: 'atlassian-crucible',
    plugins: [],
    httpPort: 3990,
    contextPath: '/fecru',
    debugPort: 5005,
    ajpPort: 3009,
    jvmArgs: []
});

const program = FeCru.get();

program.version(require('../../package.json').version);
program.parse(process.argv);
