import { Accessor, createSignal } from 'solid-js';

type StorageSignal<T> = [get: Accessor<T>, set: (value: T) => void];

export const createLocalStorageSignal = <T>(key: string, iv: T): StorageSignal<T> => {
    const storageValue = localStorage.getItem(key);
    const initialValue = storageValue ? JSON.parse(storageValue) as T : iv;
    const [data, setData] = createSignal(initialValue);

    const set = (value: any) => {
        localStorage.setItem(key, JSON.stringify(value));
        setData(value);
    };

    return [data, set];
};
