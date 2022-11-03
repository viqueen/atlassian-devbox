import { spawn } from 'child_process';
import chalk from 'chalk';

export type ExecuteCommand = {
    cmd: string;
    params: string[];
    cwd: string;
};

export const executeCommand = ({ cmd, params, cwd }: ExecuteCommand) => {
    console.info(chalk.green(`Executing `));
    console.info(chalk.green(`${cmd} ${params.join(' ')}`));
    spawn(cmd, params, { cwd, stdio: 'inherit' });
};
