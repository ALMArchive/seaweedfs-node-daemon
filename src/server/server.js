import Koa from 'koa';
import Router from '@koa/router';
import koaStatic from 'koa-static';
import bodyParser from 'koa-body';
import {appendFileSync} from "fs";

import {
    createHttpTerminator,
} from 'http-terminator';
import {setupFolders} from "../utilities";

import {Errors} from "./errors";

const errorSet = new Set();
for (const err in Errors) {
    errorSet.add(Errors[err]);
}

setupFolders();

const fs = require('fs');
const stdoutFd = fs.openSync('output.log', 'a');
const stderrFd = fs.openSync('errors.log', 'a');
require('daemon')({
    stdout: stdoutFd,
    stderr: stderrFd
});

process.title = 'SeaweedFS Daemon Server';

const app = new Koa();

app.use(bodyParser({multipart: true}));

app.use(async (ctx, next) => {
    try {
        await next();
    } catch (error) {
        const {error: errorType} = error;
        if (errorSet.has(errorType)) {
            console.error(errorType);
            ctx.status = 400;
            ctx.body = {error: errorType}
        } else {
            console.log(error);
            ctx.status = 500;
            let errorText;
            errorText = `${new Date()}\n`;
            errorText += error + '\n';
            appendFileSync('unknown_errors.txt', errorText);
            ctx.body = {error: 'Unknown error occurred'};
        }

        let errorText;
        if (error.error) {
            errorText = `${new Date()}\n`;
            errorText += 'Error:\n';
            errorText += error.error + '\n';
            errorText += 'Stack Trace:\n';
            if (error.stacktrace) errorText += error.stacktrace.stack + '\n\n';
        } else {
            errorText = error.stack;
        }
        appendFileSync('error_logs.txt', errorText);
    }
});

import api from './api';

app.use(api.routes()).use(api.allowedMethods());

const router = new Router();

app.use(koaStatic('./static'));

router.get('/shut-down', async (ctx, next) => {
    console.log('Shutting down');
    ctx.body = {shuttingDown: true};
    process.nextTick(httpTerminator.terminate);
})

app.use(router.routes()).use(router.allowedMethods());

const server = app.listen(3000);

const httpTerminator = createHttpTerminator({
    server
});


console.log('listening on port 3000');

export const init = () => {};
