import { createStore } from 'solid-js/store';

interface IState {
    data: {
        display_name: string;
    } | undefined;
}

const initialState: IState = {
    data: undefined
};

const [user, setUser] = createStore({
    ...initialState
});

export const resetUser = () => {
    setUser(initialState);
}

export { user, setUser };
