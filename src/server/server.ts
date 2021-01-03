import Koa from 'koa';
import Router from '@koa/router';
import koaStatic from 'koa-static';

import {
    createHttpTerminator,
} from 'http-terminator';

const fs = require('fs');
const stdoutFd = fs.openSync('output.log', 'a');
const stderrFd = fs.openSync('errors.log', 'a');
require('daemon')({
    stdout: stdoutFd,
    stderr: stderrFd
});

process.title = 'SeaweedFS Daemon Server';

const app = new Koa();

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
