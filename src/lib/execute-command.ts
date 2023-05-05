import { spawn } from 'child_process';

import chalk from 'chalk';

type ExecuteCommand = {
    cmd: string;
    params: string[];
    cwd: string;
};

const executeCommand = ({ cmd, params, cwd }: ExecuteCommand) => {
    console.info(chalk.green(`Executing `));
    console.info(chalk.green(`${cmd} ${params.join(' ')}`));
    spawn(cmd, params, { cwd, stdio: 'inherit' });
};

export type { ExecuteCommand };
export { executeCommand };
