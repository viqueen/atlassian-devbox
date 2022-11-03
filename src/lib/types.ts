export type ProductDefinition = {
    name: string;
    httpPort: number;
    ajpPort: number;
    contextPath: string;
};

export type RunnerOptions = {
    ampsVersion: string;
    productVersion: string;
};
