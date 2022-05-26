import { Song } from '../types/song';
import { User } from '../types/user';
import { generateCodeChallenge, generateRandomString } from '../utils/crypto';
import { urlWithParams } from '../utils/url';
// import { setUser } from '../store/userStore';

const client_id = '27412d23a0d54a33bb473391a47712b8';
const redirect_uri = 'http://localhost:3000/';

export const redirectToSpotifyAuthorizeEndpoint = async () => {
    let code_verifier = localStorage.getItem('code_verifier');

    if (!code_verifier) {
        code_verifier = generateRandomString();
        localStorage.setItem('code_verifier', code_verifier);
    }

    const code_challenge = await generateCodeChallenge(code_verifier);

    window.location = urlWithParams('https://accounts.spotify.com/authorize', {
        response_type: 'code',
        client_id,
        scope: 'user-modify-playback-state',
        code_challenge_method: 'S256',
        code_challenge,
        redirect_uri
    });
};

export const exchangeToken = (code: string) => {
    const code_verifier = localStorage.getItem('code_verifier');

    if (code_verifier === null) {
        alert('Code verifier is dead.');
        return;
    }

    fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        },
        body: new URLSearchParams({
            client_id,
            grant_type: 'authorization_code',
            code,
            redirect_uri,
            code_verifier
        })
    })
    .then(res => res.json())
    .then(handleTokenResponse);
};

export const refreshToken = () => {
    const refresh_token = localStorage.getItem('refresh_token');

    if (!refresh_token) {
        alert('Refresh token is kill');
        return;
    }

    return fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        },
        body: new URLSearchParams({
            client_id,
            grant_type: 'refresh_token',
            refresh_token
        })
    })
    .then(res => res.json())
    .then(handleTokenResponse);
}

export const getUser = async () => {
    const access_token = localStorage.getItem('access_token');
    const expires_at = Number(localStorage.getItem('expires_at'));

    if (!access_token) {
        alert('Not logged in.');
        return;
    }

    if (new Date() > new Date(expires_at)) {
        await refreshToken();
    }

    return fetch('https://api.spotify.com/v1/me', {
        headers: {
            Authorization: 'Bearer ' + access_token,
        }
    })
    .then(res => res.json()
    .then((data: User) => data));
}

export const querySongs = async (query: string) => {
    const access_token = localStorage.getItem('access_token');
    const expires_at = Number(localStorage.getItem('expires_at'));

    if (!access_token) {
        alert('Not logged in.');
        return;
    }

    if (new Date() > new Date(expires_at)) {
        await refreshToken();
    }

    return fetch(`https://api.spotify.com/v1/search?type=track&q=${query}`, {
        headers: {
            Authorization: 'Bearer ' + access_token,
        }
    })
    .then(res => res.json()
    .then(data => {
        const items: Song[] = data.tracks.items;

        return items;
    }));
}

export const addToQueue = async (uri: string) => {
    const access_token = localStorage.getItem('access_token');
    const expires_at = Number(localStorage.getItem('expires_at'));

    if (!access_token) {
        alert('Not logged in.');
        return;
    }

    if (new Date() > new Date(expires_at)) {
        await refreshToken();
    }

    return fetch(`https://api.spotify.com/v1/me/player/queue?uri=${uri}`, {
        method: 'POST',
        headers: {
            Authorization: 'Bearer ' + access_token,
        }
    });
}

const handleTokenResponse = (data: any) => {
    const { access_token, refresh_token, expires_in } = data;
    const t = new Date();
    const expires_at = t.setSeconds(t.getSeconds() + expires_in).toString();
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    localStorage.setItem('expires_at', expires_at);
}