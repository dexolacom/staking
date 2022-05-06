// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React from 'react'
import styled from 'styled-components'
import SoftStackCard from './SoftStackCard'
import LockStackCard from './LockStackCard'
import Web3 from 'web3'
import routerAbi from './abi/routerAbi-bsc.json'

const web3 = new Web3(Web3.givenProvider)

export default function Staking() {
  /*test contracts*/
  const PARAMS = {
    ETH_NETWORK: 'https://mainnet.infura.io/v3/7d9d43def2584f2a9f01f2a4719327bc',
    ETH_ROUTER_CONTRACT: process.env.REACT_APP_ROUTER_CONTRACT,
    ETH_NBU_TOKEN_CONTRACT: process.env.REACT_APP_NBU_TOKEN_CONTRACT,
    BSC_TESTNET_NETWORK: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
    BSC_MAINNET_NETWORK: 'https://bsc-dataseed.binance.org/',
    BSC_TESTNET_ROUTER_CONTRACT: '0x2C6cF65f3cD32a9Be1822855AbF2321F6F8f6b24', //mainnet
    BSC_TESTNET_NBU_TOKEN_CONTRACT: '0x5f20559235479F5B6abb40dFC6f55185b74E7b55', //mainnet

    ETH_LOCK_STAKING_NBU_SOFT_CONTRACT: process.env.REACT_APP_LOCK_STAKING_NBU_SOFT_CONTRACT,
    ETH_LOCK_STAKING_NBU_HARD_SMALL_CONTRACT: process.env.REACT_APP_LOCK_STAKING_NBU_HARD_SMALL_CONTRACT,
    ETH_LOCK_STAKING_NBU_HARD_BIG_CONTRACT: process.env.REACT_APP_LOCK_STAKING_NBU_HARD_BIG_CONTRACT,

    ETH_LOCK_STAKING_GNBU_SOFT_CONTRACT: process.env.REACT_APP_LOCK_STAKING_GNBU_SOFT_CONTRACT,
    ETH_LOCK_STAKING_GNBU_HARD_SMALL_CONTRACT: process.env.REACT_APP_LOCK_STAKING_GNBU_HARD_SMALL_CONTRACT,
    ETH_LOCK_STAKING_GNBU_HARD_BIG_CONTRACT: process.env.REACT_APP_LOCK_STAKING_GNBU_HARD_BIG_CONTRACT,

    BSC_LOCK_STAKING_NBU_SOFT_CONTRACT: '0xba081708eb82742958255Ac21e08e861f3c5959a',
    BSC_LOCK_STAKING_NBU_HARD_SMALL_CONTRACT: '0x1c26ED4ddeF62F4085AeB65874D3ED24B243b638',
    BSC_LOCK_STAKING_NBU_HARD_BIG_CONTRACT: '0x928276bC0F0007327F73598B11E2d8BD40e61934',

    BSC_LOCK_STAKING_GNBU_SOFT_CONTRACT: '0x31557dB0c6F614116Fe48Cb5f5CB5E3d8Aa20379',
    BSC_LOCK_STAKING_GNBU_HARD_SMALL_CONTRACT: '0x0AfFD0632cf705aEdF6218AE3CA5Bd7D10a58272',
    BSC_LOCK_STAKING_GNBU_HARD_BIG_CONTRACT: '0x15603Ed5dBBA604d965064e3C4f14C4E2189a012'
  }

  const ROUTER_CONTRACT = new web3.eth.Contract(routerAbi, '0x2C6cF65f3cD32a9Be1822855AbF2321F6F8f6b24')

  return (
    <PageWrapper>
      <div>
        <ListColumn>
          <ListHeader>
            <div>Token</div>
            <div>Type</div>
            <div>Days</div>
            <div>APY</div>
            <div>Status</div>
            <div>Total balance</div>
            <div>Reward</div>
            <div>Status</div>
          </ListHeader>

          <SoftStackCard
            title={'NBU Soft Staking — APY 10%'}
            contractAddress={PARAMS.BSC_LOCK_STAKING_NBU_SOFT_CONTRACT}
            apy={10}
            routerContract={ROUTER_CONTRACT}
          />

          <LockStackCard
            title={'NBU Hard Staking — 60 days / APY 60%'}
            contractAddress={PARAMS.BSC_LOCK_STAKING_NBU_HARD_SMALL_CONTRACT}
            apy={60}
            lockDays={60}
          />

          <SoftStackCard
            title={'GNBU Soft Staking — APY 10%'}
            contractAddress={PARAMS.BSC_LOCK_STAKING_GNBU_SOFT_CONTRACT}
            apy={10}
            gnbu
            routerContract={ROUTER_CONTRACT}
          />

          <LockStackCard
            title={'GNBU Hard Staking — 90 days / APY 28%'}
            apy={28}
            contractAddress={PARAMS.BSC_LOCK_STAKING_GNBU_HARD_SMALL_CONTRACT}
            lockDays={90}
            gnbu
            routerContract={ROUTER_CONTRACT}
          />
        </ListColumn>
      </div>
    </PageWrapper>
  )
}

const PageWrapper = styled.div`
  display: grid;
  grid-auto-rows: auto;
  max-width: max-content;
  width: 100%;
  justify-items: center;
  @media (min-width: 320px) and (max-width: 1200px) {
    width: 360px;
    min-height: 1100px;
    justify-items: flex-start;
  }
`

const ListColumn = styled.div`
  display: grid;
  grid-auto-rows: auto;
  grid-row-gap: 20px;
`

const ListHeader = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-template-columns: 77px 103px 75px 202px 92px 118px 129px 86px;
  align-items: center;
  padding: 0px 24px;
  font-size: 13px;
  color: rgb(142, 142, 142);
  @media (min-width: 320px) and (max-width: 1200px) {
    display: none;
  }
`
