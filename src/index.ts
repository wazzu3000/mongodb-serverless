import { Express } from 'express';
import app from './core/app';
import { Router } from './core/router';
import { Db } from './core/db';
import { ConfigType, Config } from './core/config';

/**
 * Configure the app and the database to start to work
 * @param config Configurations of the database and app
 */
export function mongodbServerless(configValues: ConfigType): Promise<Express> {
    Config.instance.save(configValues);
    return new Promise<Express>((resolve, reject) => {
        Db.instance.connect().then(async () => {
            const router = Router.instance;
            await router.modelRouter();
            router.controllerRouter();
            app.listen(3000, () => resolve());
            resolve(app);
        }).catch(err => {
            reject(err);
        });
    });
};

export { Request, Response } from 'express';
export { Rules as ModelRules, Model } from './models/model';
export { Controller } from './controllers/controller';
export { Config } from './core/config';
export { Session } from './core/session';
export { Db } from './core/db';
export { model } from './decorators/model.decorator';
export { controller, httpRequest } from './decorators/controller.decorator';
