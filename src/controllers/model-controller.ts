import * as express from 'express';
import { Model } from 'mongoose';
import { Controller, ModelsCollection } from './controller';

export class ModelController extends Controller {
    private model: Model<any>
    private _modelName: string;

    public get modelName(): string {
        return this._modelName;
    }

    public constructor(models: ModelsCollection, modelName: string) {
        super(models);
        this.model = models[modelName];
        this._modelName = modelName;
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
     * @param id Id of the document
     */
    public get(req: express.Request, res: express.Response, id: any)
    public get(req: express.Request, res: express.Response, id: any = undefined) {
        if (id) {
            this.model.findById(id)
                .then(res => res.json(res))
                .catch(err => res.status(500).end(err));
        } else {
            this.model.find(req.query)
                .then(_res => res.json(_res))
                .catch(err => res.status(500).end(err))
        }
    }

    /**
     * Insert a document in the specific collection
     * @param req The request sended by the client
     * @param res The response send to the client
     */
    public post(req: express.Request, res: express.Response) {
        this.model.create(req.body)
            .then(res => res.status(201).json(res._id))
            .catch(err => res.status(500).end(err));
    }

    /**
     * Update a document in the specifict collection
     * @param req The request sended by the client
     * @param res The response send to the client
     * @param id Id of the document
     */
    public put(req: express.Request, res: express.Response, id: any) {
        this.model.update(
            { _id: id },
            { $set: req.body }
        ).then(() => res.status(204).end())
        .catch(err => res.status(500).end(err));
    }

    /**
     * Delete a document in the specifict collection
     * @param req The request sended by the client
     * @param res The response send to the client
     * @param id Id of the document
     */
    public delete(req: express.Request, res: express.Response, id: any) {
        this.model.deleteOne({ _id: id })
            .then(() => res.json(id))
            .catch(err => res.status(500).end(err));
    }
}