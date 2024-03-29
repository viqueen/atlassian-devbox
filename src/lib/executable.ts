import * as fs from 'fs';

import chalk from 'chalk';
import { Command } from 'commander';

import { executeCommand } from './execute-command';
import { product } from './product';
import { ProductDefinition } from './types';

const executable = (definition: ProductDefinition) => {
    const program = new Command();

    // options
    program.option(
        '--amps-version <ampsVersion>',
        'with amps version',
        '8.8.1'
    );
    program.option('--with-plugins <withPlugins>', 'with plugins', '');
    program.option('--with-jvm-args <withJvmArgs>', 'with jvm args', '');

    // commands
    program
        .command('install <productVersion>')
        .description(`installs ${definition.name} version`)
        .action((productVersion) => {
            const install = product(definition).installVersionCmd({
                productVersion
            });
            executeCommand(install);
        });

    program
        .command('start <productVersion>')
        .description(`runs ${definition.name}`)
        .action((productVersion) => {
            const options = program.opts();
            const { ampsVersion, withPlugins, withJvmArgs } = options;
            const start = product(definition).startInstanceCmd({
                ampsVersion,
                productVersion,
                withPlugins,
                withJvmArgs
            });
            executeCommand(start);
        });

    program
        .command('debug <productVersion>')
        .description(`runs ${definition.name} in debug mode`)
        .action((productVersion) => {
            const options = program.opts();
            const { ampsVersion, withPlugins, withJvmArgs } = options;
            const debug = product(definition).debugInstanceCmd({
                ampsVersion,
                productVersion,
                withPlugins,
                withJvmArgs
            });
            executeCommand(debug);
        });

    program
        .command('logs <productVersion>')
        .description(`tails ${definition.name} log file`)
        .action((productVersion) => {
            const log = product(definition).viewInstanceLogCmd({
                productVersion
            });
            executeCommand(log);
        });

    program
        .command('remove <pattern>')
        .description(
            `removes ${definition.name} instance with version matching given pattern`
        )
        .action((pattern) => {
            product(definition)
                .listInstances({
                    productVersion: pattern || '',
                    absolutePath: true
                })
                .forEach((d) => {
                    console.info(chalk.green(`removing ${d}`));
                    fs.rmSync(d, { recursive: true });
                });
        });

    program
        .command('list [pattern]')
        .description(`lists installed ${definition.name} instances`)
        .option('-a, --absolute-path', 'list absolute path', false)
        .action((pattern, opts) => {
            const { absolutePath } = opts;
            product(definition)
                .listInstances({ productVersion: pattern || '', absolutePath })
                .forEach((i) => console.info(i));
        });

    program
        .command('versions [productVersion]')
        .option('-r, --remote', 'list remote versions', false)
        .option('-l, --limit <limit>', 'with limit on remote versions', '15')
        .option('-o, --offset <offset>', 'with offset on remote versions', '0')
        .description(`lists available ${definition.name} versions`)
        .action(async (productVersion, opts) => {
            console.info(chalk.cyan('---- installed versions'));
            product(definition)
                .listInstalledVersions()
                .forEach((v) => console.info(v));
            if (opts.remote) {
                const { limit, offset } = opts;
                console.info(chalk.cyan('---- available versions'));
                const availableVersions = await product(
                    definition
                ).listAvailableVersions({
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    productVersion
                });
                availableVersions.forEach((v) => console.info(v));
            }
        });

    return program;
};

export { executable };
