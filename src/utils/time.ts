export const msToLength = (ms: number) => {
    const minutes = Math.floor(ms / 1000 / 60);
    const seconds = ('0'+ Math.floor((ms / 1000) % 60)).slice(-2);

    return `${minutes}:${seconds}`;
};
