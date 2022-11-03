export type ProductDefinition = {
    name: string;
    groupId: string;
    webappName: string;
    httpPort: number;
    ajpPort: number;
    debugPort: number;
    contextPath: string;
    plugins: string[];
};

export type RunnerOptions = {
    ampsVersion: string;
    productVersion: string;
    withPlugins: string;
};
