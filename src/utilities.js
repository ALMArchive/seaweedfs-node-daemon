import {tmpdir} from 'os';
import {join} from 'path';
import {mkdirSync, existsSync} from "fs";
import fetch from 'node-fetch';
import {Octokit} from "@octokit/rest";
import tar from 'tar-fs';
import {promises as fs} from 'fs';
import unzipper from 'unzipper';
import gunzip from "gunzip-maybe";
import {exec} from 'child_process';
import {writeFileSync} from "fs";

const octokit = new Octokit();

export const seaweedFolder = join(tmpdir(), 'seaweedfs-daemon');
export const binPath = join(seaweedFolder, 'bin');
export const downloadPath = join(seaweedFolder, 'download');
const configPath = join(seaweedFolder, 'config.json');

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
    let outName;
    if (name.includes('.zip')) {
        outName = name.replace('.zip', '');
        outPath = join(downloadPath, outName);
        buffer.pipe(unzipper.Extract({path: outPath}))
    } else if (name.includes('.tar.gz')) {
        outName = name.replace('.tar.gz', '');
        outPath = join(downloadPath, outName);
        buffer.pipe(gunzip()).pipe(tar.extract(outPath));
    } else {
        throw new Error('Unknown Type');
    }
    buffer.on('end', async () => {
        const files = await fs.readdir(outPath);
        if (files.length !== 1) {
            throw new Error('Archive has incorrect number of assets: ' + files.length);
        }
        let fileName = `${outName}_`;
        if (name.includes('large')) fileName += 'large_disk_';
        fileName += version.replace(/\./g, '_');
        const filePath = join(binPath, fileName);
        const exec = await fs.readFile(join(outPath, files[0]));
        await fs.writeFile(filePath, exec);
        await fs.chmod(filePath, 0o755);
        await fs.rmdir(outPath, {recursive: true});
    });
}

export async function getAvaiableSeaweedBinaries() {
    return (await fs.readdir(binPath)).filter(e => e !== '.DS_Store');
}

const defaultConfig = {
    bin: '',
    mVolumeSizeLimitMB: 1024,
    vMax: 128,
    mode: 's3',
    dir: ''
}

export async function initConfig() {
    if (await existsSync(configPath)) return;
    await fs.writeFile(configPath, JSON.stringify(defaultConfig));
}

export async function getConfig() {
    return JSON.parse(await fs.readFile(configPath, 'utf-8'));
}

export async function updateConfig(prop, value) {
    const config = await getConfig();
    await fs.writeFile(configPath, JSON.stringify({...config, ...{[prop]: value}}));
}

export function buildExecString(config) {
    const {
        bin,
        mVolumeSizeLimitMB,
        vMax,
        mode,
        dir
    } = config;

    if (!bin) {
        throw new Error('bin must be path to executable');
    }

    if (!dir) {
        throw new Error('dir must be path to data directory');
    }

    let execString = `${join(binPath, bin)} server `;
    if (mVolumeSizeLimitMB) {
        execString += `-master.volumeSizeLimitMB=${mVolumeSizeLimitMB} `;
    }

    if (vMax) {
        execString += `-volume.max=${vMax} `;
    }

    if (mode) {
        execString += `-${mode} `;
    }

    if (dir) {
        execString += `-dir=${dir} `;
    }

    return execString;
}

export function weedExec(execString) {
    return exec(execString, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }

        console.log(`stdout: ${stdout}`);
        writeFileSync('seaweedfs_out.log', stdout);
        console.error(`stderr: ${stderr}`);
    });
}
