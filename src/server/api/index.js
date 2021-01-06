import Router from '@koa/router';

const api = new Router();
import binaryRoutes from './binary/index';

const routes = [
    binaryRoutes
];

for (const route of routes) {
    api.use('/api', route.routes(), route.allowedMethods());
}

export default api;
