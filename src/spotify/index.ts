import { Song } from '../types/song';
import { User } from '../types/user';
import { generateCodeChallenge, generateRandomString } from '../utils/crypto';
import { urlWithParams } from '../utils/url';
import { api } from '../utils/api';
import { PlayerState } from '../types/player-state';

const client_id = '27412d23a0d54a33bb473391a47712b8';
const redirect_uri = 'http://localhost:3000/';
// const redirect_uri = 'https://spotify.fymmit.com/';

const apiBase = 'https://api.spotify.com/v1';

export const redirectToSpotifyAuthorizeEndpoint = async () => {
    let code_verifier = localStorage.getItem('code_verifier');

    if (!code_verifier) {
        code_verifier = generateRandomString();
        localStorage.setItem('code_verifier', code_verifier);
    }

    const code_challenge = await generateCodeChallenge(code_verifier);

    (window as any).location = urlWithParams('https://accounts.spotify.com/authorize', {
        response_type: 'code',
        client_id,
        scope: 'user-modify-playback-state user-read-playback-state',
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

    return fetch('https://accounts.spotify.com/api/token', {
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
    return await api.get<User>(`${apiBase}/me`);
}

export const querySongs = async (query: string) => {
    const data = await api.get<any>(`${apiBase}/search?type=track&q=${query}`);
    const songs: Song[] = data.tracks.items;
    return songs;
}

export const addToQueue = async (uri: string) => {
    return await api.post(`${apiBase}/me/player/queue?uri=${uri}`);
}

export const getPlaybackState = async () => {
    return await api.get<PlayerState>(`${apiBase}/me/player`);
}

const handleTokenResponse = (data: any) => {
    const { access_token, refresh_token, expires_in } = data;
    const t = new Date();
    const expires_at = t.setSeconds(t.getSeconds() + expires_in).toString();
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    localStorage.setItem('expires_at', expires_at);
}