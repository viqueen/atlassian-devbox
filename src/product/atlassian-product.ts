import { Command } from 'commander';
import path from 'path';
import os from 'os';
import { execSync, spawn } from 'child_process';
import * as fs from 'fs';

interface AtlassianProductDefinition {
    name: string;
    groupId: string;
    webappName: string;
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
            );
    }

    static _atlassianDevboxHome(): string {
        const directory = path.resolve(os.homedir(), '.atlassian-devbox');
        execSync(`mkdir -p ${directory}`);
        return directory;
    }

    static _execute(cmd: string, params: Array<string>) {
        const directory = this._atlassianDevboxHome();
        spawn(cmd, params, { cwd: directory, stdio: 'inherit' });
    }

    static _extractFileWithPredicate(
        parentDirectory: string,
        recursive: boolean,
        predicate: (file: string) => boolean,
        transform: (file: string) => string
    ) {
        fs.readdir(parentDirectory, (error, files) => {
            if (files) {
                files.forEach((file) => {
                    if (predicate(file)) {
                        console.log(transform(file));
                    }
                    const nested = path.resolve(parentDirectory, file);
                    if (fs.lstatSync(nested).isDirectory() && recursive) {
                        this._extractFileWithPredicate(
                            nested,
                            recursive,
                            predicate,
                            transform
                        );
                    }
                });
            }
        });
    }

    _withJvmArgs(version: string, jvmArgs: string): Array<string> {
        // TODO : extract amps version
        // TODO : extract server option
        return [
            `-s`,
            path.resolve(
                AtlassianProduct._atlassianDevboxHome(),
                `atlassian-settings.xml`
            ),
            `com.atlassian.maven.plugins:amps-maven-plugin:8.2.0:run-standalone`,
            `-Djvmargs='${jvmArgs}'`,
            `-Dproduct=${this.product.name}`,
            `-Dproduct.version=${version}`,
            `-Dserver=localhost`,
            `-Dhttp.port=${this.program.opts().httpPort}`,
            `-Dcontext.path=${this.program.opts().contextPath}`,
            `-Dajp.port=${this.program.opts().ajpPort}`
        ];
    }

    _startCmdMvnParams(version: string): Array<string> {
        return this._withJvmArgs(version, '-Xmx2048m');
    }

    _debugCmdMvnParams(version: string): Array<string> {
        return this._withJvmArgs(
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
                AtlassianProduct._execute('mvn', params);
            });

        this.program
            .command('debug <version>')
            .description(`runs ${this.product.name} with debug port open`)
            .action((version) => {
                const params = this._debugCmdMvnParams(version);
                AtlassianProduct._execute('mvn', params);
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
            .command('instances')
            .description(`lists installed ${this.product.name} instances`)
            .action(() => {
                const directory = AtlassianProduct._atlassianDevboxHome();
                AtlassianProduct._extractFileWithPredicate(
                    directory,
                    false,
                    (file) =>
                        fs
                            .lstatSync(path.resolve(directory, file))
                            .isDirectory(),
                    (file) => file
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

                AtlassianProduct._extractFileWithPredicate(
                    mavenRepoDirectory,
                    true,
                    (file) =>
                        file.startsWith(productWebappName) &&
                        file.endsWith('.war'),
                    (file) => {
                        const match = file.match(
                            `${productWebappName}-(.*).war`
                        );
                        return match ? match[1] : file;
                    }
                );
            });

        return this.program;
    }
}
