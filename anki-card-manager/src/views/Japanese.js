import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Button, Image, Input, notification } from 'antd'
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
  justify-content: center;
  gap: 5px;
`

const PendingCardItem = ({ cardLocation }) => {
  const [inputText, setInputText] = useState('')
  const [createdCards, setCreatedCards] = useState([])

  return (
    <PendingCardWrapper>
      <CardImage width={880} src={`${APIENDPOINT}/static/${cardLocation}`} />
      <CardActions>
        <CardInput rows={6} autoSize={true} value={inputText} onChange={(e) => setInputText(e.target.value)} />
        <p>Parsed Text: [{inputText}]</p>
        <CardButtons>
          <Button
            onClick={() => {
              fetch(`${APIENDPOINT}/find_note_wrapper`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  query: inputText,
                }),
              })
                .then((response) => response.json())
                .then((response) => setCreatedCards(response.result))
            }}
          >
            Scan for created cards
          </Button>
          <p>Found Card IDs: {JSON.stringify(createdCards)}</p>
        </CardButtons>
        <CardButtons>
          <Button
            type='primary'
            onClick={() => {
              if (createdCards.length == 0)
                notification.open({
                  message: 'Add Image Status',
                  description: 'No cards to add pictures to!',
                })
              createdCards.forEach((id) => {
                fetch(`${APIENDPOINT}/add_image_to_card`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    cardID: id,
                    imageLocation: cardLocation,
                  }),
                })
                  .then((response) => response.json())
                  .then((response) => {
                    if (response.error == null)
                      notification.open({
                        message: 'Add Image Status',
                        description: 'Success :)',
                      })
                    else
                      notification.open({
                        message: 'Add Image Status',
                        description: response.error,
                      })
                  })
              })
            }}
          >
            Add Pic to Card
          </Button>
          <Button>Move to Done</Button>
          <Button danger>Delete Image</Button>
        </CardButtons>
      </CardActions>
    </PendingCardWrapper>
  )
}
PendingCardItem.propTypes = {
  cardLocation: PropTypes.string.isRequired,
}

const Japanese = () => {
  const [pendingCards, setPendingCards] = useState([])

  useEffect(() => {
    fetch(`${APIENDPOINT}/pending_card_names`)
      .then((response) => response.json())
      .then((res) => setPendingCards(res['cardNames']))
  }, [])

  return (
    <Wrapper>
      {pendingCards.map((pendingCard) => {
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
