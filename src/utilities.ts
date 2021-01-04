import {SeaweedVersion} from "./typees";
import {tmpdir} from 'os';
import {join} from 'path';
import {mkdirSync, existsSync} from "fs";
import {Octokit} from "@octokit/rest";
const octokit = new Octokit();

export const seaweedFolder = join(tmpdir(), 'seaweedfs-daemon');
export const binPath = join(seaweedFolder, 'bin');

function makeFolder(folder) {
    if(!existsSync(folder)) {
        mkdirSync(folder);
    }
}

export function setupFolders() {
    makeFolder(seaweedFolder);
    makeFolder(binPath);
}

const processBinMap = {
    darwin: 'darwin',
    win32: 'windows',
    linux: 'linux',
    freebsd: 'freebsd',
    openbsd: 'openbsd'
}

export async function grabSeaweedVersions(filterOs: boolean = true): Promise<SeaweedVersion[]> {
    const {data: versions} = await octokit.repos.listReleases({
        owner: 'chrislusf',
        repo: 'seaweedfs',
    });

    return versions.filter(e => e.assets.length > 0)
        .map(e => ({
            version: e.tag_name,
            assets: e.assets.filter(e => {
                if(filterOs) {
                    return e.name.includes(processBinMap[process.platform])
                } else {
                    return true;
                }
            }).map(e => ({name: e.name, size: e.size, url: e.browser_download_url})),
            published_at: e.published_at
        }));
}
