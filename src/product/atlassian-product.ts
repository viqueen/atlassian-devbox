import { Command } from 'commander';
import path from 'path';
import os from 'os';
import { exec, execSync, spawn } from 'child_process';

interface AtlassianProductDefinition {
    name: string;
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

    static _execute(cmd: string, params: Array<string>) {
        const directory = path.resolve(os.homedir(), '.atlassian-products');
        execSync(`mkdir -p ${directory}`);
        spawn(cmd, params, { cwd: directory, stdio: 'inherit' });
    }

    _withJvmArgs(version: string, jvmArgs: string): Array<string> {
        // TODO : extract amps version
        // TODO : extract server option
        return [
            `-s`,
            `atlassian-settings.xml`,
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

        return this.program;
    }
}
