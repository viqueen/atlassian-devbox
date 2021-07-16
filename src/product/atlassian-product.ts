import { Command } from 'commander';
import path from 'path';
import os from 'os';
import * as fs from 'fs';
import {
    _atlassianDevboxHome,
    _execute,
    _extractFileWithPredicate,
    _removeDirectory
} from './util';
import chalk from 'chalk';

interface AtlassianProductDefinition {
    name: string;
    groupId: string;
    webappName: string;
    plugins: Array<string>;
    httpPort: number;
    contextPath: string;
    debugPort: number;
    ajpPort: number;
    jvmArgs: Array<string>;
}

export default class AtlassianProduct {
    private readonly product: AtlassianProductDefinition;
    private readonly program: Command;

    constructor(product: AtlassianProductDefinition) {
        this.product = product;
        this.program = new Command();

        this.program
            .option(
                '-hp, --http-port <httpPort>',
                'with http port',
                `${this.product.httpPort}`
            )
            .option(
                '-dp, --debug-port <debugPort>',
                'with debug port',
                `${this.product.debugPort}`
            )
            .option(
                '-cp, --context-path <contextPath>',
                'with context path',
                `${this.product.contextPath}`
            )
            .option(
                '-ap, --ajp-port <ajpPort>',
                'with ajp port',
                `${this.product.ajpPort}`
            )
            .option('--plugins <plugins>', 'with plugins', '')
            .option('--jvm-args <jvmArgs>', 'with jvmargs', '')
            .option(
                '--amps-version <ampsVersion>',
                'with amps version',
                '8.2.0'
            );
    }

    _runStandaloneArgs(
        version: string,
        basicJvmArgs: Array<string>
    ): Array<string> {
        const params = [
            `-s`,
            path.resolve(_atlassianDevboxHome(), `settings.xml`),
            `com.atlassian.maven.plugins:amps-maven-plugin:${
                this.program.opts().ampsVersion
            }:run-standalone`,
            `-Dproduct=${this.product.name}`,
            `-Dproduct.version=${version}`,
            `-Dserver=localhost`,
            `-Dhttp.port=${this.program.opts().httpPort}`,
            `-Dcontext.path=${this.program.opts().contextPath}`,
            `-Dajp.port=${this.program.opts().ajpPort}`,
            ...this.product.jvmArgs
        ];

        // plugins
        const additionalPlugins = this.program
            .opts()
            .plugins.split(',')
            .filter((p: string) => p !== '');
        const plugins = [...this.product.plugins, ...additionalPlugins];
        if (plugins.length > 0) {
            params.push(`-Dplugins=${plugins.join(',')}`);
        }

        // jvmargs
        const additionalJvmArgs = this.program
            .opts()
            .jvmArgs.split(' ')
            .filter((a: string) => a !== '');
        const jvmArgs = [...basicJvmArgs, ...additionalJvmArgs];
        if (jvmArgs.length > 0) {
            params.push(`-Djvmargs=${jvmArgs.join(' ')}`);
        }

        return params;
    }

    _startCmdMvnParams(version: string): Array<string> {
        return this._runStandaloneArgs(version, ['-Xmx2g', '-Xms1g']);
    }

    _debugCmdMvnParams(version: string): Array<string> {
        return this._runStandaloneArgs(version, [
            `-Xmx2g`,
            `-Xms1g`,
            `-Xdebug`,
            `-Xrunjdwp:transport=dt_socket,address=${
                this.program.opts().debugPort
            },server=y,suspend=n`,
            `-Datlassian.dev.mode=true`
        ]);
    }

