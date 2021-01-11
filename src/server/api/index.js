import Router from '@koa/router';

const api = new Router();
import binaryRoutes from './binary';
import configRoutes from './config';
import systemRoutes from './system';

const routes = [
    binaryRoutes,
    configRoutes,
    systemRoutes
];

for (const route of routes) {
    api.use('/api', route.routes(), route.allowedMethods());
}

export default api;
