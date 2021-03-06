import { Component, createEffect, createSignal, For } from 'solid-js';
import { redirectToSpotifyAuthorizeEndpoint, exchangeToken, getUser, querySongs, getPlaybackState } from './spotify';
import { createLocalStorageSignal } from './utils/createLocalStorageSignal';
// import { resetUser } from './store/userStore';

import styles from './App.module.css';
import UserProfile from './components/UserProfile';
import { Song } from './types/song';
import SongResult from './components/SongResult';
import { User } from './types/user';
import { PlayerState } from './types/player-state';

let progressInterval: number | null = null;

const App: Component = () => {
  const [user, setUser] = createLocalStorageSignal<User | undefined>('user', undefined);
  const [searchResults, setSearchResults] = createLocalStorageSignal<Song[]>('songs', []);
  const [search, setSearch] = createLocalStorageSignal<string>('search', '');
  const [playerState, setPlayerState] = createSignal<PlayerState | undefined>(undefined);
  const [progress, setProgress] = createSignal<number>(0);
  const [queue, setQueue] = createLocalStorageSignal<Song[]>('queue', []);

  const updateUser = async () => {
    const data = await getUser();
    setUser(data);
  }

  const updatePlayerState = async (songEnded?: boolean) => {
    const s = await getPlaybackState();
    if (s?.is_playing) {
      if (progressInterval !== null) {
        clearInterval(progressInterval);
      }
      setProgress(s!.progress_ms - 1000);
      setPlayerState(s);
      progressInterval = setInterval(() => setProgress(prev => prev + 1000), 1000);
      if (songEnded) {
        const sliceIndex = queue().findIndex(q => q.uri === s.item.uri) + 1;
        console.log(sliceIndex);
        const newQ = queue().slice(sliceIndex)
        setQueue(newQ);
      }
    }
  }

  const addToQueueList = (song: Song) => {
    const newQueue = queue().concat(song);
    setQueue(newQueue);
  }

  createEffect(async () => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      window.history.replaceState({}, document.title, '/');
      await exchangeToken(code);
      updateUser();
    }
  });

  createEffect(async () => {
    if (user() === undefined && localStorage.getItem('access_token')) {
      updateUser();
    }
  });

  createEffect(async () => {
    if (user() && playerState() === undefined) {
      updatePlayerState();
    }
  });

  createEffect(() => {
    if (playerState() && (progress() > playerState()!.item.duration_ms)) {
      updatePlayerState(true);
    }
  });

  if (playerState() && playerState()!.is_playing === false) {
    return (
      <div class={styles.App}>
        Spotify has to be playing music in order to use the app.
      </div>
    )
  }

  return (
    <div class={styles.App}>
      {user() === undefined ? (
        <button
          onclick={redirectToSpotifyAuthorizeEndpoint}
        >
          Login
        </button>
      ) : (
        <button
          onclick={() => {
            setUser(undefined);
            localStorage.clear();
            window.location.reload();
          }}
        >
          Logout
        </button>
      )}
      <UserProfile
        user={user()}
      />
      {playerState() && (
        <>
          <div class='flexRow center'>
            <div>
              <form
                onsubmit={async (e) => {
                  e.preventDefault();
                  if (search().length > 0) {
                    const songs = await querySongs(search());
                    setSearchResults(songs!);
                  } else {
                    setSearch('');
                    setSearchResults([]);
                  }
                }}
              >
                <input
                  class={styles.search}
                  type="text"
                  onChange={(e) => setSearch((e.target as any).value)}
                  placeholder="Search tracks"
                  value={search()}
                />
              </form>
            </div>
            <div>
              <SongResult
                album={playerState()!.item.album}
                artists={playerState()!.item.artists}
                duration_ms={playerState()!.item.duration_ms}
                name={playerState()!.item.name}
                uri={playerState()!.item.uri}
                readOnly
                progress_ms={progress()}
              />
            </div>
          </div>
          <div class="flexRow">
            <div>
              <h3>Results</h3>
              <For each={searchResults()}>
                {result => (
                  <SongResult
                    name={result.name}
                    artists={result.artists}
                    duration_ms={result.duration_ms}
                    uri={result.uri}
                    album={result.album}
                    addToQueueList={() => addToQueueList(result)}
                  />
                )}
              </For>
            </div>
            <div>
              <h3>Queue</h3>
              <For each={queue()}>
                {q => (
                  <SongResult
                    name={q.name}
                    artists={q.artists}
                    duration_ms={q.duration_ms}
                    uri={q.uri}
                    album={q.album}
                    readOnly
                  />
                )}
              </For>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
