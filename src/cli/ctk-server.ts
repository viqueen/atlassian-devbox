#! /usr/bin/env node

import AtlassianProduct from '../product/atlassian-product';

const CtkServer = new AtlassianProduct({
    name: 'ctk-server',
    groupId: 'com.atlassian.federation',
    webappName: 'federated-api-ctk-server-distribution',
    plugins: [],
    httpPort: 8990,
    contextPath: '/ctk',
    debugPort: 5005,
    ajpPort: 18009,
    jvmArgs: []
});

const program = CtkServer.get();

program.version(require('../../package.json').version);
program.parse(process.argv);
