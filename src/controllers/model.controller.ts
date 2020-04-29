import * as express from 'express';
import { Model } from 'mongoose';
import { Controller } from './controller';
import { Dictionary } from './../types';
import { Rules } from './../models/model';

export class ModelController extends Controller {
    private readonly model: Model<any>;
    private readonly rules: Rules;

    public constructor(models: Dictionary<Model<any>>, rulesCollection: Dictionary<Rules>, user: Dictionary<any>, modelName: string) {
        super(models, user);
        this.model = models[modelName];
        this.rules = rulesCollection[modelName];
    }

    /**
     * Make a query from the specific collection
     * @param req The request sended by the client
     * @param res The response send to the client
     */
    public get(req: express.Request, res: express.Response)
    /**
     * Find a document by id form the specific collection
     * @param req The request sended by the client
     * @param res The response send to the client
     * @param _id Id of the document
     */
    public get(req: express.Request, res: express.Response, _id: any)
    public get(req: express.Request, res: express.Response, _id: any = undefined) {
        if (_id) {
            const getOne = this.rules.access.getOne;
            const filter = {
                _id,
                delete: this.rules.logicalDelete ? false : undefined
            }
            if (typeof getOne === 'object') {
                filter[getOne.filter.documentField] = this.user[getOne.filter.variableSession];
            }

            this.model.findOne(filter)
                .then(_res => _res ? res.json(_res) : res.status(404).end())
                .catch(err => res.status(500).end(err.message || err));
        } else {
            const filter = Object.assign({}, req.query);
            const getMany = this.rules.access.getMany;
            if (typeof getMany === 'object') {
                filter[getMany.filter.documentField] = this.user[getMany.filter.variableSession];
            }
            if (this.rules.logicalDelete) {
                filter.delete = false;
            }

            this.model.find(filter)
                .then(_res => res.json(_res))
                .catch(err => res.status(500).end(err.message || err))
        }
    }

    /**
     * Insert a document in the specific collection
     * @param req The request sended by the client
     * @param res The response send to the client
     */
    public post(req: express.Request, res: express.Response) {
        const payload = { ...req.body };
        const post = this.rules.access.post;
        if (typeof post === 'object') {
            payload[post.filter.documentField] = this.user[post.filter.variableSession];
        }
        if (this.rules.logicalDelete) {
            payload.delete = false;
        }
        this.model.create(payload)
            .then(_res => res.status(201).json(_res._id))
            .catch(err => {
                res.status(500).write(err);
                res.end();
            });
    }

    /**
     * Update a document in the specifict collection
     * @param req The request sended by the client
     * @param res The response send to the client
     * @param _id Id of the document
     */
    public put(req: express.Request, res: express.Response, _id: any) {
        const filter: Dictionary<any> = { _id };
        const payload = { ...req.body };
        const put = this.rules.access.put;
        if (typeof put === 'object') {
            delete payload[put.filter.documentField];
            filter[put.filter.documentField] = this.user[put.filter.variableSession];
        }
        if (this.rules.logicalDelete) {
            filter.delete = false;
            payload.delete = false;
        }

        this.model.update(
            filter,
            { $set: payload }
        ).then(() => res.status(204).end())
        .catch(err => {
            res.status(500).write(err);
            res.end();
        });
    }

    /**
     * Delete a document in the specifict collection
     * @param req The request sended by the client
     * @param res The response send to the client
     * @param _id Id of the document
     */
    public delete(req: express.Request, res: express.Response, _id: any) {
        const filter: Dictionary<any> = { _id };
        const _delete = this.rules.access.delete;
        if (typeof _delete === 'object') {
            filter[_delete.filter.documentField] = this.user[_delete.filter.variableSession];
        }
        if (this.rules.logicalDelete) {
            filter.delete = false;
        }
        this.model.deleteOne(filter)
            .then(() => res.json(_id))
            .catch(err => {
                res.status(500).write(err);
                res.end();
            });
    }
}