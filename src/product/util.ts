import path from 'path';
import os from 'os';
import { execSync, spawn } from 'child_process';
import fs from 'fs';

export const _atlassianDevboxHome = (): string => {
    const directory = path.resolve(os.homedir(), '.atlassian-devbox');
    execSync(`mkdir -p ${directory}`);
    return directory;
};

export const _execute = (cmd: string, params: Array<string>) => {
    const directory = _atlassianDevboxHome();
    spawn(cmd, params, { cwd: directory, stdio: 'inherit' });
};

export const _extractFileWithPredicate = (
    parentDirectory: string,
    recursive: boolean,
    predicate: (file: string) => boolean,
    handler: (file: string) => void
) => {
    fs.readdir(parentDirectory, (error, files) => {
        if (files) {
            files.forEach((file) => {
                if (predicate(file)) {
                    handler(file);
                }
                const nested = path.resolve(parentDirectory, file);
                if (fs.lstatSync(nested).isDirectory() && recursive) {
                    _extractFileWithPredicate(
                        nested,
                        recursive,
                        predicate,
                        handler
                    );
                }
            });
        }
    });
};
