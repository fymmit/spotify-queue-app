/* @refresh reload */
import { render } from 'solid-js/web';

import './index.css';
import App from './App';

const version = '0.0.1';

const storedVersion = localStorage.getItem('version');

if (version !== storedVersion) {
    localStorage.clear();
    localStorage.setItem('version', version);
}

render(() => <App />, document.getElementById('root') as HTMLElement);
