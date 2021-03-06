import * as express from 'express';
import { Model } from 'mongoose';
import { Controller } from './controller';
import { Dictionary } from './../types';
import { Rules } from './../models/model';

const defaultPageSize = '100';

export class ModelController extends Controller {
  private readonly model: Model<any>;
  private readonly rules: Rules;

  public constructor(models: Dictionary<Model<any>>, rulesCollection: Dictionary<Rules>, user: Dictionary<any>, modelName: string) {
    super(models, user);
    this.model = models[modelName];
    this.rules = rulesCollection[modelName];
  }

  /**
   * Make a query from the specific collection, you can filter values with
   * the querystring but the variables `_page`, `_page_size`, `_order_by`,
   * `_order_by_desc` and `_query` are used to alter the query.
   * @param req The request sended by the client
   * @param res The response send to the client
   */
  public async get(req: express.Request, res: express.Response)
  /**
   * Find a document by id form the specific collection
   * @param req The request sended by the client
   * @param res The response send to the client
   * @param _id Id of the document
   */
  public async get(req: express.Request, res: express.Response, _id: any)
  public async get(req: express.Request, res: express.Response, _id: any = undefined) {
    if (_id) {
      const getOne = this.rules.access.getOne;
      const filter = {
        _id,
        delete: this.rules.logicalDelete ? false : undefined
      }
      if (typeof getOne === 'object') {
        filter[getOne.filter.documentField] = this.user[getOne.filter.variableSession];
      }

      try {
        const _res = await this.model.findOne(filter);
        _res ? res.json(_res) : res.status(404).end();
      } catch (err) {
        res.status(500).end(err.message || err);
      }
    } else {
      let query = req.query._query;
      const filter = JSON.parse(JSON.stringify(req.query));
      const getMany = this.rules.access.getMany;
      const page = parseInt((typeof req.query._page === 'string' && req.query._page) || '1')
      const pageSize = parseInt((typeof req.query._page_size === 'string' && req.query._page_size) || defaultPageSize)
      delete filter._page;
      delete filter._page_size;
      delete filter._order_by;
      delete filter._order_by_desc;
      delete filter._query;
      if (typeof getMany === 'object') {
        filter[getMany.filter.documentField] = this.user[getMany.filter.variableSession];
      }
      if (this.rules.logicalDelete) {
        filter.delete = false;
      }
      if (query && typeof query === 'string' && this.rules.searchableFields && this.rules.searchableFields.length > 0) {
        const or = []
        let querySimplified = query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
        
        for (let field of this.rules.searchableFields) {
          or.push({ [field]: new RegExp(querySimplified, 'i') })
        }
        filter.$or = or;
      }

      try {
        const _res = await this.model.find(filter)
          .skip(pageSize * (page - 1))
          .limit(pageSize);

        res.json(_res);
      } catch(err) {
        res.status(500).end(err.message || err)
      }
    }
  }

  /**
   * Insert a document in the specific collection
   * @param req The request sended by the client
   * @param res The response send to the client
   */
  public async post(req: express.Request, res: express.Response) {
    const payload = { ...req.body };
    const post = this.rules.access.post;
    if (typeof post === 'object') {
      payload[post.filter.documentField] = this.user[post.filter.variableSession];
    }
    if (this.rules.logicalDelete) {
      payload.delete = false;
    }
    try {
      const _res = await this.model.create(payload);
      res.status(201).json(_res._id);
    } catch(err) {
      if (err.name === 'ValidationError') {
        res.status(400).end(err.message)
      } else {
        res.status(500).end(err.message || err);
      }
    }
  }

  /**
   * Update a document in the specifict collection
   * @param req The request sended by the client
   * @param res The response send to the client
   * @param _id Id of the document
   */
  public async put(req: express.Request, res: express.Response, _id: any) {
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

    try {
      await this.model.update(filter, { $set: payload });
    } catch(err) {
      if (err.name === 'ValidationError') {
        res.status(400).end(err.message)
      } else {
        res.status(500).end(err.message || err);
      }
    }
  }

  /**
   * Delete a document in the specifict collection
   * @param req The request sended by the client
   * @param res The response send to the client
   * @param _id Id of the document
   */
  public async delete(req: express.Request, res: express.Response, _id: any) {
    const filter: Dictionary<any> = { _id };
    const _delete = this.rules.access.delete;
    if (typeof _delete === 'object') {
      filter[_delete.filter.documentField] = this.user[_delete.filter.variableSession];
    }
    if (this.rules.logicalDelete) {
      filter.delete = false;
    }

    try {
      await this.model.deleteOne(filter);
    } catch(err) {
      res.status(500).end(err.message || err);
    }
  }
}