import React from 'react';
import './App.css';
import styled from 'styled-components'
import { ConnectButton, setStyles } from 'tech-web3-connector';
import Staking from './pages/Staking'

const BodyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
  justify-content: start;
  z-index: 1;
  flex: 1;
  padding: 50px 20px;
`


const customStyles = {
  // styled modal
  modalBackdrop: {},
  modalContainer: {},
  modalBtnClose: {},
  modalConnectorsContainer: { "background-color": "color" }, // example code
  modalConnectorsItem: {},
  modalBtnProvider: {},
  modalNameWallet: { color: "color" }, // example code

  // styled Button
  BtnBase: {},
  BtnContainer: {},
  BtnAdress: {},
  SpanBalance: {},
  BtnLogout: {},

  // hover Button
  "BtnBase:hover": {
    "background-color": "color", // example code
  },
}

const RPC = {
  56: 'https://bsc-dataseed.binance.org/',
  97: 'https://data-seed-prebsc-2-s3.binance.org:8545',
};

function App() {
  setStyles(customStyles)

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  Number.prototype.toFixedDown = function(digits: string) {
    const re = new RegExp('(\\d+\\.\\d{' + digits + '})(\\d)'),
      m = this.toString().match(re)
    return m ? parseFloat(m[1]) : this.valueOf()
  }

  return (
    <BodyWrapper>
      <ConnectButton RPC={RPC} portisId={'portisId-key-project'} />
      <Staking />
      sdsddsd
    </BodyWrapper>
  );
}

export default App;
