import { Model } from 'mongoose';

export type ModelsCollection = { [name: string]: Model<any> }

export abstract class Controller {
    protected constructor(protected models: ModelsCollection) {}
}