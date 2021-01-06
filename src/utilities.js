import {tmpdir} from 'os';
import {join} from 'path';
import {mkdirSync, existsSync} from "fs";
import fetch from 'node-fetch';
import {Octokit} from "@octokit/rest";
import tar from 'tar-fs';
import {promises as fs} from 'fs';
import unzipper from 'unzipper';
import gunzip from "gunzip-maybe";

const octokit = new Octokit();

export const seaweedFolder = join(tmpdir(), 'seaweedfs-daemon');
export const binPath = join(seaweedFolder, 'bin');
export const downloadPath = join(seaweedFolder, 'download');

function makeFolder(folder) {
    if (!existsSync(folder)) {
        mkdirSync(folder);
    }
}

export function setupFolders() {
    makeFolder(seaweedFolder);
    makeFolder(binPath);
    makeFolder(downloadPath);
}

const processBinMap = {
    darwin: 'darwin',
    win32: 'windows',
    linux: 'linux',
    freebsd: 'freebsd',
    openbsd: 'openbsd'
}

export async function getSeaweedVersions(filterOs = true) {
    const {data: versions} = await octokit.repos.listReleases({
        owner: 'chrislusf',
        repo: 'seaweedfs',
    });

    const weedVersions = [];
    for (const version of versions) {
        if (version.assets.length === 0) continue;
        for (const asset of version.assets) {
            if ((filterOs && asset.name.includes(processBinMap[process.platform])) || !filterOs) {
                const {name, size, browser_download_url: url} = asset;
                if (name.includes(('.md5'))) continue;
                weedVersions.push({
                    version: version.tag_name,
                    asset: {name, size, url},
                    published_at: version.published_at
                });
            }
        }
    }
    return weedVersions;
}

export async function downloadSeaweedBinary(seaweedVersion) {
    let {version, asset: {url, name}} = seaweedVersion;

    const buffer = (await fetch(url)).body;
    let outPath;
    if (name.includes('.zip')) {
        outPath = join(downloadPath, name.replace('.zip', ''));
        buffer.pipe(unzipper.Extract({path: outPath}))
    } else if (name.includes('.tar.gz')) {
        outPath = join(downloadPath, name.replace('.tar.gz', ''));
        buffer.pipe(gunzip()).pipe(tar.extract(outPath));
    } else {
        throw new Error('Unknown Type');
    }
    buffer.on('end', async () => {
        const files = await fs.readdir(outPath);
        if(files.length !== 1) {
            throw new Error('Archive has incorrect number of assets: ' + files.length);
        }
        let fileName = 'weed_';
        if(name.includes('large')) fileName += 'large_disk_';
        fileName += version.replace(/\./g, '_');
        await fs.copyFile(join(outPath, files[0]), join(binPath, fileName));
        await fs.rmdir(outPath, {recursive: true});
    });
}

export async function getAvaiableSeaweedBinaries() {
    return (await fs.readdir(binPath)).filter(e => e !== '.DS_Store');
}