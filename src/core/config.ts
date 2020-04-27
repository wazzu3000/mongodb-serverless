export type ConfigType = {
    app: {
        controllersPath: string,
        modelsPath: string,
        port: number
    }
    database: ConfigDatabase,
    session: ConfigSession,
    [key: string]: any
};

export type ConfigDatabase = {
    host: string,
    user?: string,
    pass?: string,
    name: string,
    port?: string
}

export type ConfigSession = {
    ttl: number,
    jwtSecret: string
}

export class Config {
    private _config: ConfigType;
    private static readonly _configInstance = new Config();

    /**
     * Just can extist 1 object of config, this the reason because the only way
     * to access to the object is with this function
     */
    public static get instance(): Config {
        return this._configInstance;
    }

    /**
     * Method to access to the hashmap that conains the values saved.
     */
    public get values() {
        return this._config;
    }

    /**
     * The config class is defined as singleton, this the reason because the
     * constructor is a private and empty function.
     */
    private constructor() { }

    /**
     * Save the config values
     * @param config Hashmap that contains the config values.
     */
    public save(config: ConfigType): void {
        this._config = config;
    }
}