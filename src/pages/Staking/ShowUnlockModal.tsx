// @ts-nocheck
import React, { useState, useEffect } from 'react'
import styled from 'styled-components'

import Modal from './Modal'
import { X } from 'react-feather'
import { ArrowLeft } from 'react-feather'

const ShowUnlockModal = ({ title, IsShowUnlockOpened, setIsShowUnlockOpened, unlockPlan, gnbu }) => {
  const content = unlockPlan

  const convertToNormal = (value, decimal, fixed) =>
    parseFloat(fixed ? (value / +`1E${decimal}`).toFixedDownDown(fixed) : value / +`1E${decimal}`)

  const pageLength = 8
  const [pageNumber, setPageNumber] = useState(1)
  const [stakeList, setStakeList] = useState([])
  const [showedStakeList, setShowedStakeList] = useState([])
  const [isLeftEnd, setIsLeftEnd] = useState(true)
  const [isRightEnd, setIsRightEnd] = useState(false)

  useEffect(() => {
    const arr = content.map((item, i) => {
      const date = new Date(item.unlockDate)
      date.setDate(date.getDate())
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']

      return (
        <ListItem key={i}>
          <span style={{ color: '#3DD598' }}>
            {`${
              convertToNormal(item.stakeAmount, 18) < 0.0001 ? '< 0.0001 ' : '+' + convertToNormal(item.stakeAmount, 18)
            } ${gnbu ? ' GNBU' : 'NBU'}`}
          </span>
          <span>
            {`${date.toLocaleTimeString().slice(0, -3)} • ${date.getDate()} 
                  ${months[date.getMonth()]} ${date.getFullYear()}`}
          </span>
        </ListItem>
      )
    })
    setStakeList(arr)
  }, [content, gnbu])

  useEffect(() => {
    const newArr = stakeList.filter(
      (item, i) => i >= (pageNumber - 1) * pageLength && i <= pageLength * pageNumber - 1 && item
    )
    setShowedStakeList([...newArr])
  }, [stakeList, pageNumber])

  const leftArrowHandler = () => {
    if (pageNumber > 1) {
      setPageNumber(prev => prev - 1)
      setIsRightEnd(false)
    }
    if (pageNumber === 2) {
      setIsLeftEnd(true)
    }
  }

  const rightArrowHandler = () => {
    if (pageNumber < Math.ceil(stakeList.length / pageLength)) {
      setPageNumber(prev => prev + 1)
      setIsLeftEnd(false)
    }
    if (pageNumber === Math.ceil(stakeList.length / pageLength) - 1) {
      setIsRightEnd(true)
    }
  }

  return (
    <Modal isOpen={IsShowUnlockOpened} onDismiss={() => setIsShowUnlockOpened(false)}>
      <UnlockCard style={{ position: 'relative' }}>
        <StyledClose stroke="white" onClick={() => setIsShowUnlockOpened(false)} />
        <CardColumn>
          <p style={{ maxWidth: 'calc(100% - 24px)' }}>
            {'Unlock plan of ' + title}
          </p>

          <InputRow>
            <p
              style={{
                width: '100%'
              }}
            >
              {showedStakeList.map(item => item)}
            </p>
          </InputRow>
          {stakeList.length > pageLength && (
            <PaginationBlock>
              <ArrowLeftStyled onClick={!isLeftEnd && leftArrowHandler} disabled={isLeftEnd} />
              <div>{`${pageNumber} / ${Math.ceil(stakeList.length / pageLength)}`}</div>
              <ArrowRightStyled onClick={!isRightEnd && rightArrowHandler} disabled={isRightEnd} />
            </PaginationBlock>
          )}
        </CardColumn>
      </UnlockCard>
    </Modal>
  )
}

const UnlockCard = styled.div`
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

const InputRow = styled.div<{ selected: boolean }>`
  align-items: center;
  padding: '';
  flex-direction: column;
`
const StyledClose = styled(X)`
  position: absolute;
  right: 16px;
  top: 16px;
  :hover {
    cursor: pointer;
  }
`

const ListItem = styled.p`
  display: flex;
  justify-content: space-between;
  margin: 0;
  padding: 11px 0;
  color: #fff;
  border-bottom: 1px solid #525252;
  &:first-child {
    padding-top: 0;
  }

  &:last-child {
    border-bottom: 0;
  }
`
const PaginationBlock = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  & div {
    margin: 0 16px;
    font-size: 12px;
    line-height: 16px;
    color: #bbbbbb;
  }
`
const ArrowLeftStyled = styled(ArrowLeft)`
  background: #616161;
  border-radius: 12px;
  padding: 4px;
  color: ${props => (props.disabled ? '#616161' : 'white')};
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
`

const ArrowRightStyled = styled(ArrowLeftStyled)`
  transform: rotate(180deg);
`

export default ShowUnlockModal
