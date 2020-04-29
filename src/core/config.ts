export type ConfigType = {
    /**
     * Generic configurations to the app.
     */
    app: {
        /**
         * Specify the path where are store the custom controllers.
         */
        controllersPath: string,
        /**
         * Specify the path where are store the models.
         */
        modelsPath: string,
        /**
         * Set the port number listen by the http request.
         */
        port: number
    }
    /**
     * Configurations to the database.
     */
    database: ConfigDatabase,
    /**
     * Session configuration
     */
    session: ConfigSession,
    [key: string]: any
};

export type ConfigDatabase = {
    /**
     * Set the hostname or url to access to the database server.
     */
    host: string,
    /**
     * User to login to the database.
     */
    user?: string,
    /**
     * Password to login to the database.
     */
    pass?: string,
    /**
     * Name of the database to use.
     */
    name: string,
    /**
     * Port of the database to use, if you don't specify any it will use the
     * default `27017` port.
     */
    port?: string
}

export type ConfigSession = {
    /**
     * Time to live the session specify in seconds
     */
    ttl: number,
    /**
     * Phrase to sign the JWT sessions
     */
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