import { Request, Response } from 'express';
import * as mongoose from 'mongoose';
import app from './../core/app';
import { Rules } from '../models/model';
import { ModelController } from '../controllers/model.controller';
import { Session } from './../core/session';
import { Dictionary } from './../types';

export const rulesCollection: Dictionary<Rules> = { }
export const modelsCollection: Dictionary<mongoose.Model<any>> = { }

/**
 * Decorator to load the model to the server-less application and generate the
 * specific routes to the collections, just if aply
 * @param name The collection name to access
 * @param rules Rules access from the web api
 */
export function model(name: string, rules?: Rules | undefined) {
    return function (constructor: Function) {
        const _rules = Object.assign<Rules, Rules>(rules || {}, {});

        // Set the default values if some rule haven't any
        if (!_rules.access) {
            _rules.access = {}
        }

        _rules.access.getOne = rules?.access?.getOne || 'public';
        _rules.access.getMany = rules?.access?.getMany || 'public';
        _rules.access.post = rules?.access?.post || 'public';
        _rules.access.put = rules?.access?.put || 'public';
        _rules.access.delete = rules?.access?.delete || 'public';

        // Register the `getOne` document access rules
        if (_rules.access.getOne != 'disabled') {
            const url = `/api/${name}/:id`;
            (typeof _rules.access.getOne === 'object' || _rules.access.getOne == 'private') && app.get(url, handleAuthRequest);
            app.get(url, (req, res) => handleRequest(req, res, handleGetOneRequest));
        }

        // Register the `getMany` document access rules
        if (_rules.access.getMany != 'disabled') {
            const url = `/api/${name}`;
            (typeof _rules.access.getMany === 'object' || _rules.access.getMany == 'private') && app.get(url, handleAuthRequest);
            app.get(url, (req, res) => handleRequest(req, res, handleGetManyRequest));
        }

        // Register the `post` document access rules
        if (_rules.access.post != 'disabled') {
            const url = `/api/${name}`;
            (typeof _rules.access.post === 'object' || _rules.access.post == 'private') && app.get(url, handleAuthRequest);
            app.post(url, (req, res) => handleRequest(req, res, handlePostRequest));
        }

        // Register the `put` document access rules
        if (_rules.access.put != 'disabled') {
            const url = `/api/${name}/:id`;
            (typeof _rules.access.put === 'object' || _rules.access.put == 'private') && app.get(url, handleAuthRequest);
            app.put(url, (req, res) => handleRequest(req, res, handlePutRequest));
        }

        // Register the `delete` document access rules
        if (_rules.access.delete != 'disabled') {
            const url = `/api/${name}/:id`;
            (typeof _rules.access.delete === 'object' || _rules.access.delete == 'private') && app.get(url, handleAuthRequest);
            app.delete(url, (req, res) => handleRequest(req, res, handleDeleteRequest));
        }

        rulesCollection[name] = _rules;
        constructor.prototype.schemaName = name;
    }
}

/**
 * Handler for all authenticated requests.
 * @param req The request sended by the client.
 * @param res The response send to the client.
 * @param next 
 */
function handleAuthRequest(req: Request, res: Response, next: () => void) {
    var tokenDecoded = Session.instance.decodeSession<Dictionary<any>>(req.headers.authorization);
    if (!tokenDecoded) {
        res.status(401).end();
        return;
    }

    req['tokenDecoded'] = tokenDecoded;
    next();
}

/**
 * Handler fol all requests
 * @param req The request sended by the client
 * @param res The response send to the client
 * @param fn Middleware that handle an specific request
 */
function handleRequest(req: Request, res: Response, fn: (Request, Response, controller: ModelController) => void) {
    const modelName = req.path.split('/')[2];
    const modelController = new ModelController(modelsCollection, rulesCollection, req['tokenDecoded'], modelName);
    fn(req, res, modelController);
}

function handleGetOneRequest(req: Request, res: Response, controller: ModelController) {
    controller.get(req, res, req.params.id);
}

function handleGetManyRequest(req: Request, res: Response, controller: ModelController) {
    controller.get(req, res);
}

function handlePostRequest(req: Request, res: Response, controller: ModelController) {
    controller.post(req, res);
}

function handlePutRequest(req: Request, res: Response, controller: ModelController) {
    controller.put(req, res, req.params.id);
}

function handleDeleteRequest(req: Request, res: Response, controller: ModelController) {
    controller.delete(req, res, req.params.id);
}
