import { Component, createEffect, createSignal, For } from 'solid-js';
import { redirectToSpotifyAuthorizeEndpoint, exchangeToken, getUser, querySongs } from './spotify';
// import { resetUser } from './store/userStore';

import styles from './App.module.css';
import UserProfile from './components/UserProfile';
import { Song } from './types/song';
import SongResult from './components/SongResult';
import { User } from './types/user';

const App: Component = () => {
  const [user, setUser] = createSignal<User>();
  const [searchResults, setSearchResults] = createSignal<Song[]>([]);
  const [search, setSearch] = createSignal('');

  createEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      window.history.replaceState({}, document.title, '/');
      exchangeToken(code);
    }
  });

  createEffect(async () => {
    if (user() === undefined && localStorage.getItem('access_token')) {
      const data = await getUser();
      setUser(data);
    }
  });

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
      <div>
        <form
          onsubmit={async (e) => {
            e.preventDefault();
            const songs = await querySongs(search());
            setSearchResults(songs!);
          }}
        >
          <input class={styles.search} type="text" onChange={(e) => setSearch(e.target.value)} />
        </form>
      </div>
      {searchResults().length > 0 && (
        <h3>Results</h3>
      )}
      <For each={searchResults()}>
        {result => (
          <SongResult
            name={result.name}
            artists={result.artists}
            duration_ms={result.duration_ms}
            uri={result.uri}
            album={result.album}
          />
        )}
      </For>
    </div>
  );
};

export default App;
