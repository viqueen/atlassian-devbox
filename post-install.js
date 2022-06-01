const fs = require('fs');
const os = require('os');
const path = require('path');

const source = path.resolve(process.cwd(), '.atlassian-devbox');
const target = path.resolve(os.homedir(), '.atlassian-devbox');

fs.mkdirSync(target, { recursive: true });
fs.copyFileSync(
    path.resolve(source, 'settings.xml'),
    path.resolve(target, 'settings.xml')
);
