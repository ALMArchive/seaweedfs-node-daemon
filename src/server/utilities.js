import {createError} from "./error-utilities";
import {Errors} from "./errors";

function _allKeysInArray(arr, keys, err) {
    if(!keys.every(e => e in arr)) throw createError(err);
}

function _anyKeyInArray(arr, keys, err) {
    if(!keys.some(e => e in arr)) throw createError(err);
}

export function validateQueryParamsAll(params) {
    return async function validateParams(ctx, next) {
        _allKeysInArray(ctx.request.query, params, Errors.MissingQueryParameter);
        await next();
    }
}

export function validateQueryParamsAny(params) {
    return async function validateParams(ctx, next) {
        _anyKeyInArray(ctx.request.query, params, Errors.MissingQueryParameter);
        await next();
    }
}

export function validateBodyProps(props) {
    return async function validateProps(ctx, next) {
        _allKeysInArray(ctx.request.body, props, Errors.MissingBodyProperty);
        await next();
    }
}
