import { Song } from './song';

export interface PlayerState {
    is_playing: boolean;
    progress_ms: number;
    item: Song;
}