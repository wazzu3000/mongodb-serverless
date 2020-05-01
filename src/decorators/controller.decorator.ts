import { Request, Response } from 'express';
import app from '../core/app';
import { Controller } from './../controllers/controller';
import { modelsCollection } from './model.decorator';
import { Session } from './../core/session';
import { Dictionary } from './../types';

export type Requestoptions = {
    /**
     * Http verb used to execute this method.
     */
    httpVerb: 'get' | 'post' | 'put' | 'delete',
    /**
     * Flag to set if the current method require an user authentication or not.
     */
    requireLogged: boolean
}

export const controllersCollection: Dictionary<typeof Controller> = { }

/**
 * Decorator to load the controller to the server-less application and generate
 * the specific route prefix to it as `/api/:controllerName`.
 */
export function controller() {
    return function (constructor: Function) {
        
    }
}

/**
 * Allow execute the method from a http request from the url
 * `/api/:ClassName/:methodName`
 * @param options Options for the request
 */
export function httpRequest(options: Requestoptions) {
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        const url = `/api/${target.constructor.name}/${propertyKey}`;
        switch (options.httpVerb) {
            case 'get':
                options.requireLogged && app.get(url, handleAuthRequest);
                app.get(url, handleRequest);
                break;
            case 'post':
                options.requireLogged && app.post(url, handleAuthRequest);
                app.post(url, handleRequest);
                break;
            case 'put':
                options.requireLogged && app.put(url, handleAuthRequest);
                app.put(url, handleRequest);
                break;
            case 'delete':
                options.requireLogged && app.delete(url, handleAuthRequest);
                app.delete(url, handleRequest);
                break;
        }
    }
}

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
 */
function handleRequest(req: Request, res: Response) {
    const urlSplit = req.path.split('/')
    const controllerName = urlSplit[2];
    const methodName = urlSplit[3];
    const ControllerClass = controllersCollection[controllerName] as any;
    new ControllerClass(modelsCollection, req['tokenDecoded'])[methodName](req, res);
}