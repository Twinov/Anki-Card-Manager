import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Button, Image, Input, Modal, notification } from 'antd'
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

const ClipboardButton = styled(Button)`
  height: 50px;
  margin: 10px;
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
  const [toggleSourceText, setToggleSourceText] = useState(false)
  const [sourceText, setSourceText] = useState('')
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
      .then((response) => {
        if (response.result !== null) setCreatedCards(response.result)
      })
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

  const ocrImage = (ocrAttempt, fullOCR) => {
    if (createdCards.length == 0 && inputText.length == 0 && ocrAttempt < 5) {
      const startTime = new Date()
      notification.open({
        message: 'OCR Image Status',
        description: fullOCR ? `running full OCR on ${cardLocation}` : `running OCR on ${cardLocation}`,
      })
      const ocrEndpoint = fullOCR ? `${APIENDPOINT}/full_ocr_image` : `${APIENDPOINT}/ocr_image`
      fetch(ocrEndpoint, {
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
          ocrImage(ocrAttempt + 1, fullOCR)
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
    //https://stackoverflow.com/a/1500501
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const sourceTextPayload = toggleSourceText && sourceText.trim() ? sourceText.trim().replace(urlRegex, '<a href="$1">$1</a>') : ''
    createdCards.forEach((id) => {
      fetch(`${APIENDPOINT}/add_image_to_card`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardID: id,
          imageLocation: cardLocation,
          sourceText: sourceTextPayload,
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
    if (createdCards && createdCards.length > 0 && inputText.length > 0) {
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
            <p style={{ textAlign: 'center', position: 'relative', transform: 'translateY(30%)' }}>{cardLocation}</p>
          </div>
          <CardImage width={880} src={`${APIENDPOINT}/static/${cardLocation}`} />
        </ImageAndTitle>
        <CardActions>
          <CardInput rows={6} autoSize={true} value={inputText} onChange={(e) => setInputText(e.target.value)} />
          {toggleSourceText && <CardInput rows={1} autoSize={true} value={sourceText} onChange={(e) => setSourceText(e.target.value)} />}
          <CardButtons>
            <Button
              className={createdCards && createdCards.length === 0 && inputText.length == 0 ? 'OCRButton' : ''}
              style={{ color: createdCards.length > 0 ? '#D50000' : '' }}
              onClick={() => {
                ocrImage(0, false)
              }}
            >
              Run OCR
            </Button>
            {inputText.length == 0 && (
              <Button
                style={{ color: createdCards.length > 0 ? '#D50000' : '' }}
                onClick={() => {
                  ocrImage(0, true)
                }}
              >
                Full OCR
              </Button>
            )}
            <Button onClick={() => setToggleSourceText(!toggleSourceText)}>Source Text</Button>
          </CardButtons>
          <p>Parsed Text: [{inputText}]</p>
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

  const [avgOcrTime, setAvgOcrTime] = useState(45)
  const [doneOcr, setDoneOcr] = useState(0)
  const [batchOcrLimit, setBatchOcrLimit] = useState(0)

  const [clipboardImageURL, setClipboardImageURL] = useState('')
  const [clipboardImageBase64, setClipboardImageBase64] = useState('')

  const reloadCards = () => {
    fetch(`${APIENDPOINT}/pending_card_names`)
      .then((response) => response.json())
      .then((res) => setPendingCards(res['cardNames']))
  }

  const batchOcr = async () => {
    const buttons = document.querySelectorAll('.OCRButton')
    setDoneOcr(0)
    const ocrLimit = Math.min(buttons.length, 25) // need to ensure backend doesn't get out of sync
    setBatchOcrLimit(ocrLimit) // react state hooks have a delay
    console.log('Starting batch OCR run of ' + ocrLimit + ' image(s)')
    for (var i = 0; i < ocrLimit; i++) {
      let startTime = new Date()
      buttons[i].click()
      //due to React being weird, need to sleep to avoid timeouts
      await new Promise((r) => setTimeout(r, avgOcrTime * 1000))
      setDoneOcr((prevCount) => prevCount + 1)
      setAvgOcrTime(Math.round((new Date() - startTime) / 1000) + 5)
    }
    console.log('Completed batch OCR run of ' + ocrLimit + ' image(s)')
  }

  const uploadClipboardImage = () => {
    fetch(`${APIENDPOINT}/add_image_to_queue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: clipboardImageBase64 }),
    })
      .then((response) => response.json)
      .then(() => {
        reloadCards()
        setClipboardImageBase64('')
        setClipboardImageURL('')
      })
  }

  useEffect(() => {
    fetch(`${APIENDPOINT}/pending_card_names`)
      .then((response) => response.json())
      .then((res) => setPendingCards(res['cardNames']))

    document.addEventListener('paste', function (evt) {
      // Get the data of clipboard
      const clipboardItems = evt.clipboardData.items
      const items = [].slice.call(clipboardItems).filter(function (item) {
        // Filter the image items only
        return item.type.indexOf('image') !== -1
      })
      if (items.length === 0) {
        return
      }

      const item = items[0]
      // Get the blob of image
      const blob = item.getAsFile()
      setClipboardImageURL(URL.createObjectURL(blob))
      const blobToBase64 = (target) => {
        const reader = new FileReader()
        reader.readAsDataURL(target)
        return new Promise((resolve) => {
          reader.onloadend = () => {
            resolve(reader.result)
          }
        })
      }
      blobToBase64(blob).then((res) => setClipboardImageBase64(res))
    })
  }, [])

  return (
    <>
      {showKanjiRecognition && <KanjiRecognition />}
      <HideDoneFab onClick={() => setHideDone(!hideDone)}>👁️</HideDoneFab>
      <KanjiDrawingFab onClick={() => setShowKanjiRecognition(!showKanjiRecognition)}>字</KanjiDrawingFab>
      <OCRFab onClick={() => batchOcr()}>{doneOcr === batchOcrLimit ? 'OCR' : `${doneOcr}/${batchOcrLimit}`}</OCRFab>
      <Wrapper>
        {pendingCards.map((pendingCard) => {
          return (
            <React.Fragment key={pendingCard}>
              <PendingCardItem cardLocation={pendingCard} hideDone={hideDone} reloadCards={reloadCards} />
            </React.Fragment>
          )
        })}
        <Modal
          visible={clipboardImageURL}
          onCancel={() => {
            setClipboardImageURL('')
            setClipboardImageBase64('')
          }}
          footer={[
            <ClipboardButton key='makeNewCard' size='large' onClick={() => uploadClipboardImage()}>
              create new card from clipboard contents
            </ClipboardButton>,
          ]}
        >
          <p>Image pasted from clipboard:</p>
          <Image src={clipboardImageURL} />
        </Modal>
      </Wrapper>
    </>
  )
}

export default Japanese
