import fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import axios from 'axios';
import { listFiles } from 'fs-directory';
import { Parser } from 'xml2js';

import { ExecuteCommand } from './execute-command';
import { home } from './home';
import { ProductDefinition, RunnerOptions } from './types';

type ListInstancesArgs = {
    productVersion: string;
    absolutePath?: boolean;
};

type Product = {
    debugInstanceCmd: (runnerOptions: RunnerOptions) => ExecuteCommand;
    startInstanceCmd: (runnerOptions: RunnerOptions) => ExecuteCommand;
    viewInstanceLogCmd: (
        runnerOptions: Pick<RunnerOptions, 'productVersion'>
    ) => ExecuteCommand;
    installVersionCmd: (
        runnerOptions: Pick<RunnerOptions, 'productVersion'>
    ) => ExecuteCommand;
    listInstances: (args: ListInstancesArgs) => string[];
    listInstalledVersions: () => string[];
    listAvailableVersions: (props: {
        limit: number;
        offset: number;
    }) => Promise<string[]>;
};

const product = ({
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

    const installVersionCmd = ({
        productVersion
    }: Pick<RunnerOptions, 'productVersion'>) => {
        const directory = home();
        const params: string[] = [
            `-s`,
            path.resolve(directory, 'settings.xml'),
            'org.apache.maven.plugins:maven-dependency-plugin:3.5.0:get',
            `-Dartifact=${groupId}:${webappName}:${productVersion}:war`
        ];
        return { cmd: 'mvn', params, cwd: directory };
    };

    const listAvailableVersions = async ({
        limit,
        offset
    }: {
        limit: number;
        offset: number;
    }): Promise<string[]> => {
        const packagesUrl = 'https://packages.atlassian.com/mvn/maven-external';
        const productPath = groupId.split('.').join(path.sep);
        const metadataUrl = `${packagesUrl}/${productPath}/${webappName}/maven-metadata.xml`;
        const { data } = await axios.get(metadataUrl, {
            headers: { Accept: 'application/xml' }
        });
        const parser = new Parser();
        const { metadata } = await parser.parseStringPromise(data);

        const versions = metadata.versioning[0].versions[0].version;
        const pattern = /^[0-9]+\.[0-9]+\.[0-9]+$/;
        const filtered = versions
            .reverse()
            .filter((v: string) => v.match(pattern));
        return filtered.slice(offset, offset + limit);
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

    const listInstalledVersions = () => {
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
        listInstalledVersions,
        installVersionCmd,
        listAvailableVersions
    };
};

export type { Product };
export { product };
