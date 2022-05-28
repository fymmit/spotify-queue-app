import styles from './SongResult.module.css';
import { createEffect, createSignal, For } from 'solid-js';
import { addToQueue } from '../spotify';
import { msToLength } from '../utils/time';
import { Song } from '../types/song';
import classNames from 'classnames';

interface ReadOnly {
    readOnly?: boolean;
    progress_ms?: number;
}

type Props = Song & ReadOnly;

const SongResult = (props: Props) => {
    const [showAddedToQueue, setShowAddedToQueue] = createSignal(false);

    // createEffect(() => {
    //     if (showAddedToQueue()) {
    //         setTimeout(() => setShowAddedToQueue(false), 1500);
    //     }
    // });
    
    return (
        <div
            class={classNames(
                styles.result,
                showAddedToQueue() && styles.addedToQueue,
                props.readOnly && styles.readOnly
            )}
            onclick={!props.readOnly ? async () => {
                await addToQueue(props.uri);
                setShowAddedToQueue(true);
            } : undefined}
        >
            <div class={styles.nameAndImage}>
                <img src={props.album.images.find(i => i.height === 64)?.url} alt='?' />
                <div class={styles.nameAndArtists}>
                    <div class={styles.songName}>
                        {props.name}
                    </div>
                    <div class={styles.artists}>
                        <For each={props.artists}>
                            {artist => <span>{artist.name}</span>}
                        </For>
                    </div>
                </div>
            </div>
            <div class={styles.duration}>
                {props.readOnly
                    ? `${msToLength(props.progress_ms!)} / ${msToLength(props.duration_ms)}`
                    : msToLength(props.duration_ms)}
            </div>
        </div>
    )
}

export default SongResult;
