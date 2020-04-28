import * as fs from 'fs';
import * as path from 'path';
import { Model } from '../models/model';
import { Db } from './db';
import { Config } from './config';
import { modelsCollection } from './../decorators/model.decorator';
import { controllersCollection } from './../decorators/controller.decorator';

export class Router {
    private static _instance = new Router()

    public static get instance() {
        return this._instance;
    }

    private constructor() { }

    public modelRouter() {
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

    public controllerRouter() {
        const controllersPath = Config.instance.values.app.controllersPath;

        for (let file of fs.readdirSync(controllersPath)) {
            if (path.extname(file) != '.js') {
                continue;
            }
    
            let ControllerClass = require(path.join(controllersPath, file)).default;
            // The instance is created just to execute the decorators code
            let controller = new ControllerClass() as Model;
            controllersCollection[ControllerClass.name] = ControllerClass
        }

    }
}
