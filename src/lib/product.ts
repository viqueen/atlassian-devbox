import * as path from 'path';
import { home } from './home';
import { ProductDefinition, RunnerOptions } from './types';

export type Product = {
    startCmd: () => {
        cmd: string;
        params: string[];
        cwd: string;
    };
};

export const product = (
    { name, httpPort, ajpPort, contextPath, plugins }: ProductDefinition,
    { ampsVersion, productVersion, withPlugins }: RunnerOptions
): Product => {
    const startCmd = () => {
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
        return { cmd: 'mvn', params, cwd: directory };
    };

    return { startCmd };
};
