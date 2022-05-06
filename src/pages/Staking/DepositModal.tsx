// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import Modal from '@material-ui/core/Modal';
import { checkSmallValueAndZero } from './utils'

const DepositModal = ({
  title,
  depositInterest,
  isLockStack,
  isDepositModalOpened,
  setIsDepositModalOpened,
  depositInputValue,
  setDepositInputValue,
  NBUBalance,
  stake,
  gnbu,
  lockDays,
  accessStakeGNBU,
  errorStake,
  unvestedAmount,
  depositInputValueConverted
}) => {
  const [depositRate, setDepositRate] = useState(0)
  const [isBigInput, setIsBigInput] = useState(false)
  const [isHandleMax, setIsHandleMax] = useState(false)

  const errorText = gnbu ? errorStake : null

  useEffect(() => {
    if (+depositInputValue) {
      setDepositRate(((gnbu ? +depositInputValueConverted : +depositInputValue) * depositInterest) / 100 / 52)
    } else {
      setDepositRate(0)
    }
  }, [depositInputValue, depositInputValueConverted])

  const checkBalance = amount => {
    if (typeof amount !== 'string') {
      //console.log(" ERROR! Wrong parametr's type: ", typeof amount)
      return
    }
    let newStr
    if (amount.length > 18) {
      newStr = amount.slice(0, -18) + '.' + amount.slice(-18)
    } else {
      newStr = '0.' + amount.padStart(18, '0')
    }
    return newStr
  }

  const handleMax = () => {
    setDepositInputValue(checkBalance(NBUBalance))
    setIsHandleMax(true)
  }

  const handleCheckMinThreshold = value => {
    //console.log(value, '!!!')
    if (isHandleMax) {
      setIsHandleMax(false)
      return
    }
    if (value * 10 ** 18 > unvestedAmount) {
      setIsBigInput(true)
    } else {
      setIsBigInput(false)
    }
    setDepositInputValue(value)
  }

  return (
    <ModalWrapper open={isDepositModalOpened} onClose={() => setIsDepositModalOpened(false)}>
      <DepositCard>
        <CardColumn>
          <p>{`Staking - ${title}`}</p>
          {isLockStack && (
            <WarningCard>
              <p style={{ marginBottom: '6px' }}>
                Attention!
              </p>
              <p style={{ lineHeight: '24px', paddingRight: '10px' }}>
                {`In hard staking, you won't be able to move your tokens for ${lockDays ? lockDays : 60} days`}
              </p>
            </WarningCard>
          )}
          <InputRow>
            <p style={{ width: '100%' }}>Stake</p>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
                marginTop: '12px'
              }}
            >
              <input
                style={{ width: '100%' }}
                value={depositInputValue}
                onChange={e => handleCheckMinThreshold(e.target.value)}
              />
              <StyledBalanceMax onClick={handleMax}>MAX</StyledBalanceMax>
            </div>
          </InputRow>
          <RowBetween>
            <p>Available Balance</p>
            <p>
              {checkSmallValueAndZero(unvestedAmount)} {gnbu ? 'GNBU' : 'NBU'}
            </p>
          </RowBetween>
          <RowBetween>
            <p style={{ color: '8E8E8E' }}>Staking Reward Rate:</p>
            <p>
              {depositRate.toFixedDown(2)}
              {` NBU / week`}
            </p>
          </RowBetween>
          {isBigInput && depositInputValue > 0 && <InputValueWarning>Not enought balance</InputValueWarning>}
          {errorText && !accessStakeGNBU && (
            <WarningCard>
              <p style={{ marginBottom: '6px' }}>{errorText.title}</p>
              <p style={{ lineHeight: '24px', paddingRight: '10px' }}>{errorText.text}</p>
            </WarningCard>
          )}

          <StakeButtonPrimary
            /*disabled={
              isBigInput || (gnbu ? !accessStakeGNBU : false) || !depositInputValue || Number(depositInputValue) === 0
            }*/
            onClick={() =>
              stake().then(() => {
                setIsDepositModalOpened(false)
              })
            }
            style={{ width: '213px', margin: '0 auto' }}
          >
            Add
          </StakeButtonPrimary>
        </CardColumn>
      </DepositCard>
    </ModalWrapper>
  )
}

export default DepositModal

const ModalWrapper = styled(Modal)`
  max-width: 450px;
  width: 100%;
  height: fit-content;
  margin: 10vh auto 2rem;
  background: grey;
`

const DepositCard = styled.div`
  box-sizing: border-box;
  margin: 0;
  min-width: 0;
  width: 100%;
  border-radius: 16px;
  padding: 1.25rem;
  border: 1px solid rgba(37,37,37,1);
  background-color: rgba(47,47,47,1);
`

const CardColumn = styled.div`
  display: grid;
  grid-auto-rows: auto;
  grid-row-gap: 27px;
`

const RowBetween = styled.div`
  box-sizing: border-box;
  margin: 0;
  min-width: 0;
  width: 100%;
  display: -webkit-box;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  padding: 0;
  align-items: center;
  justify-content: space-between;
`

const StakeButtonPrimary = styled.button`
  padding: 0.75rem;
`

const StyledBalanceMax = styled.button`
  height: 28px;
  border-radius: 0.5rem;
  font-size: 0.875rem;

  font-weight: 500;
  cursor: pointer;
  margin-right: 0.5rem;
`

const InputRow = styled.div<{ selected: boolean }>`
  border-radius: 20px;
  border: 1px solid rgba(40, 40, 40, 1);
  background-color: rgba(47, 47, 47, 1);
  align-items: center;
  padding: ${({ selected }) => (selected ? '0.75rem 0.5rem 0.75rem 1rem' : '0.75rem 0.75rem 0.75rem 1rem')};
  flex-direction: column;
`

const WarningCard = styled.div`
  padding: 24px;
  background: #2d2d2d;
  border-radius: 20px;
`
const InputValueWarning = styled.p`
  color: red;
  margin: 0;
  text-align: center;
`
