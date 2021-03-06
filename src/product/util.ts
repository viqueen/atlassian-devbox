import path from 'path';
import os from 'os';
import { spawn } from 'child_process';
import fs from 'fs';
import chalk from 'chalk';

export const _atlassianDevboxHome = (): string => {
    const directory = path.resolve(os.homedir(), '.atlassian-devbox');
    fs.mkdirSync(directory, { recursive: true });
    return directory;
};

export const _execute = (cmd: string, params: Array<string>) => {
    const directory = _atlassianDevboxHome();
    console.log(chalk.green(`Executing: `));
    console.log(chalk.green(`${cmd} ${params.join(' ')}`));
    spawn(cmd, params, { cwd: directory, stdio: 'inherit' });
};

export const _extractFileWithPredicate = (
    parentDirectory: string,
    recursive: boolean,
    predicate: (parent: string, file: string) => boolean,
    handler: (parent: string, filename: string) => void
) => {
    fs.readdir(parentDirectory, (error, files) => {
        if (files) {
            files.forEach((filename) => {
                if (predicate(parentDirectory, filename)) {
                    handler(parentDirectory, filename);
                }
                const nested = path.resolve(parentDirectory, filename);
                if (
                    fs.existsSync(nested) &&
                    fs.lstatSync(nested).isDirectory() &&
                    recursive
                ) {
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

export const _removeDirectory = (parent: string, filename: string) => {
    const target = path.resolve(parent, filename);
    console.log(`removing ${target}`);
    fs.rmSync(target, { recursive: true });
};
