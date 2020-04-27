import * as mongoose from 'mongoose';

type SchemaRule = {
    schema: mongoose.Schema,
    rules: Rules
}

/**
 * Add suport to filter documents according the session values
 */
export type PrivateAccess = {
    /**
     * Just used by semantic, the value everytime must be private.
     */
    access: 'private',
    /**
     * Specify the field names to generate the filter
     */
    filter: {
        /**
         * Field from the `JWT` where take the value to make the filter
         */
        variableSession: string,
        /**
         * Field from the document that make the search
         */
        documentField: string
    }
}

/**
 * Define the type of access of the collections.
 * * **public:** The request may be executed for somebody and isn's required an
 * active session to do it.
 * * **private:** Just the users with an active session can execute the request
 * any invalid session returns the http `401` status code.
 * * **disabled:** The request can't be executed for nobody and everytime it'll
 * returns a http `404` status code.
 * * `object:` The request is private and make a filter of documents
 * @default public
 */
export type AccessModificators = 'public' | 'private' | 'disabled' | PrivateAccess

/**
 * Rules to the http request
 */
export type RuleAccess = {
    /**
     * Http `GET` method to get just 1 element, to execute this method you
     * must send a request to the follow link
     * `/api/:collection_name/:doc_id`.
     */
    getOne?: AccessModificators,
    /**
     * Http `GET` method to get a lot of elements, to execute this method
     * you must send a request to the follow link `/api/:collection_name`.
     * You may generate customer filters added the fields names as
     * query strings.
     */
    getMany?: AccessModificators,
    /**
     * Http `POST` method to create a new document,  to execute this method
     * you must send a request to the follow link `/api/:collection_name`.
     * The success status will be return a 201 http status code and the
     * document id.
     */
    post?: AccessModificators,
    /**
     * Http `PUT` method to update an specific document, to execute this
     * method you must send a request to the follow link
     * `/api/:collection_name/:doc_id`. The success status will be return a
     * 204 status code (Not content).
     */
    put?: AccessModificators,
    /**
     * Http `DELETE` method to delete an specific document, to execute this
     * method you must send a request to the follow link
     * `/api/:collection_name/:doc_id`. The success status will be return a
     * 200 status code and the id of the document deleted. The delete can
     * be logical or physical according the flag `logicalDelete`.
     */
    delete?: AccessModificators
}

/**
 * Rules to specify the router actions.
 */
export type Rules = {
    /**
     * Define the access type of every of the http request methods. If this or
     * some request is not defined, then those will be defined as public.
     */
    access?: RuleAccess,
    /**
     * Flag to specify if a deleted item must be logical (set the field deleted
     * as true) or physical (removing the document of the collection). The
     * default is false
     */
    logicalDelete?: boolean,
    searchable?: boolean
}

export abstract class Model {
    public abstract schema: mongoose.Schema;
}