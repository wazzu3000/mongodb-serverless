import { Model } from 'mongoose';
import { Dictionary } from './../types';

export abstract class Controller {
    /**
     * Hashmap that store the models located in the path `modelsPath`. The key
     * is the model name and the values is the `mongoose` model.
     */
    protected readonly models: Dictionary<Model<any>>;
    /**
     * Hashmap that contains the values decoded in the session.
     */
    protected readonly user: Dictionary<any>;

    /**
     * A base class for all controllers.
     * @param models Hashmap that store the models located in the path
     * `modelsPath`. The key is the model name and the values is the `mongoose`
     * model.
     * @param user Hashmap that contains the values decoded in the session.
     */
    protected constructor(models: Dictionary<Model<any>>, user: Dictionary<any>) {
        this.models = models;
        this.user = user;
    }
}