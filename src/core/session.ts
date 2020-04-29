import * as jwt from 'jsonwebtoken';
import { Config, ConfigSession } from './config';

export class Session {
    private static readonly _instance = new Session();

    public static get instance(): Session {
        return this._instance;
    }

    private get configSession(): ConfigSession {
        return Config.instance.values.session;
    }

    private constructor() { }

    /**
     * Generate a new `JWT` session and save in it the data sended
     * @param data Values to save in the `JWT` token
     */
    public generateSession(data: object): string {
        Config.instance.values.session;
        return jwt.sign({
            exp: Math.floor(Date.now() / 1000) + this.configSession.ttl,
            data
        }, this.configSession.jwtSecret);
    }
    
    /**
     * Decode a `JWT` token and extract the data save in it
     * @param session The token to decode
     */
    public decodeSession<T>(session: string): T {
        try {
            const bearer = 'Bearer ';
            if (session.indexOf(bearer) != 0) {
                return null;
            }

            const token = session.replace(bearer, '');
            return (jwt.verify(token, this.configSession.jwtSecret) as any).data;
        } catch (err) {
            return null;
        }
    }
    
    /**
     * Returns a new `JWT` token with the time to live updated
     * @param session token to update the time to live
     */
    public updateSession(session: string): string {
        const sessionDecoded = this.decodeSession<object>(session);
        if (!sessionDecoded) {
            throw new Error('The session can not be updated because does not exists it');
        }

        return this.generateSession(sessionDecoded);
    }
}
