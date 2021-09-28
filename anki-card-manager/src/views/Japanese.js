import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Button, Image, Input, notification } from 'antd'
import PropTypes from 'prop-types'

import { APIENDPOINT } from '../constants'
import KanjiRecognition from './KanjiRecognition'

const { TextArea } = Input

const OCRFab = styled.button`
  position: fixed;
  z-index: 15;
  cursor: pointer;
  background-color: #b28dff;
  width: 100px;
  height: 100px;
  border-radius: 100%;
  background: #b28dff;
  border: none;
  outline: none;
  right: 50px;
  bottom: 50px;
  color: #fff;
  font-size: 36px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
`

const KanjiDrawingFab = styled.button`
  position: fixed;
  z-index: 15;
  cursor: pointer;
  background-color: #c5a3ff;
  width: 50px;
  height: 50px;
  border-radius: 100%;
  background: #c5a3ff;
  border: none;
  outline: none;
  right: 75px;
  bottom: 160px;
  color: #fff;
  font-size: 36px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
`

const HideDoneFab = styled.button`
  position: fixed;
  z-index: 15;
  cursor: pointer;
  background-color: #77dd77;
  width: 50px;
  height: 50px;
  border-radius: 100%;
  background: #77dd77;
  border: none;
  outline: none;
  right: 75px;
  bottom: 220px;
  color: #fff;
  font-size: 36px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
`

const Wrapper = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const PendingCardWrapper = styled.div`
  display: flex;
  flex-direction: row;
  padding: 10px;
  gap: 15px;
`

const ImageAndTitle = styled.div`
  display: flex;
  flex-direction: column;
`

const CardImage = styled(Image)`
  flex-shrink: 0;
`
const CardActions = styled.div`
  display: flex;
  flex-direction: column;
  max-width: min-content;
`

const CardInput = styled(TextArea)`
  flex: 2;
  font-size: x-large;
`

