import { Request, Response } from 'express';
import * as mongoose from 'mongoose';
import app from './../core/app';
import { Rules, AccessModificators } from '../models/model';
import { ModelController } from './../controllers/model-controller';
import { Session } from './../core/session';

type Dictionary<T> = { [name: string]: T }

export const rulesCollection: Dictionary<Rules> = { }
export const modelsCollection: Dictionary<mongoose.Model<any>> = { }

/**
 * Decorator to load the models to the server-less application and generate the
 * specific routes to the collections, just if aplly
 * @param name The collection name to access
 * @param rules Rules access from the web api
 */
export function model(name: string, rules?: Rules | undefined) {
    return function (constructor: Function) {
        const _rules = Object.assign<Rules, Rules>(rules || {}, {});

        if (!_rules.access) {
            _rules.access = {}
        }

        _rules.access.getOne = rules?.access?.getOne || 'public';
        _rules.access.getMany = rules?.access?.getMany || 'public';
        _rules.access.post = rules?.access?.post || 'public';
        _rules.access.put = rules?.access?.put || 'public';
        _rules.access.delete = rules?.access?.delete || 'public';

        _rules.access.getOne != 'disabled' && app.get(`/api/${name}/:id`, (req, res) => handleRequest(req, res, handleGetOneRequest));
        _rules.access.getMany != 'disabled' && app.get(`/api/${name}`, (req, res) => handleRequest(req, res, handleGetManyRequest));
        _rules.access.post != 'disabled' && app.post(`/api/${name}`, (req, res) => handleRequest(req, res, handlePostRequest));
        _rules.access.put != 'disabled' && app.put(`/api/${name}/:id`, (req, res) => handleRequest(req, res, handlePutRequest));
        _rules.access.delete != 'disabled' && app.delete(`/api/${name}/:id`, (req, res) => handleRequest(req, res, handleDeleteRequest));

        rulesCollection[name] = _rules;
        constructor.prototype.schemaName = name;
    }
}

function handleRequest(req: Request, res: Response, fn: (Request, Response, controller: ModelController) => void) {
    const modelName = req.url.split('/')[2];
    const modelController = new ModelController(modelsCollection, modelName);
    fn(req, res, modelController);
}

function handleGetOneRequest(req: Request, res: Response, controller: ModelController) {
    if (!validateAccess(rulesCollection[controller.modelName].access.getOne, req.headers.authorization)) {
        res.status(401).end();
        return;
    }
    controller.get(req, res, req.params.id);
}

function handleGetManyRequest(req: Request, res: Response, controller: ModelController) {
    if (!validateAccess(rulesCollection[controller.modelName].access.getMany, req.headers.authorization)) {
        res.status(401).end();
        return;
    }
    controller.get(req, res);
}

function handlePostRequest(req: Request, res: Response, controller: ModelController) {
    if (!validateAccess(rulesCollection[controller.modelName].access.post, req.headers.authorization)) {
        res.status(401).end();
        return;
    }
    controller.post(req, res);
}

function handlePutRequest(req: Request, res: Response, controller: ModelController) {
    if (!validateAccess(rulesCollection[controller.modelName].access.put, req.headers.authorization)) {
        res.status(401).end();
        return;
    }
    controller.put(req, res, req.params.id);
}

function handleDeleteRequest(req: Request, res: Response, controller: ModelController) {
    if (!validateAccess(rulesCollection[controller.modelName].access.delete, req.headers.authorization)) {
        res.status(401).end();
        return;
    }
    controller.delete(req, res, req.params.id);
}

function validateAccess(accessType: AccessModificators, authorization: string): boolean {
    debugger;
    const tokenDecoded = Session.instance.decodeSession<Dictionary<any>>(authorization);
    if (accessType == 'public') {
        return true;
    } else if ((typeof accessType == 'object' || accessType == 'private') && !tokenDecoded) {
        return false
    }
    
    return true;
}