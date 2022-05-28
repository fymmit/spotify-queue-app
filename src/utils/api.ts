import { refreshToken } from '../spotify';

const makeRequest = async (url: string, method: string) => {
    let access_token = localStorage.getItem('access_token');
    const expires_at = Number(localStorage.getItem('expires_at'));

    if (!access_token) {
        alert('Not logged in.');
        return;
    }

    if (Number(new Date()) >= expires_at) {
        await refreshToken();
        access_token = localStorage.getItem('access_token');
    }

    const res = await fetch(url, {
        method,
        headers: {
            Authorization: `Bearer ${access_token}`
        }
    });
    if (res.ok) {
        if (res.status === 204) {
            return;
        }
        const data = await res.json();
        return data;
    } else {
        const { error }: { error: { status: number; message: string; }; } = await res.json();
        alert(error.message);
        throw new Error(error.message);
    }
}

const get = (url: string) => makeRequest(url, 'GET');
const post = (url: string) => makeRequest(url, 'POST');

export const api = {
    get,
    post
};
