export const appName = "oxc-config";
export const portNumber = 3000;

export interface ServerConfig {
    name: string;
    port: number;
    tags: string[];
}

export const createServer = (name: string, port: number): ServerConfig => {
    return {
        name: "server-" + name,
        port: port,
        tags: [
            "production-environment-primary",
            "failover-cluster-secondary"
        ]
    };
};

export const options = {
    alpha: "first-unformatted-option",
    beta: "second-unformatted-option",
    gamma: "third-unformatted-option"
};
