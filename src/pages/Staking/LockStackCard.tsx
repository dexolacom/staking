// @ts-nocheck
import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import Web3 from 'web3'

import DepositModal from './DepositModal'
import ShowUnlockModal from './ShowUnlockModal'

import nbuAbi from './abi/nbuAbi.json'
import lockStakingAbi from './abi/lockStakingRewardSameTokenFixedAPYAbi.json'
import GNBU_ADI from './abi/gnbu.json'
import LOCK_STAKING_ABI_GNBU from './abi/lockStakingRewardFixedAPY.json'

import Modal from './Modal'
import WithdrawalModal from './withdrawModal'
import { checkSmallValueAndZero, gnbuNbuConvert, convertValueNew, convertValue, reduceValue } from './utils'
import { useWeb3React } from '@web3-react/core'

const LockStackCard = ({ title, apy, contractAddress, gnbu, lockDays, routerContract }) => {
  const [depositInputValue, setDepositInputValue] = useState('')
  const [isDepositModalOpened, setIsDepositModalOpened] = useState(false)
  const [IsShowUnlockOpened, setIsShowUnlockOpened] = useState(false)
  const [unvestedAmount, setUnvestedAmount] = useState(0)
  const [depositBalance, setDepositBalance] = useState('0')
  const [rewardBalance, setRewardBalance] = useState(0)
  const [amountToWithdraw, setAmountToWithdraw] = useState(0)
  const [amountToUnlock, setAmountToUnlock] = useState(0)
  const [timeToUnlock, setTimeToUnlock] = useState('')
  const [availableToWithdraw, setAvailableToWithdraw] = useState([])
  const [accessStakeGNBU, setAccessStakeGNBU] = useState(false)
  const [allowance, setAllowance] = useState(false)
  const [isManagementOpened, setIsManagementOpened] = useState(false)
  const [unlockPlan, setUnlockPlan] = useState([])
  const [stackBalance, setStackBalance] = useState(0)
  const [withdraw, setWithdrawModal] = useState<boolean>(false)

  let depositTimerId = null

  const [depositInputValueConverted, setDepositInputValueConverted] = useState(0)
  const [rewardCounterId, setRewardCounterId] = useState(null)

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

  const checkMinThreshold = async () => {
    const res = await LOCK_STAKING_CONTRACT.methods
      .isAmountMeetsMinThreshold(convertValue(depositInputValue, 18))
      .call()
    res ? setAccessStakeGNBU(true) : setAccessStakeGNBU(false)
  }

  const getHardStakeData = async () => {
    const summ = await LOCK_STAKING_CONTRACT.methods.swapTokenAmountThresholdForStaking().call()
    const swapToken = await LOCK_STAKING_CONTRACT.methods.swapToken().call()
    const value = await routerContract.methods.getAmountsIn(summ, ['0xA4d872235dde5694AF92a1d0df20d723E8e9E5fC', swapToken]).call()
    setStackBalance(Math.ceil(reduceValue(value[0])))
  }

  useEffect(() => {
    if (gnbu) {
      ;(async () => await checkMinThreshold())()
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
    if (account) {
      updateBalances()
      getStakeNonce()
    }
    if (gnbu) {
      getHardStakeData()
    }
  }, [account])

  const updateBalances = () => {
    depositBalanceOf()
    unVestedBalanceOf()
  }

  useEffect(() => {
    if (+depositBalance) {
      earned()
      getStakeNonce()
    }

    return () => {
      depositTimerId && clearInterval(depositTimerId)
      rewardCounterId && clearInterval(rewardCounterId)
    }
  }, [depositBalance])

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

  const handleShowUnlockButton = () => {
    setIsShowUnlockOpened(true)
  }

  const checkAllowance = async () => {
    const allowance = await NBU_TOKEN_CONTRACT.methods.allowance(account, contractAddress).call()
    return allowance
  }

  const approve = async () => {
    const amount = '115792089237316195423570985008687907853269984665640564039457584007913129639935'
    const approve = await NBU_TOKEN_CONTRACT.methods
      .approve(contractAddress, amount)
      .send({ from: account })
      .on('transactionHash', function(hash) {})
      .on('receipt', function(receipt) {})
      .on('error', function(error, receipt) {})
    return approve
  }

  const depositBalanceOf = async () => {
    const response = await LOCK_STAKING_CONTRACT.methods.balanceOf(account).call()
    setDepositBalance(response)
  }

  const unVestedBalanceOf = async () => {
    const unvestedBalance = await NBU_TOKEN_CONTRACT.methods.availableForTransfer(account).call()

    setUnvestedAmount(unvestedBalance)
  }

  const earned = async () => {
    const response = await LOCK_STAKING_CONTRACT.methods.earned(account).call()

    depositTimerId && clearInterval(depositTimerId)
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
      .on('transactionHash', function(hash) {
        console.log(hash)
      })
      .on('receipt', function(receipt) {
        setRewardBalance(0)
        updateBalances()
        earned() // ?
      })
      .on('error', function(error, receipt) {
        console.log(error)
      })
  }

  const getStakeNonce = async () => {
    const response = await LOCK_STAKING_CONTRACT.methods.stakeNonces(account).call()
    if (+response > 0) {
      getStakesInfo(+response)
    }
  }

  const getStakesInfo = async userNonce => {
    let stakeNonces
    if (userNonce === 1) {
      stakeNonces = [0]
    } else {
      stakeNonces = new Array(...Array(userNonce).keys())
    }

    const noncesData = await Promise.all(
      stakeNonces.flatMap(nonce => [
        LOCK_STAKING_CONTRACT.methods.stakeAmounts(account, nonce).call(),
        LOCK_STAKING_CONTRACT.methods.stakeLocks(account, nonce).call()
      ])
    )

    const stakesInfo = noncesData.reduce((accumulator, currentValue, index, array) => {
      if (index % 2 === 0 && currentValue > 0) {
        accumulator.push({
          stakeIndex: index / 2,
          stakeAmount: +currentValue,
          unlockDate: new Date(0).setUTCSeconds(array[index + 1])
        })
      }
      return accumulator
    }, [])
    setUnlockPlan(stakesInfo)
    getTimeToDate(stakesInfo)
  }

  const getTimeToDate = stakesInfo => {
    const dateNow = new Date().getTime()
    const availableToWithdraw = []

    setAmountToWithdraw(
      stakesInfo.reduce((sum, stake) => {
        if (stake.unlockDate <= dateNow) {
          availableToWithdraw.push(stake.stakeIndex)
          return sum + stake.stakeAmount
        } else {
          return sum
        }
      }, 0)
    )

    setAvailableToWithdraw(availableToWithdraw)

    for (const stake of stakesInfo) {
      if (stake.unlockDate > dateNow) {
        setAmountToUnlock(amountToUnlock + reduceValue(+stake.stakeAmount))
        startDepositTimer(stake.unlockDate)
        break
      }
    }
  }

  const startDepositTimer = dateFuture => {
    depositTimerId = setInterval(() => {
      const dateNow = new Date().getTime()

      let delta = (dateFuture - dateNow) / 1000

      if (delta <= 0) {
        clearInterval(depositTimerId)
        setAmountToUnlock(0)
        getStakeNonce()
        return
      }

      const days = Math.floor(delta / 86400)
      delta -= days * 86400

      const hours = Math.floor(delta / 3600) % 24
      delta -= hours * 3600

      const minutes = Math.floor(delta / 60) % 60
      delta -= minutes * 60

      const seconds = Math.floor(delta % 60)

      const timerMessage = days
        ? `${days}d`
        : hours
        ? `${hours}h`
        : minutes
        ? `${minutes}m`
        : seconds
        ? `${seconds}s`
        : ''

      setTimeToUnlock(timerMessage)
    }, 1000)
  }

  const addRewardTimer = balance => {
    const rewardInSecond = ((+depositBalance / 100) * 7) / 365 / 86400
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
        })
        .on('error', function(error, receipt) {
          console.log(error)
        })
    }
  }

  const withdrawAndGetReward = async () => {
    const response = await Promise.all(
      availableToWithdraw.map(stakeIndex =>
        LOCK_STAKING_CONTRACT.methods
          .withdrawAndGetReward(stakeIndex)
          .send({
            from: account
          })
          .on('transactionHash', function(hash) {
            console.log(hash)
          })
          .on('receipt', function(receipt) {
            clearInterval(rewardCounterId)
            setRewardCounterId(null)
            setAmountToWithdraw(0) // ?
            setRewardBalance(0)
            updateBalances()
            setIsManagementOpened(false) // ???
            setWithdrawModal(false) // ???
          })
          .on('error', function(error) {
            console.error(error)
          })
      )
    )
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

  // @ts-ignore
  return (
    <>
      <Modal isOpen={withdraw} onDismiss={() => setWithdrawModal(false)} maxWidth={300}>
        <WithdrawalModal
          setIsOpen={setWithdrawModal}
          withdrawAndGetReward={withdrawAndGetReward}
          gnbu={gnbu}
          deposited={+reduceValue(amountToWithdraw)}
          reward={reduceValue(rewardBalance)}
        />
      </Modal>

      <StakeCard gnbu={gnbu} isOpen={isManagementOpened}>
        {gnbu && <LimitedTimeOffer>Limited-time offer</LimitedTimeOffer>}
        <CardColumn>
          <StyledRowBetween>
            <PropCardContent>
              {isManagementOpened ? (
                <>
                  <p>{title}</p>
                  <PropCardHelperWrapper></PropCardHelperWrapper>
                </>
              ) : (
                <ListHeader>
                  <LeftListHeader>{gnbu ? 'GNBU' : 'NBU'}</LeftListHeader>
                  <LeftListHeader>Hard</LeftListHeader>
                  <LeftListHeader>{lockDays}</LeftListHeader>
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
              <HeaderButton onClick={handleDepositButton}>{allowance ? 'add' : 'Approve'}</HeaderButton>
            ) : account && +reduceValue(depositBalance) ? (
              <>
                {+reduceValue(depositBalance && isManagementOpened) ? (
                  <ManageButton style={{ width: '153px', marginRight: '25px' }} onClick={handleShowUnlockButton}>
                    Show unlock Plan
                  </ManageButton>
                ) : null}

                <ManageButton onClick={e => setIsManagementOpened(!isManagementOpened)}>
                  Manage
                  {isManagementOpened ? ManagementIsOpened : ManagementIsClosed}
                </ManageButton>
              </>
            ) : (
              <HeaderButton>{allowance ? 'Add' : 'Approve'}</HeaderButton>
            )}
          </StyledRowBetween>
          {isManagementOpened ? (
            <BalanceCardWrapper>
              <StakeRow>
                <BalanceCard style={{ paddingLeft: '0', paddingRight: '0' }}>
                  <div style={{ padding: '0 24px' }}>
                    <CardColumn>
                      <p>Total Staked Balance</p>
                      <p>
                        {(+reduceValue(depositBalance) - reduceValue(amountToWithdraw)).toFixed(2)}{' '}
                        {gnbu ? 'GNBU' : 'NBU'}
                      </p>
                      <p>Staking rewards get allocated on this sum</p>
                    </CardColumn>
                  </div>
                  <div style={{ padding: '0 34px' }}>
                    <StakeButtonPrimary onClick={handleDepositButton}>
                      {allowance ? 'add' : 'Approve'}
                    </StakeButtonPrimary>
                  </div>
                </BalanceCard>
              </StakeRow>

              <StakeRow>
                <BalanceCard style={{ paddingLeft: '0', paddingRight: '0' }}>
                  <div style={{ padding: '0 24px' }}>
                    <CardColumn>
                      <p>Available Balance</p>
                      <p>
                        {checkSmallValueAndZero(amountToWithdraw)}
                        {` `}
                        {gnbu ? 'GNBU' : 'NBU'}
                      </p>
                      {amountToUnlock ? (
                        <StyledRowBetween>
                          <div style={{ textAlign: 'left' }}>
                            <p>
                              {amountToUnlock < 0.0001 ? '< 0.0001 ' : amountToUnlock}
                              {` `} {gnbu ? 'GNBU' : 'NBU'}
                            </p>
                            <p>{`can be withdrawn in ${timeToUnlock}`}</p>
                          </div>
                        </StyledRowBetween>
                      ) : (
                        <p>You don't have any staked tokens ready for withdrawal</p>
                      )}
                    </CardColumn>
                  </div>
                  <div style={{ padding: '0 34px' }}>
                    {amountToWithdraw ? (
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
                  </div>
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
                      <p>Rewards get allocated every second</p>
                    </CardColumn>
                  </div>
                  <div style={{ padding: '0 34px' }}>
                    {!rewardBalance ? (
                      <StakeButtonPrimary>Claim</StakeButtonPrimary>
                    ) : (
                      <StakeButtonPrimary onClick={getReward}>Claim</StakeButtonPrimary>
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
        isLockStack={true}
        isDepositModalOpened={isDepositModalOpened}
        setIsDepositModalOpened={setIsDepositModalOpened}
        depositInputValue={depositInputValue}
        setDepositInputValue={setDepositInputValue}
        reduceValue={reduceValue}
        NBUBalance={unvestedAmount}
        gnbu={gnbu}
        stake={stake}
        lockDays={lockDays}
        accessStakeGNBU={accessStakeGNBU}
        errorStake={{
          title: 'Not enough GNBU worth for staking',
          text: `Stake at least ${stackBalance} GNBU - $250 worth of GNBU in order to activate your stake.`
        }}
        hardStaking={true}
        unvestedAmount={unvestedAmount}
        depositInputValueConverted={depositInputValueConverted}
      />

      <ShowUnlockModal
        title={title}
        IsShowUnlockOpened={IsShowUnlockOpened}
        setIsShowUnlockOpened={setIsShowUnlockOpened}
        unlockPlan={unlockPlan}
        gnbu={gnbu}
      />
    </>
  )
}

export default LockStackCard

const StakeCard = styled.div`
  position: relative;
  padding: ${({ gnbu, isOpen }) => (gnbu && !isOpen ? '24px 24px 12px' : !gnbu && !isOpen ? '12px 24px' : '24px')}
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
  width: 281px;
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
  &:disabled {
    background-color: rgb(97, 97, 97, 0.7);
    color: rgb(255, 255, 255, 0.3);
  }
`

const LimitedTimeOffer = styled.div`
  position: absolute;
  padding: 2px 12px 1px;
  background: #3dd598;
  font-weight: 500;
  color: black;
  font-size: 13px;
  top: 0;
  left: 0;
  border-radius: 12px 0px;

  /* @media (min-width: 320px) and (max-width: 931px) { */
  @media (min-width: 320px) and (max-width: 1200px) {
    border-radius: 0 0 8px 8px;
    left: 16px;
  }
`

const ManageButton = styled.button`
  display: flex;
  justify-content: space-around;
  width: 93px;
  height: 32px;
  padding: 0.31rem;
  font-size: 0.8125rem;
  line-height: 1rem;
  border-radius: 4px;
  align-items: center;
  background: #3dd598;
  color: #000;
  :hover,
  :focus {
    box-shadow: none;
    background: #2ee397;
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
  /* justify-content: space-between; */
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
