import styled from 'styled-components';
import { X } from 'react-feather'

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 10px 10px 10px 10px;
  
`

export const StyledClose = styled(X)`
  right: 16px;
  top: 16px;

  :hover {
    cursor: pointer;
  }
`

export const ModalHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 10px;
`

export const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`

export const PrimaryText = styled.a`
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: 500;
  font-size: 18px;
  line-height: 25px;
  margin: 15px 0 0 0;
  color: #BBBBBB;
`

export const SecondaryText = styled.a`
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: 600;
  font-size: 33px;
  line-height: 35px;
  margin: 0 0 15px 0;
  color: #FFF;
`

export const TertiaryText = styled.a`
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: normal;
  font-size: 16px;
  line-height: 20px;
  margin: 15px 0 15px 0;
  color: #BBBBBB;
`;
