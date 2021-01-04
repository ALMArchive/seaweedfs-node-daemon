import {SeaweedVersion} from "./typees";

import {Octokit} from "@octokit/rest";
const octokit = new Octokit();

export async function grabSeaweedVersions(): Promise<SeaweedVersion[]> {
    const {data: versions} = await octokit.repos.listReleases({
        owner: 'chrislusf',
        repo: 'seaweedfs',
    });

    return versions.filter(e => e.assets.length > 0)
        .map(e => ({
            version: e.tag_name,
            assets: e.assets.map(e => ({name: e.name, size: e.size, url: e.browser_download_url})),
            published_at: e.published_at
        }));
}
