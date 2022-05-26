export interface Song {
    album: {
        images: {
            height: number;
            width: number;
            url: string;
        }[];
        name: string;
        release_date: string;
    };
    artists: {
        name: string;
    }[];
    duration_ms: number;
    name: string;
    uri: string;
}