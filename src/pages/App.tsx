// @ts-nocheck
import React, { useEffect } from 'react'
import { ConnectButton, setStyles, useConnectors } from 'tech-web3-connector'
import styled from 'styled-components'
import Staking from './Staking'

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
  modalConnectorsContainer: { 'background-color': 'color' }, // example code
  modalConnectorsItem: {},
  modalBtnProvider: {},
  modalNameWallet: { color: 'color' }, // example code
  // styled Button
  BtnBase: {},
  BtnContainer: {},
  BtnAdress: {},
  SpanBalance: {},
  BtnLogout: {},
};

const rpcObj = {
  97: 'https://data-seed-prebsc-2-s3.binance.org:8545',
  56: 'https://bsc-dataseed.binance.org',
};

export default function App() {
  setStyles(customStyles)

  const { setRpcObj } = useConnectors()

  useEffect(() => {
    setRpcObj({ ...rpcObj })
  }, [])

  Number.prototype.toFixedDown = function(digits) {
    const re = new RegExp('(\\d+\\.\\d{' + digits + '})(\\d)'),
      m = this.toString().match(re)
    return m ? parseFloat(m[1]) : this.valueOf()
  }

  return (
    <BodyWrapper>
      <ConnectButton />
      <Staking />
    </BodyWrapper>
  )
}
