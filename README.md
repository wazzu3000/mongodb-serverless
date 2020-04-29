# Mongodb Serverless

A minimalist webtool over [express](https://github.com/expressjs/express),
[mongoose](https://github.com/Automattic/mongoose) and [jwt](https://jwt.io/)
to build web api fastest possible with TypeScript.

## Description

This webtool was developed by the fastidious to write similar code for the
**CRUD** on every mongo's collection, with this tool you just need write the
mongo schema with the **mongoose** schema class and decorate it to specify who
can access to the documents, if you need create an specific action, you can
create custom controllers to do it.

## Intial configurations

Before to start you need create or update your `tsconfig.json` file at least
with the follow values

```json
{
    "compilerOptions": {
        "target": "ES5",
        "module": "CommonJS",
        "experimentalDecorators": true
    }
}
```

You can read the complete documentation of `tsconfig.json` files
[here](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)

## Usage

### Seting the initial values

At start, you need import the function `mongodbServerless` from
`mongodb-serverless`, it needs some values to configure **express**,
**mongoose** and **jwt** session; this is an async function and returns a
promise with an app from express.

Example to how to start the `index.ts` file.

```typescript
(async function () {
    await mongodbServerless({
        app: {
            controllersPath: '', // Path where are the controllers
            modelsPath: '',      // Path where are the models
            port: 0              // Port to listhen the http request
        },
        database: {
            host: '', // Hostname or url of the database server
            user: '', // User to login
            pass: '', // Password to login
            name: '', // Name of the database
            port: 0   // Port numer (just if you use some different at the 27017)
        },
        session: {
            jwtSecret: '', // Word to sign the JWT
            ttl: 0         // Time ti live the session in seconds
        }
    })
})();
```

Before to run your first test you need have the `models` and `controllers` path
in your project.

> The `models` and `controllers` not must be the same path.

### Creating your first model

Every model must be a class that inherit from `Model` class, it must be
decorated as `model` and the export must be set as default.

Example about how to create your first `Model` class.

```typescript
@model('example', {
    access: {
        getMany: 'public',
        getOne: 'public',
        post: 'private',
        put: 'private',
        delete: 'disabled',
    }
})
export default class ExampleModel extends Model {
    public schema = new mongoose.Schema({
        field1: String
        field2: { type: String, required: true },
        field3: Boolean,
    });
}
```

The correct way to make the request for the **CRUD** are:

* `GET` - `/api/:model_name` Get many documents
* `GET` - `/api/:model_name/:document_id` Get one document by its id
* `POST` - `/api/:model_name` Create a new document
* `PUT` - `/api/:model_name/:document_id` Update a specific document by its id
* `DELETE` - `/api/:model_name/:document_id` Delete a specific document by its id

> To make a request to the model for this example is with the url: `/api/example`

### Creating your first custom controller

Every controller must be a class that inherit from `Controller` class, it must
be decorated as `controller`, the export must be set as default and its methods
that you want access from an http request must be decorated as `httpRequest`
and it must be have 2 params, the first argument contains a `Request` object
and the second a `Response` object.

You can found here more details about express
[Request](https://expressjs.com/es/api.html#req) and
[Response](https://expressjs.com/es/api.html#res) objects.

Example about how to create your first `Model` class.

```typescript
@controller()
export default class ExampleController extends Controller {
    @httpRequest({
        httpVerb: 'get',
        requireLogged: false
    })
    public foo(req: Request, res: Response) {
        res.write('Hello World');
        res.end();
    }
}
```

> The correct way to execute the example method is make a `GET` request to the
>  `/api/ExampleController/foo` url.