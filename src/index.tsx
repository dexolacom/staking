import React from 'react';
import ReactDOM from 'react-dom/client';
import { Web3Provider } from '@ethersproject/providers'
import { Web3ReactProvider } from '@web3-react/core'
import './index.css';
import App from './App';

function getLibrary(provider: any) {
  const library = new Web3Provider(provider);
  library.pollingInterval = 12000;
  return library;
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <Web3ReactProvider getLibrary={getLibrary}>
  <App />
</Web3ReactProvider>
);
