import styles from './SongResult.module.css';
import { createEffect, createSignal, For } from 'solid-js';
import { addToQueue } from '../spotify';
import { msToLength } from '../utils/time';
import { Song } from '../types/song';

const SongResult = (props: Song) => {
    const [showAddedToQueue, setShowAddedToQueue] = createSignal(false);

    createEffect(() => {
        if (showAddedToQueue()) {
            setTimeout(() => setShowAddedToQueue(false), 1500);
        }
    });
    
    return (
        <div
            class={styles.result}
            onclick={async () => {
                await addToQueue(props.uri);
                setShowAddedToQueue(true);
            }}
        >
            <div class={styles.nameAndImage}>
                <img src={props.album.images.find(i => i.height === 64)?.url} alt='?' />
                <div class={styles.nameAndArtists}>
                    {!showAddedToQueue() ? (
                        <>
                            <div class={styles.songName}>
                                {props.name}
                            </div>
                            <div class={styles.artists}>
                                <For each={props.artists}>
                                    {artist => <span>{artist.name}</span>}
                                </For>
                            </div>
                        </>
                    ) : (
                        <div>
                            Added to queue!
                        </div>
                    )}
                </div>
            </div>
            <div class={styles.duration}>
                {msToLength(props.duration_ms)}
            </div>
        </div>
    )
}

export default SongResult;
