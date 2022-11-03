import { Command } from 'commander';
import { ProductDefinition } from './types';
import { product } from './product';
import { executeCommand } from './execute-command';
import { home } from './home';
import * as fs from 'fs';

export const executable = (definition: ProductDefinition) => {
    const program = new Command();

    // options
    program.option(
        '--amps-version <ampsVersion>',
        'with amps version',
        '8.8.1'
    );
    program.option('--with-plugins <withPlugins>', 'with plugins', '');

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

    program
        .command('debug <productVersion>')
        .description(`runs ${definition.name} in debug mode`)
        .action((productVersion) => {
            const options = program.opts();
            const { ampsVersion, withPlugins } = options;
            const debug = product(definition, {
                ampsVersion,
                productVersion,
                withPlugins
            }).debugCmd();
            executeCommand(debug);
        });

    program
        .command('list')
        .description(`lists installed ${definition.name} instances`)
        .action(() => {
            const directory = home();
            fs.readdirSync(directory)
                .filter((d) => d.includes(definition.name))
                .forEach((d) => console.info(d));
        });

    return program;
};
