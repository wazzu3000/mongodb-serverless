import { Model } from 'mongoose';
import { Dictionary } from './../types';

export type ModelsCollection = { [name: string]: Model<any> }

export abstract class Controller {
    protected constructor(protected models: ModelsCollection, protected user?: Dictionary<any>) {}
}