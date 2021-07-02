import { Command } from 'commander';
import path from 'path';
import os from 'os';
import * as fs from 'fs';
import {
    _atlassianDevboxHome,
    _execute,
    _extractFileWithPredicate
} from './util';

interface AtlassianProductDefinition {
    name: string;
    groupId: string;
    webappName: string;
    plugins: Array<string>;
    httpPort: number;
    contextPath: string;
    debugPort: number;
    ajpPort: number;
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
            .option(
                '--plugins <plugins>',
                'with plugins',
                `${this.product.plugins.join(',')}`
            );
    }

    _runStandaloneArgs(version: string, jvmArgs: string): Array<string> {
        // TODO : extract amps version
        const params = [
            `-s`,
            path.resolve(_atlassianDevboxHome(), `atlassian-settings.xml`),
            `com.atlassian.maven.plugins:amps-maven-plugin:8.2.0:run-standalone`,
            `-Djvmargs='${jvmArgs}'`,
            `-Dproduct=${this.product.name}`,
            `-Dproduct.version=${version}`,
            `-Dserver=localhost`,
            `-Dhttp.port=${this.program.opts().httpPort}`,
            `-Dcontext.path=${this.program.opts().contextPath}`,
            `-Dajp.port=${this.program.opts().ajpPort}`
        ];
        const plugins = this.program.opts().plugins;
        if (plugins.length > 0) {
            params.push(`-Dplugins=${plugins}`);
        }
        return params;
    }

    _startCmdMvnParams(version: string): Array<string> {
        return this._runStandaloneArgs(version, '-Xmx2048m');
    }

    _debugCmdMvnParams(version: string): Array<string> {
        return this._runStandaloneArgs(
            version,
            `-Xmx2048m -Xdebug -Xrunjdwp:transport=dt_socket,address=${
                this.program.opts().debugPort
            },server=y,suspend=n`
        );
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
                    console.log(cmd.join(' '));
                } else if (name === 'debug') {
                    const params = this._debugCmdMvnParams(version);
                    const cmd = ['mvn', params.join(' ')];
                    console.log(cmd.join(' '));
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
                    (file) =>
                        file.includes(this.product.name) &&
                        fs
                            .lstatSync(path.resolve(directory, file))
                            .isDirectory(),
                    (file) => console.log(file)
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
                    (file) =>
                        file.startsWith(
                            `amps-standalone-${this.product.name}-${pattern}`
                        ),
                    (file) => {
                        const target = path.resolve(directory, file);
                        console.log(`removing ${target}`);
                        fs.rmSync(target);
                    }
                );
            });

        this.program
            .command('versions')
            .description(`lists available versions in local maven repo`)
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
                    (file) =>
                        file.startsWith(productWebappName) &&
                        file.endsWith('.war'),
                    (file) => {
                        const match = file.match(
                            `${productWebappName}-(.*).war`
                        );
                        const output = match ? match[1] : file;
                        console.log(output);
                    }
                );
            });

        return this.program;
    }
}
