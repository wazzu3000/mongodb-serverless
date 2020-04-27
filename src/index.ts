import { Express } from 'express';
import app from './core/app';
import modelRouter from './core/models-router';
import { Db } from './core/db';
import { ConfigType, Config } from './core/config';

/**
 * Configure the app and the database to start to work
 * @param config Configurations of the database and app
 */
export function mongodbServerless(configValues: ConfigType): Promise<Express> {
    Config.instance.save(configValues);
    return new Promise<Express>((resolve, reject) => {
        Db.instance.connect().then(() => {
            modelRouter(app);
            app.listen(3000, () => resolve());
            resolve(app);
        }).catch(err => {
            reject(err);
        });
    });
};

export { Rules as ModelRules, Model } from './models/model';
export { Config } from './core/config';
export { Session } from './core/session';
export { model } from './decorators/model.decorator';
