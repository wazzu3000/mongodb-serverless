import app from '../core/app';

export function httpGet() {
    debugger;
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        app.get(`api/${target.constructor.name.replace('Controller', '')}/${propertyKey}`, (req, res) => {
            
        })
        target.constructor
        debugger
    }
}

export function httpPost() {

}

export function httpPut() {

}

export function httpDelete() {

}