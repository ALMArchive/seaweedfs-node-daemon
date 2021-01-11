import Router from '@koa/router';
import compose from "koa-compose";
import {validateBodyProps} from "../../koa-utilities";
import {
    buildExecString,
    weedExec
} from "../../../utilities";

const route = new Router();

export let child = null;

async function systemGetHandler(ctx) {
    if (child === null) {
        ctx.body = {seaweedOn: false};
    } else {
        ctx.body = {seaweedOn: true};
    }
}

route.get('/', systemGetHandler);

async function systemPostHandler(ctx) {
    const {config} = ctx.request.body;
    console.log("???");
    console.log(ctx.request.body);
    child = weedExec(buildExecString(config));
    ctx.body = {};
}

route.post('/', compose([
    validateBodyProps(['config']),
    systemPostHandler
]));

async function systemDeleteHandler(ctx) {
    if (child === null) {
        ctx.body = {};
    } else {
        child.kill();
        child = null;
        ctx.body = {};
    }
}

route.delete('/', systemDeleteHandler);

const router = new Router();
router.use(`/system`, route.routes(), route.allowedMethods());

export default router;
