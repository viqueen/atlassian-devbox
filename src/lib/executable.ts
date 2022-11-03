import { Command } from 'commander';
import { ProductDefinition } from './types';
import { product } from './product';
import { executeCommand } from './execute-command';

export const executable = (definition: ProductDefinition) => {
    const program = new Command();

    // options
    program.option(
        '--amps-version <ampsVersion>',
        'with amps version',
        '8.2.0'
    );

    // commands
    program
        .command('start <productVersion>')
        .description(`runs ${definition.name}`)
        .action((productVersion) => {
            const ampsVersion = program.opts().ampsVersion;
            const start = product(definition, {
                ampsVersion,
                productVersion
            }).startCmd();
            executeCommand(start);
        });

    return program;
};
