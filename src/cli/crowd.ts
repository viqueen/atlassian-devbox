#! /usr/bin/env node

import AtlassianProduct from '../product/atlassian-product';

const Crowd = new AtlassianProduct({
    name: 'crowd',
    groupId: 'com.atlassian.crowd',
    webappName: 'crowd-web-app',
    plugins: [],
    httpPort: 4990,
    contextPath: '/crowd',
    debugPort: 5005,
    ajpPort: 4009,
    jvmArgs: []
});

const program = Crowd.get();

program.version(require('../../package.json').version);
program.parse(process.argv);
