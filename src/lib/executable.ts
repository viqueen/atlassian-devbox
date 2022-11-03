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
    program.option('--plugins <withPlugins>', 'with plugins', '');

    // commands
    program
        .command('start <productVersion>')
        .description(`runs ${definition.name}`)
        .action((productVersion) => {
            const options = program.opts();
            const { ampsVersion, withPlugins } = options;
            const start = product(definition, {
                ampsVersion,
                productVersion,
                withPlugins
            }).startCmd();
            executeCommand(start);
        });

    return program;
};