    get(): Command {
        this.program
            .command('start <version>')
            .description(`runs ${this.product.name}`)
            .action((version) => {
                const params = this._startCmdMvnParams(version);
                _execute('mvn', params);
            });

        this.program
            .command('debug <version>')
            .description(`runs ${this.product.name} with debug port open`)
            .action((version) => {
                const params = this._debugCmdMvnParams(version);
                _execute('mvn', params);
            });

        this.program
            .command('cmd <name> <version>')
            .description(`prints the resolved command`)
            .action((name, version) => {
                if (name === 'start') {
                    const params = this._startCmdMvnParams(version);
                    const cmd = ['mvn', params.join(' ')];
                    console.log(chalk.green(cmd.join(' ')));
                } else if (name === 'debug') {
                    const params = this._debugCmdMvnParams(version);
                    const cmd = ['mvn', params.join(' ')];
                    console.log(chalk.green(cmd.join(' ')));
                } else {
                    console.log('unknown command : [ start, debug ] allowed');
                }
            });

        this.program
            .command('list')
            .description(`lists installed ${this.product.name} instances`)
            .action(() => {
                const directory = _atlassianDevboxHome();
                _extractFileWithPredicate(
                    directory,
                    false,
                    (parent, filename) =>
                        filename.includes(this.product.name) &&
                        fs
                            .lstatSync(path.resolve(parent, filename))
                            .isDirectory(),
                    (parent, filename) => console.log(filename)
                );
            });

        this.program
            .command('remove <pattern>')
            .description(
                `removes ${this.product.name} instance with version matching given pattern`
            )
            .action((pattern) => {
                const directory = _atlassianDevboxHome();
                _extractFileWithPredicate(
                    directory,
                    false,
                    (parent, filename) =>
                        filename.startsWith(
                            `amps-standalone-${this.product.name}-${pattern}`
                        ),
                    _removeDirectory
                );
            });

        this.program
            .command(`logs <version>`)
            .description(`tails ${this.product.name} logs`)
            .action((version) => {
                const logFile = path.resolve(
                    _atlassianDevboxHome(),
                    `amps-standalone-${this.product.name}-${version}`,
                    'target',
                    `${this.product.name}-LATEST.log`
                );
                _execute('tail', ['-f', logFile]);
            });

        this.program
            .command('versions')
            .description(
                `lists available ${this.product.name} versions in local maven repo`
            )
            .action(() => {
                const productGroupId = this.product.groupId;
                const productWebappName = this.product.webappName;

                const targetDirectory = productGroupId.split('.').join('/');
                const mavenRepoDirectory = path.resolve(
                    os.homedir(),
                    '.m2',
                    'repository',
                    targetDirectory
                );

                _extractFileWithPredicate(
                    mavenRepoDirectory,
                    true,
                    (parent, filename) =>
                        filename.startsWith(productWebappName) &&
                        (filename.endsWith('.war') ||
                            filename.endsWith('.zip')),
                    (parent, filename) => {
                        const match = filename.match(
                            `${productWebappName}-(.*).(war|zip)`
                        );
                        const output = match ? match[1] : filename;
                        console.log(output);
                    }
                );
            });

        this.program
            .command(`purge <type>`)
            .description(
                `purges available ${this.product.name} versions in local maven repo`
            )
            .action((type) => {
                const productGroupId = this.product.groupId;
                const productWebappName = this.product.webappName;
                const targetDirectory = productGroupId.split('.').join('/');
                const mavenRepoDirectory = path.resolve(
                    os.homedir(),
                    '.m2',
                    'repository',
                    targetDirectory
                );

                if (type === 'internal') {
                    _extractFileWithPredicate(
                        mavenRepoDirectory,
                        true,
                        (parent, filename) =>
                            filename.match(
                                `^${productWebappName}-(.*-.*).war$`
                            ) !== null,
                        _removeDirectory
                    );
                } else if (type === 'all') {
                    _extractFileWithPredicate(
                        mavenRepoDirectory,
                        true,
                        (parent, filename) =>
                            filename.startsWith(productWebappName) &&
                            filename.endsWith('.war'),
                        _removeDirectory
                    );
                } else {
                    console.log(
                        'unsupported type : [ internal , all ] allowed'
                    );
                }
            });

        return this.program;
    }
}
