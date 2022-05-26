export const urlWithParams = (url: string, params: Record<string, string>) => {
    const urlO = new URL(url);
    urlO.search = new URLSearchParams(params).toString();
    return urlO.toString();
}