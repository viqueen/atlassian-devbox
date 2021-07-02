#! /usr/bin/env node

import AtlassianProduct from '../product/atlassian-product';

const Bitbucket = new AtlassianProduct({
    name: 'bitbucket',
    groupId: 'com.atlassian.bitbucket',
    webappName: 'bitbucket-webapp',
    httpPort: 7990,
    contextPath: '/bitbucket',
    debugPort: 5005,
    ajpPort: 7009
});

const program = Bitbucket.get();

program.version(require('../../package.json').version);
program.parse(process.argv);
