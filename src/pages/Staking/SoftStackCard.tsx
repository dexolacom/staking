// @ts-nocheck
import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import Web3 from 'web3'

import DepositModal from './DepositModal'

import nbuAbi from './abi/nbuAbi.json'
import lockStakingAbi from './abi/stakingRewardsSameTokenFixedAPYAbi.json'
import GNBU_ADI from './abi/gnbu.json'
import LOCK_STAKING_ABI_GNBU from './abi/lockStakingRewardFixedAPY.json'

//import { GNBU } from '../../constants'

import Modal from './Modal'
import WithdrawalModal from './withdrawModal'
import { checkSmallValueAndZero, gnbuNbuConvert, convertValueNew, reduceValue } from './utils'
import { useWeb3React } from '@web3-react/core'

const SoftStackCard = ({ title, apy, contractAddress, gnbu, routerContract }) => {
  const [depositInputValue, setDepositInputValue] = useState('')
  const [isDepositModalOpened, setIsDepositModalOpened] = useState(false)
  const [NBUBalance, setNBUBalance] = useState('0')
  const [unvestedAmount, setUnvestedAmount] = useState(0)
  const [availableToWithdraw, setAvailableToWithdraw] = useState([])
  const [depositBalance, setDepositBalance] = useState('0')
  const [rewardBalance, setRewardBalance] = useState(0)
  const [allowance, setAllowance] = useState(false)
  const [isManagementOpened, setIsManagementOpened] = useState(false)
  const [withdrawModal, setWithdrawModal] = useState<boolean>(false)

  const [rewardCounterId, setRewardCounterId] = useState(null)

  const [depositInputValueConverted, setDepositInputValueConverted] = useState(0)

  const { account } = useWeb3React()

  let NBU_TOKEN_CONTRACT
  let LOCK_STAKING_CONTRACT

  const web3 = new Web3(Web3.givenProvider)

  if (gnbu) {
    NBU_TOKEN_CONTRACT = new web3.eth.Contract(GNBU_ADI as any, '0xA4d872235dde5694AF92a1d0df20d723E8e9E5fC')
    LOCK_STAKING_CONTRACT = new web3.eth.Contract(LOCK_STAKING_ABI_GNBU as any, contractAddress)
  } else {
    NBU_TOKEN_CONTRACT = new web3.eth.Contract(nbuAbi as any, '0x5f20559235479F5B6abb40dFC6f55185b74E7b55')
    LOCK_STAKING_CONTRACT = new web3.eth.Contract(lockStakingAbi as any, contractAddress)
  }

  useEffect(() => {
    if (account) {
      updateBalances()
      if (gnbu) {
        getStakeNonce()
      }
    }
  }, [account, gnbu])

  useEffect(() => {
    if (+depositBalance) {
      earned()
    }

    return () => {
      rewardCounterId && clearInterval(rewardCounterId)
    }
  }, [depositBalance])

  const updateBalances = () => {
    NBUBalanceOf()
    depositBalanceOf()
    unVestedBalanceOf()
  }

  useEffect(() => {
    if (gnbu) {
      gnbuNbuConvert(
        depositInputValue,
        routerContract,
        '0xA4d872235dde5694AF92a1d0df20d723E8e9E5fC',
        '0x5f20559235479F5B6abb40dFC6f55185b74E7b55',
        setDepositInputValueConverted
      )
    }
  }, [depositInputValue])

  useEffect(() => {
    checkAllowance().then(response => {
      if (response === '0') {
        setAllowance(false)
      } else {
        setAllowance(true)
      }
    })
  }, [account, allowance])

  const handleDepositButton = () => {
    checkAllowance().then(response => {
      if (response === '0') {
        approve().then(() => {
          setIsDepositModalOpened(true)
          setAllowance(true)
        })
      } else {
        setIsDepositModalOpened(true)
        setAllowance(true)
      }
    })
  }

  const checkAllowance = async () => {
    try {
      const allowance = await NBU_TOKEN_CONTRACT.methods.allowance(account, contractAddress).call()
      return allowance
    } catch (err) {
      console.error('checkAllowance error', err)
      return Promise.resolve('0')
    }
  }

  const approve = async () => {
    const amount = '115792089237316195423570985008687907853269984665640564039457584007913129639935'
    const approve = await NBU_TOKEN_CONTRACT.methods
      .approve(contractAddress, amount)
      .send({ from: account })
      .on('transactionHash', function(hash) {})
      .on('receipt', function(receipt) {
      })
      .on('error', function(error, receipt) {
      })
    return approve
  }

  const NBUBalanceOf = async () => {
    try {
      const response = await NBU_TOKEN_CONTRACT.methods.balanceOf(account).call()
      setNBUBalance(response)
    } catch (err) {
      console.error('error NBUBalanceOf', err)
    }
  }

  const depositBalanceOf = async () => {
    try {
      const response = await LOCK_STAKING_CONTRACT.methods.balanceOf(account).call()
      setDepositBalance(response)
    } catch (err) {
      console.error('error depositBalanceOf', err)
    }
  }

  const unVestedBalanceOf = async () => {
    const unvestedBalance = await NBU_TOKEN_CONTRACT.methods.availableForTransfer(account).call()

    setUnvestedAmount(unvestedBalance)
  }

  const earned = async () => {
    const response = await LOCK_STAKING_CONTRACT.methods.earned(account).call()

    rewardCounterId && clearInterval(rewardCounterId)

    if (+response !== 0) {
      setRewardBalance(+response)
      addRewardTimer(+response)
    }
  }

  const getReward = async () => {
    const response = await LOCK_STAKING_CONTRACT.methods
      .getReward()
      .send({
        from: account
      })
      .on('transactionHash', function(hash) {})
      .on('receipt', function(receipt) {
        setRewardBalance(0)
        updateBalances()
        earned() // ?
      })
      .on('error', function(error, receipt) {
      })
  }

  const addRewardTimer = balance => {
    const rewardInSecond = ((+depositBalance / 100) * 5) / 365 / 86400
    let sum = balance

    const rewardCounterIdIn = setInterval(() => {
      sum += rewardInSecond
      setRewardBalance(sum)
    }, 1000)
    setRewardCounterId(rewardCounterIdIn)
  }

  const stake = async () => {
    if (depositInputValue === '' || depositInputValue === '0') return
    else {
      const response = await LOCK_STAKING_CONTRACT.methods
        .stake(convertValueNew(depositInputValue))
        .send({
          from: account
        })
        .on('transactionHash', function(hash) {
          setDepositInputValue('')
          setIsDepositModalOpened(false)
        })
        .on('receipt', function() {
          updateBalances()
          gnbu && getStakeNonce()
        })
        .on('error', function(error, receipt) {
        })
    }
  }

  const getStakeNonce = async () => {
    try {
      const response = await LOCK_STAKING_CONTRACT.methods.stakeNonces(account).call()
      if (+response > 0) {
        getStakesInfo(+response)
      }
    } catch (err) {
      console.error('error getStakeNonce:', err)
    }
  }

  const getStakesInfo = async userNonce => {
    let stakeNonces = 0
    if (userNonce === 1) {
      stakeNonces = [0]
    } else {
      stakeNonces = new Array(...Array(userNonce).keys())
    }

    const noncesData = await Promise.all(
      stakeNonces.flatMap(nonce => [LOCK_STAKING_CONTRACT.methods.stakeAmounts(account, nonce).call()])
    ).catch(err => console.error(err))

    const indexArr = noncesData.reduce((accumulator, item, idx) => {
      if (+item > 0) {
        accumulator.push(idx)
      }
      return accumulator
    }, [])

    setAvailableToWithdraw(indexArr)
  }

  const withdrawAndGetReward = async userNonce => {
    if (gnbu) {
      const response = await Promise.all(
        availableToWithdraw.map(stakeIndex =>
          LOCK_STAKING_CONTRACT.methods
            .withdrawAndGetReward(stakeIndex)
            .send({
              from: account
            })
            .on('transactionHash', function(hash) {})
            .on('receipt', function(receipt) {
              clearInterval(rewardCounterId)
              setRewardCounterId(null)
              setRewardBalance(0)
              updateBalances()
              setIsManagementOpened(false)
              setWithdrawModal(false)
              getStakeNonce()
            })
            .on('error', function(error) {
              console.error(error)
            })
        )
      )
    } else {
      const response = LOCK_STAKING_CONTRACT.methods
        .withdrawAndGetReward(depositBalance)
        .send({
          from: account
        })
        .on('transactionHash', function(hash) {})
        .on('receipt', function(receipt) {
          clearInterval(rewardCounterId)
          setRewardCounterId(null)
          setRewardBalance(0)
          updateBalances()
          setIsManagementOpened(false)
          setWithdrawModal(false)
        })
        .on('error', function(error, receipt) {
        })
    }
  }

  const ManagementIsOpened = (
    <svg width="11" height="6" viewBox="0 0 11 6" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9.5 5L5.5 1L1.5 5" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )

  const ManagementIsClosed = (
    <svg width="11" height="6" viewBox="0 0 11 6" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9.5 1L5.5 5L1.5 1" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )

  const softStackValueHandler = value => {
    return String(reduceValue(value)).includes('e-')
      ? reduceValue(value).toFixed(Number(String(reduceValue(value)).split('e-')[1]) + 1)
      : reduceValue(value) < 0.0001
      ? '< 0.0001 '
      : reduceValue(value) > 0.0001 && reduceValue(value)
  }

  return (
    <>
      <Modal isOpen={withdrawModal} onDismiss={() => setWithdrawModal(false)} maxWidth={300}>
        <WithdrawalModal
          setIsOpen={setWithdrawModal}
          withdrawAndGetReward={withdrawAndGetReward}
          gnbu={gnbu}
          deposited={+reduceValue(depositBalance)}
          reward={reduceValue(rewardBalance)}
        />
      </Modal>

      <StakeCard gnbu={gnbu} isOpen={isManagementOpened}>
        <CardColumn>
          <StyledRowBetween>
            <PropCardContent>
              {isManagementOpened ? (
                <>
                  <HeaderText>{title}</HeaderText>
                </>
              ) : (
                <ListHeader>
                  <LeftListHeader>{gnbu ? 'GNBU' : 'NBU'}</LeftListHeader>
                  <LeftListHeader>Soft</LeftListHeader>
                  <LeftListHeader>-</LeftListHeader>
                  <LeftListHeader>{`${apy} %`}</LeftListHeader>
                  <RightListHeader>
                    {+reduceValue(depositBalance).toFixedDown(2) > 0 ? (
                      <div style={{ color: '#3DD598' }}>Active</div>
                    ) : (
                      <div style={{ color: '#BBBBBB' }}>Inactive</div>
                    )}
                  </RightListHeader>
                  <RightListHeader>{checkSmallValueAndZero(depositBalance)}</RightListHeader>
                  <RightListHeader>{checkSmallValueAndZero(rewardBalance, 4)}</RightListHeader>
                </ListHeader>
              )}
            </PropCardContent>

            {account && !+reduceValue(depositBalance) ? (
              <HeaderButton onClick={handleDepositButton}>{allowance ? 'Add' : 'Approve'}</HeaderButton>
            ) : account && +reduceValue(depositBalance) ? (
              <ManageButton
                className={`at-click at-btn-${gnbu ? 'gnbu' : 'nbu'}-soft-manage`}
                onClick={e => setIsManagementOpened(!isManagementOpened)}
              >
                Manage
                {isManagementOpened ? ManagementIsOpened : ManagementIsClosed}
              </ManageButton>
            ) : (
              <HeaderButton
                className={`at-click at-btn-${gnbu ? 'gnbu' : 'nbu'}-soft-${allowance ? 'add' : 'approve'}`}
                disabled
              >
                {allowance ? 'Add' : 'Approve'}
              </HeaderButton>
            )}
          </StyledRowBetween>

          {isManagementOpened ? (
            <BalanceCardWrapper>
              <StakeRow>
                <BalanceCard style={{ padding: '1.5rem' }}>
                  <CardColumn>
                    <p>Total Staked Balance</p>
                    <p>
                      {softStackValueHandler(depositBalance)}
                      {gnbu ? ' GNBU' : ' NBU'}
                    </p>
                    <p>Staking rewards get allocated on this sum</p>
                  </CardColumn>
                  <StyledRowBetween style={{ display: 'grid', gridTemplateColumns: '47% 47%' }}>
                    {+depositBalance ? (
                      <StakeButtonPrimary
                        onClick={() => {
                          setWithdrawModal(true)
                        }}
                      >
                        Withdraw
                      </StakeButtonPrimary>
                    ) : (
                      <StakeButtonPrimary>Withdraw</StakeButtonPrimary>
                    )}

                    {account && +NBUBalance > 0 ? (
                      <StakeButtonPrimary onClick={handleDepositButton}>
                        {allowance ? 'Add' : 'Approve'}
                      </StakeButtonPrimary>
                    ) : (
                      <StakeButtonPrimary>{allowance ? 'Add' : 'Approve'}</StakeButtonPrimary>
                    )}
                  </StyledRowBetween>
                </BalanceCard>
              </StakeRow>

              <StakeRow>
                <BalanceCard style={{ paddingLeft: '0', paddingRight: '0', position: 'relative' }}>
                  <div style={{ padding: '0 24px' }}>
                    <CardColumn>
                      <p>Accumulated Rewards</p>
                      <p>
                        {checkSmallValueAndZero(rewardBalance, 4)}
                        {' NBU'}
                      </p>
                      <p style={{ marginBottom: '20px', whiteSpace: 'pre-line' }}>Rewards get allocated every second</p>
                    </CardColumn>
                  </div>
                  <div style={{ padding: '0 34px', display: 'flex', justifyContent: 'center' }}>
                    {!rewardBalance ? (
                      <StakeButtonPrimary style={{ maxWidth: '213px' }}>Claim</StakeButtonPrimary>
                    ) : (
                      <StakeButtonPrimary onClick={getReward} style={{ maxWidth: '213px' }}>
                        Claim
                      </StakeButtonPrimary>
                    )}
                  </div>
                </BalanceCard>
              </StakeRow>
            </BalanceCardWrapper>
          ) : null}
        </CardColumn>
      </StakeCard>

      <DepositModal
        contractAddress={contractAddress}
        title={title}
        depositInterest={apy}
        isDepositModalOpened={isDepositModalOpened}
        setIsDepositModalOpened={setIsDepositModalOpened}
        depositInputValue={depositInputValue}
        setDepositInputValue={setDepositInputValue}
        reduceValue={reduceValue}
        NBUBalance={unvestedAmount}
        stake={stake}
        gnbu={gnbu}
        accessStakeGNBU
        unvestedAmount={unvestedAmount}
        depositInputValueConverted={depositInputValueConverted}
      />
    </>
  )
}

export default SoftStackCard

const StakeCard = styled.div`
  position: relative;
  padding: ${({ gnbu, isOpen }) => (!isOpen ? '12px 24px' : '24px')}
  border-radius: 12px;
  border: none;
  background-color: #343434;

  box-sizing: border-box;
  margin: 0;
  min-width: 0;
  width: 100%;
  background-color: rgba(47,47,47,1);
  background-color: #343434;
  @media (min-width: 320px) and (max-width: 1200px) {
    width: 360px;
    padding: 40px 16px 16px 16px;
  }
`

const CardColumn = styled.div`
  display: grid;
  grid-auto-rows: auto;
  grid-row-gap: 20px;
`

const BalanceCardWrapper = styled(CardColumn)`
  grid-auto-flow: column;
  grid-gap: 20px;
  padding: 20px 0 0 0;
  @media screen and (max-width: 931px) {
    grid-auto-flow: row;
  }
`

const StakeRow = styled.div`
  width: 100%;
  justify-content: center;
  box-sizing: border-box;
  margin: 0;
  min-width: 0;
  display: flex;
  padding: 0;
  align-items: center;
`

const BalanceCard = styled.div`
  border-radius: 24px;
  padding: 1.5rem 2.125rem;
  text-align: center;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: border-box;
  margin: 0;
  min-width: 0;
  border: 1px solid rgba(37,37,37,1);
  position: relative;
  background-color: #343434;
`

const StakeButtonPrimary = styled.button`
  padding: 0.75rem;
  border-radius: 8px;
`

const ManageButton = styled.button`
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 93px;
  height: 32px;
  padding: 0.31rem;
  font-size: 0.8125rem;
  line-height: 1rem;
  border-radius: 4px;
  background: #3dd598;
  color: #000;

  :hover,
  :focus {
    box-shadow: none;
    background: #2ee397;
  }
`

const HeaderText = styled.p`
  font-size: 20px;
  @media (min-width: 320px) and (max-width: 1200px) {
    font-size: 16px;
    line-height: 24px;
    max-width: 220px;
  }
`

const HeaderButton = styled.button`
  display: flex;
  justify-content: space-around;
  width: auto;
  min-width: 93px;
  max-width: 113px;
  height: 32px;
  padding: 0.31rem;
  font-size: 13px;
  line-height: 19px;
  border-radius: 4px;
  font-weight: 600;

  :disabled {
    color: rgb(255, 255, 255, 0.3);
  }
`

const PropCardContent = styled.div`
  display: flex;
  align-items: center;
  width: auto;
`

const PropCardHelperWrapper = styled.div`
  margin-left: 40px;
`

const ListHeader = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-template-columns: 77px 103px 75px 202px 92px 118px 110px;
  align-items: center;
  padding: 0;
  font-size: 13px;
  color: rgb(142, 142, 142);
`

const LeftListHeader = styled.div`
  font-size: 18px;
  font-style: normal;
  font-weight: 500;
  line-height: 24px;
  letter-spacing: 0px;
  text-align: left;
  color: #ffffff;
`

const RightListHeader = styled.div`
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 24px;
  letter-spacing: 0px;
  text-align: left;
  color: #ffffff;
`

const StyledRowBetween = styled.div`
  box-sizing: border-box;
  margin: 0;
  min-width: 0;
  width: 100%;
  display: flex;
  padding: 0;
  align-items: center;
  justify-content: space-between;
`

