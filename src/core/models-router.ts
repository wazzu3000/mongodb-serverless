import * as fs from 'fs';
import * as path from 'path';
import * as express from 'express';
import { Model } from './../models/model';
import { Db } from './db';
import { Config } from './config';
import { modelsCollection } from './../decorators/model.decorator';

export default function modelRouter(app: express.Express) {
    const modelsPath = Config.instance.values.app.modelsPath;

    for (let file of fs.readdirSync(modelsPath)) {
        if (path.extname(file) != '.js') {
            continue;
        }

        let ModelClass = require(path.join(modelsPath, file)).default;
        let model = new ModelClass() as Model;
        
        let schemaName = ModelClass.prototype.schemaName;
        modelsCollection[schemaName] = Db.instance.conn.model(schemaName, model.schema);
    }
}