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
    { name, httpPort, ajpPort, contextPath }: ProductDefinition,
    { ampsVersion, productVersion }: RunnerOptions
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
        return { cmd: 'mvn', params, cwd: directory };
    };

    return { startCmd };
};
