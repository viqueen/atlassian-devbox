const fse = require('fs-extra');
const os = require('os');
const path = require('path');

fse.copySync(
    path.resolve(process.cwd(), '.atlassian-devbox'),
    path.resolve(os.homedir(), '.atlassian-devbox')
);
