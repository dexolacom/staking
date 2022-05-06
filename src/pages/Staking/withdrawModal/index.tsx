import React from 'react'
import { ModalBody, ModalHeader, PrimaryText, SecondaryText, StyledClose, TertiaryText, Wrapper } from './styles'

interface Props {
  setIsOpen: (a: boolean) => void
  withdrawAndGetReward: () => void
  deposited: number
  reward: number
  gnbu: boolean
}

const WithdrawalModal: React.FC<Props> = ({ setIsOpen, withdrawAndGetReward, deposited, reward, gnbu }) => {
  return (
    <Wrapper>
      <ModalHeader>
        <p style={{ textAlign: 'center' }}>Withdraw</p>
        <StyledClose stroke='white' onClick={() => setIsOpen(false)} />
      </ModalHeader>
      <ModalBody>
        <PrimaryText>Availible Balance</PrimaryText>
        <SecondaryText>
          {+deposited === 0 ? '0' : +deposited < 0.0001 ? '< 0.0001 ' : deposited.toFixed(2)} {gnbu ? 'GNBU' : 'NBU'}
        </SecondaryText>
        <PrimaryText>Stacking Reward</PrimaryText>
        <SecondaryText>
          {' '}
          {+reward === 0 ? '0' : reward < 0.0001 ? '< 0.0001 ' : reward.toFixed(4)} {' NBU'}
        </SecondaryText>
        <button style={{ borderRadius: '8px', marginBottom: '10px', marginTop: '15px' }} onClick={withdrawAndGetReward}>
          Withdraw & Claim
        </button>

        <button
          style={{ borderRadius: '8px', backgroundColor: '#616161', marginBottom: '10px' }}
          onClick={() => setIsOpen(false)}
        >
          Cancel
        </button>

        <TertiaryText>
          When you withdraw the available balance,
          you also withdraw the balance of staking rewards
        </TertiaryText>
      </ModalBody>
    </Wrapper>
  )
}

export default WithdrawalModal
