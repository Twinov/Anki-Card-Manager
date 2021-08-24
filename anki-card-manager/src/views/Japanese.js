import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Button, Image, Input, } from 'antd'
import PropTypes from 'prop-types'

import { APIENDPOINT } from '../constants'

const { TextArea } = Input

const Wrapper = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const PendingCardWrapper = styled.div`
  display: flex;
  flex-direction: row;
  margin: 10px;
  gap: 15px;
`

const CardImage = styled(Image)`
  flex-shrink: 0;
`
const CardActions = styled.div`
  display: flex;
  flex-direction: column;
`

const CardInput = styled(TextArea)`
  flex: 2;
  font-size: x-large;
`

const CardButtons = styled.div`
  display: flex;
  flex-direction: row;
  gap: 5px;
`

const PendingCardItem = ({ cardLocation }) => {
  const [inputText, setInputText] = useState('')

  return (
    <PendingCardWrapper>
      <CardImage width={880} src={`${APIENDPOINT}/static/${cardLocation}`} />
      <CardActions>
        <CardInput rows={6} autoSize={true} value={inputText} onChange={e => setInputText(e.target.value)} />
        <p>{inputText}</p>
        <CardButtons>
          <Button type='primary'>Add Pic to Card</Button>
          <Button>Move to Done</Button>
          <Button danger>Delete Image</Button>
        </CardButtons>
      </CardActions>
    </PendingCardWrapper>
  )
}
PendingCardItem.propTypes = {
  cardLocation: PropTypes.string.isRequired
}

const Japanese = () => {
  const [pendingCards, setPendingCards] = useState([])

  useEffect(() => {
    fetch(`${APIENDPOINT}/pending_card_names`)
      .then(response => response.json())
      .then(res => setPendingCards(res['cardNames']))
  }, [])

  return (
    <Wrapper>
      {pendingCards.map(pendingCard => {
        return (
          <React.Fragment key={pendingCard}>
            <PendingCardItem cardLocation={pendingCard} />
          </React.Fragment>
        )
      })}
    </Wrapper>
  )
}

export default Japanese
