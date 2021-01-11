import Router from '@koa/router';
import compose from "koa-compose";
import {validateQueryParamsAny} from "../../koa-utilities";
import {downloadSeaweedBinary, getAvaiableSeaweedBinaries, getSeaweedVersions} from "../../../utilities";


const route = new Router();

function makeid(length = 8) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

let cachedSeaweedVersions = {};
async function getVersions(ctx) {
    cachedSeaweedVersions = {};
    const {filterOs} = ctx.request.query;
    const versions = await getSeaweedVersions(filterOs);
    const out = []
    for (const seaweedVersion of versions) {
        const id = makeid();
        cachedSeaweedVersions[id] = seaweedVersion;
        const {asset: {name}, version} = seaweedVersion;
        out.push({id, name, version})
    }
    ctx.body = out;
}

route.get('/versions', getVersions);

async function getHandler(ctx) {
    ctx.body = await getAvaiableSeaweedBinaries();
}

route.get('/', getHandler);

async function postHandler(ctx) {
    const {id} = ctx.request.query;
    if(id in cachedSeaweedVersions) {
        await downloadSeaweedBinary(cachedSeaweedVersions[id]);
        console.log('#!@');
        ctx.body = {};
    } else {
        ctx.status = 400;
        ctx.body = {error: 'Ivalid id'};
    }
}

route.post('/', compose([
    validateQueryParamsAny(['id']),
    postHandler
]));

const router = new Router();
router.use(`/binary`, route.routes(), route.allowedMethods());

export default router;
