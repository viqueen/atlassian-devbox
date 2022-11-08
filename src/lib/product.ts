import * as path from 'path';
import { home } from './home';
import { ProductDefinition, RunnerOptions } from './types';
import { ExecuteCommand } from './execute-command';
import fs from 'fs';
import * as os from 'os';
import { listFiles } from 'fs-directory';

type ListInstancesArgs = {
    productVersion: string;
    absolutePath?: boolean;
};

export type Product = {
    debugInstanceCmd: (runnerOptions: RunnerOptions) => ExecuteCommand;
    startInstanceCmd: (runnerOptions: RunnerOptions) => ExecuteCommand;
    viewInstanceLogCmd: (
        runnerOptions: Pick<RunnerOptions, 'productVersion'>
    ) => ExecuteCommand;
    listInstances: (args: ListInstancesArgs) => string[];
    listVersions: () => string[];
};

export const product = ({
    name,
    httpPort,
    ajpPort,
    debugPort,
    contextPath,
    plugins,
    jvmArgs,
    groupId,
    webappName
}: ProductDefinition): Product => {
    const _product = (productVersion: string) => {
        return `amps-standalone-${name}-${productVersion}`;
    };

    const _runStandalone = (
        {
            ampsVersion,
            productVersion,
            withPlugins,
            withJvmArgs
        }: RunnerOptions,
        defaultJvmArgs: string[]
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
            `-Dajp.port=${ajpPort}`,
            ...jvmArgs
        ];

        const additionalPlugins = withPlugins
            .split(',')
            .filter((p) => p !== '');
        const finalPlugins = [...plugins, ...additionalPlugins];
        if (finalPlugins.length > 0) {
            params.push(`-Dplugins=${finalPlugins.join(',')}`);
        }

        const additionalJvmArgs = withJvmArgs
            .split(' ')
            .filter((j) => j !== '');
        const finalJvmArgs = [...defaultJvmArgs, ...additionalJvmArgs];

        params.push(`-Djvmargs=${finalJvmArgs.join(' ')}`);

        return { cmd: 'mvn', params, cwd: directory };
    };

    const debugInstanceCmd = (runnerOptions: RunnerOptions) => {
        return _runStandalone(runnerOptions, [
            `-Xmx2g`,
            `-Xms1g`,
            `-Xdebug`,
            `-Xrunjdwp:transport=dt_socket,address=${debugPort},server=y,suspend=n`,
            `-Datlassian.dev.mode=true`
        ]);
    };

    const startInstanceCmd = (runnerOptions: RunnerOptions) => {
        return _runStandalone(runnerOptions, ['-Xmx2g', '-Xms1g']);
    };

    const viewInstanceLogCmd = ({
        productVersion
    }: Pick<RunnerOptions, 'productVersion'>) => {
        const directory = home();
        const file = path.resolve(
            directory,
            _product(productVersion),
            'target',
            `${name}-LATEST.log`
        );
        return {
            cmd: 'tail',
            params: ['-f', file],
            cwd: directory
        };
    };

    const listInstances = ({
        productVersion,
        absolutePath
    }: ListInstancesArgs) => {
        const directory = home();
        return fs
            .readdirSync(directory)
            .filter((d) => d.startsWith(_product(productVersion)))
            .map((d) => {
                if (absolutePath) return path.resolve(directory, d);
                return d;
            });
    };

    const listVersions = () => {
        const productDirectory = groupId.split('.').join(path.sep);
        const productMavenDirectory = path.resolve(
            os.homedir(),
            '.m2',
            'repository',
            productDirectory
        );
        const fileNames = listFiles(productMavenDirectory, {
            directoryFilter: () => true,
            fileFilter: (entry) => {
                return (
                    entry.name.startsWith(webappName) &&
                    (entry.name.endsWith('.war') || entry.name.endsWith('.zip'))
                );
            }
        });
        return fileNames.map((fileName) => {
            const match = fileName.match(`${webappName}-(.*).(war|zip)`);
            return match ? match[1] : fileName;
        });
    };

    return {
        startInstanceCmd,
        debugInstanceCmd,
        viewInstanceLogCmd,
        listInstances,
        listVersions
    };
};
