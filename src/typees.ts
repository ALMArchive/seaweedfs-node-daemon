export interface SeaweedVersion {
    version: string;
    published_at: string;
    assets: SeaweedBinary[];
}

export interface SeaweedBinary {
    name: string;
    size: number;
    url: string;
}