const CardButtons = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 5px;
`

const PendingCardItem = ({ cardLocation, hideDone, reloadCards }) => {
  const [inputText, setInputText] = useState('')
  const [createdCards, setCreatedCards] = useState([])

  const scanForIDs = (query) => {
    fetch(`${APIENDPOINT}/find_note_wrapper`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query,
      }),
    })
      .then((response) => response.json())
      .then((response) => setCreatedCards(response.result))
  }

  const findInfo = () => {
    if (createdCards.length === 0) return
    fetch(`${APIENDPOINT}/note_info_wrapper`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cardIDs: JSON.stringify(createdCards),
      }),
    })
      .then((response) => response.json())
      .then((response) => setInputText(response['result'][0]['fields']['Sentence']['value']))
  }

  const ocrImage = (ocrAttempt) => {
    if (createdCards.length == 0 && inputText.length == 0 && ocrAttempt < 5) {
      const startTime = new Date()
      notification.open({
        message: 'OCR Image Status',
        description: `running OCR on ${cardLocation}`,
      })
      fetch(`${APIENDPOINT}/ocr_image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageLocation: cardLocation,
        }),
      })
        .then((response) => response.json())
        .then((response) => {
          setInputText(response['result'])
          notification.open({
            message: 'OCR Image Status',
            description: `OCR successfully returned ${response['result']} for ${cardLocation}`,
          })
        })
        .catch((error) => {
          console.error(error)
          console.log(`request failed in ${Math.round((new Date() - startTime) / 1000)}, retrying attempt ${ocrAttempt + 1}`)
          ocrImage(ocrAttempt + 1)
        })
    } else if (createdCards.length == 0 && inputText.length != 0) {
      notification.open({
        message: 'OCR Image Status',
        description: 'Please clear the input field first',
      })
    } else if (createdCards.length == 0 && ocrAttempt >= 5) {
      notification.open({
        message: 'OCR Image Status',
        description: `Giving up on ${cardLocation}, please try again manually.`,
      })
    }
  }

  const addImageToCard = () => {
    if (createdCards.length === 0)
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
  }

  const deleteImage = () => {
    fetch(`${APIENDPOINT}/delete_image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageLocation: cardLocation,
      }),
    })
      .then((response) => response.json)
      .then((res) => {
        if (res.status == 200) {
          notification.open({
            message: 'Delete Image Status',
            description: 'Success :)',
          })
          reloadCards()
        } else {
          notification.open({
            message: 'Delete Image Status',
            description: 'done',
          })
          reloadCards()
        }
      })
  }

  const doneWithImage = () => {
    if (createdCards.length === 0) {
      notification.open({
        message: 'Move Image Status',
        description: 'Warning: No card IDs for the current image.',
      })
    } else {
      fetch(`${APIENDPOINT}/move_image_to_done`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageLocation: cardLocation,
        }),
      })
        .then((response) => response.json)
        .then((res) => {
          if (res.status == 200) {
            notification.open({
              message: 'Move Image Status',
              description: 'Success :)',
            })
            reloadCards()
          } else {
            notification.open({
              message: 'Move Image Status',
              description: 'done',
            })
            reloadCards()
          }
        })
    }
  }

  const titleColor = () => {
    if (createdCards.length > 0 && inputText.length > 0) {
      return '#77dd777d'
    } else if (inputText.length > 0) {
      return '#fdfd967d'
    } else {
      return '#ff80ab7d'
    }
  }

  const displayCard = () => {
    if (hideDone && createdCards.length > 0 && inputText.length > 0) return false
    return true
  }

  useEffect(() => scanForIDs(cardLocation), [])
  useEffect(() => findInfo(), [createdCards])

  return (
    displayCard() && (
      <PendingCardWrapper>
        <ImageAndTitle>
          <div style={{ backgroundColor: titleColor() }}>
            <p style={{ textAlign: 'center', position: 'relative', top: '50%', transform: 'translateY(30%)' }}>{cardLocation}</p>
          </div>
          <CardImage width={880} src={`${APIENDPOINT}/static/${cardLocation}`} />
        </ImageAndTitle>
        <CardActions>
          <CardInput rows={6} autoSize={true} value={inputText} onChange={(e) => setInputText(e.target.value)} />
          <CardButtons>
            <Button
              className={createdCards.length == 0 && inputText.length == 0 ? 'OCRButton' : ''}
              style={{ color: createdCards.length > 0 ? '#D50000' : '' }}
              onClick={() => {
                ocrImage(0)
              }}
            >
              Run OCR
            </Button>
            <p>Parsed Text: [{inputText}]</p>
          </CardButtons>
          <CardButtons>
            <Button onClick={() => scanForIDs(inputText)}>Scan for created cards</Button>
            <p>Found Card IDs: {JSON.stringify(createdCards).split(',').join(', ')}</p>
          </CardButtons>
          <CardButtons>
            <Button type='primary' onClick={() => addImageToCard()}>
              Add Pic to Card
            </Button>
            <Button onClick={() => doneWithImage()}>Move to Done</Button>
            <Button danger onClick={() => deleteImage()}>
              Delete Image
            </Button>
          </CardButtons>
        </CardActions>
      </PendingCardWrapper>
    )
  )
}
PendingCardItem.propTypes = {
  cardLocation: PropTypes.string.isRequired,
  hideDone: PropTypes.bool.isRequired,
  reloadCards: PropTypes.func.isRequired,
}

const Japanese = () => {
  const [pendingCards, setPendingCards] = useState([])
  const [showKanjiRecognition, setShowKanjiRecognition] = useState(false)
  const [hideDone, setHideDone] = useState(false)

  const reloadCards = () => {
    fetch(`${APIENDPOINT}/pending_card_names`)
      .then((response) => response.json())
      .then((res) => setPendingCards(res['cardNames']))
  }

  const batchOcr = async () => {
    const buttons = document.querySelectorAll('.OCRButton')
    const avgOcrTime = 30
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].click()
      //due to React being weird, need to sleep to avoid timeouts
      await new Promise((r) => setTimeout(r, avgOcrTime * 1000))
    }
    console.log('Completed batch OCR run')
  }

  useEffect(() => {
    fetch(`${APIENDPOINT}/pending_card_names`)
      .then((response) => response.json())
      .then((res) => setPendingCards(res['cardNames']))
  }, [])

  return (
    <>
      {showKanjiRecognition && <KanjiRecognition />}
      <HideDoneFab onClick={() => setHideDone(!hideDone)}>👁️</HideDoneFab>
      <KanjiDrawingFab onClick={() => setShowKanjiRecognition(!showKanjiRecognition)}>字</KanjiDrawingFab>
      <OCRFab onClick={() => batchOcr()}>OCR</OCRFab>
      <Wrapper>
        {pendingCards.map((pendingCard) => {
          return (
            <React.Fragment key={pendingCard}>
              <PendingCardItem cardLocation={pendingCard} hideDone={hideDone} reloadCards={reloadCards} />
            </React.Fragment>
          )
        })}
      </Wrapper>
    </>
  )
}

export default Japanese
