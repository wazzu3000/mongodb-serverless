import * as mongoose from 'mongoose';
import { Config } from './config';

export class Db {
    private static readonly _instance: Db = new Db();;
    private _conn: typeof mongoose;
    private config: Config;

    public get conn(): typeof mongoose {
        return this._conn;
    }

    private constructor() {
        this.config = Config.instance;
    }

    public static get instance(): Db {
        return this._instance;
    }

    public connect(): Promise<void> {
        const config = this.config.values.database;
        const protocol = config.host.match(/^.+:\/\//) ? '' : 'mongodb://';

        return mongoose.connect(
            `${protocol}${config.host}${(config.port ? `:${config.port}` : '')}/${config.name}`,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                user: config.user || '',
                pass: config.pass || ''
            }
        ).then(conn => {
            this._conn = conn;
        })
    }
}