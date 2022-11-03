import * as path from 'path';
import { home } from './home';
import { ProductDefinition, RunnerOptions } from './types';
import { ExecuteCommand } from './execute-command';

export type Product = {
    startCmd: (runnerOptions: RunnerOptions) => ExecuteCommand;
    debugCmd: (runnerOptions: RunnerOptions) => ExecuteCommand;
};

export const product = ({
    name,
    httpPort,
    ajpPort,
    debugPort,
    contextPath,
    plugins
}: ProductDefinition): Product => {
    const _runStandalone = (
        { ampsVersion, productVersion, withPlugins }: RunnerOptions,
        jvmArgs: string[]
    ) => {
        const directory = home();
        const params = [
            `-s`,
            path.resolve(directory, 'settings.xml'),
            `com.atlassian.maven.plugins:amps-maven-plugin:${ampsVersion}:run-standalone`,
            `-Dproduct=${name}`,
            `-Dproduct.version=${productVersion}`,
            `-Dserver=localhost`,
            `-Dhttp.port=${httpPort}`,
            `-Dcontext.path=${contextPath}`,
            `-Dajp.port=${ajpPort}`
        ];

        const additionalPlugins = withPlugins
            .split(',')
            .filter((p) => p !== '');
        const finalPlugins = [...plugins, ...additionalPlugins];
        if (finalPlugins.length > 0) {
            params.push(`-Dplugins=${finalPlugins.join(',')}`);
        }

        params.push(`-Djvmargs="${jvmArgs.join(' ')}"`);

        return { cmd: 'mvn', params, cwd: directory };
    };

    const startCmd = (runnerOptions: RunnerOptions) => {
        return _runStandalone(runnerOptions, ['-Xmx2g', '-Xms1g']);
    };

    const debugCmd = (runnerOptions: RunnerOptions) => {
        return _runStandalone(runnerOptions, [
            `-Xmx2g`,
            `-Xms1g`,
            `-Xdebug`,
            `-Xrunjdwp:transport=dt_socket,address=${debugPort},server=y,suspend=n`,
            `-Datlassian.dev.mode=true`
        ]);
    };

    return { startCmd, debugCmd };
};
