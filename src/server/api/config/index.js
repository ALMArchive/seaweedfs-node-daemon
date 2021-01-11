import Router from '@koa/router';
import compose from "koa-compose";
import {validateQueryParamsAll} from "../../koa-utilities";
import {
    getConfig,
    updateConfig
} from "../../../utilities";

const route = new Router();

async function getHandler(ctx) {
    ctx.body = await getConfig();
}

route.get('/', getHandler);

async function putHandler(ctx) {
    const {prop, value} = ctx.request.query;
    await updateConfig(prop, value);
    ctx.body = {};
}

route.put('/', compose([
    validateQueryParamsAll(['prop', 'value']),
    putHandler
]));

const router = new Router();
router.use(`/config`, route.routes(), route.allowedMethods());

export default router;
