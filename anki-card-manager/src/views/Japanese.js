import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Button, Image, Input, InputNumber, Modal, notification } from 'antd'
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

const JumpToNextUnfinishedFab = styled.button`
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
  bottom: 220px;
  color: #fff;
  font-size: 25px;
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
  bottom: 280px;
  color: #fff;
  font-size: 36px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
`

const StatsDiv = styled.div`
  position: fixed;
  z-index: 15;
  flex-direction: column;
  align-items: center;
  right: 50px;
  top: 50px;
`

const Wrapper = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const ModalButton = styled(Button)`
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
  max-height: 80vh;
  max-width: 880px;
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

const formatHtmlSpecialChars = (text) => {
  return text.replaceAll('&amp;', '&').replaceAll('&lt;', '<').replaceAll('&gt;', '>')
}

const PendingCardItem = ({ cardLocation, hideDone, reloadCards }) => {
  const [initiallyDone, setInitiallyDone] = useState(false)
  const [inputText, setInputText] = useState('')
  const [toggleSourceText, setToggleSourceText] = useState(false)
  const [sourceText, setSourceText] = useState('')
  const [createdCards, setCreatedCards] = useState([])
  const [imageHash, setImageHash] = useState(Date.now()) //https://stackoverflow.com/a/47923081

  const scanForIDs = (query, clean, firstRun) => {
    fetch(`${APIENDPOINT}/find_note_wrapper`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query,
        clean: clean,
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.result !== null) {
          setCreatedCards(response.result)
          if (firstRun) setInitiallyDone(true)
        }
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
      .then((response) => {
        setInputText(formatHtmlSpecialChars(response['result'][0]['fields']['Sentence']['value']))
        const sourceFieldText = response['result'][0]['fields']['Source']['value']
        // trim down because it's in the form blah blah <img source...></img> with the image
        let srcText = sourceFieldText.substring(0, sourceFieldText.indexOf('<img'))
        if (srcText) {
          setToggleSourceText(true)
          setSourceText(srcText.includes('href') ? srcText.substring(srcText.indexOf('"') + 1, srcText.indexOf('>') - 1) : srcText)
        }
      })
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
          setInputText(formatHtmlSpecialChars(response['result']))
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

  const optimizeImage = () => {
    const optimizeEndpoint = `${APIENDPOINT}/optimize_image`
    fetch(optimizeEndpoint, {
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
        notification.open({
          message: 'Image Optimization Status',
          description: `Optimize returned ${response['result']} for ${cardLocation}`,
        })
        setImageHash(Date.now())
      })
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
    if (hideDone && initiallyDone && createdCards.length > 0 && inputText.length > 0) return false
    return true
  }

  useEffect(() => scanForIDs(cardLocation, false, true), [])
  useEffect(() => findInfo(), [createdCards])

  return (
    displayCard() && (
      <PendingCardWrapper>
        <ImageAndTitle>
          <div style={{ backgroundColor: titleColor() }} className={createdCards.length > 0 ? '' : 'unfinished'}>
            <p style={{ textAlign: 'center', position: 'relative', transform: 'translateY(30%)' }}>{cardLocation}</p>
          </div>
          <CardImage src={`${APIENDPOINT}/static/${cardLocation}?t=${imageHash}`} />
        </ImageAndTitle>
        <CardActions>
          <CardInput rows={6} autoSize={true} value={inputText} onChange={(e) => setInputText(e.target.value)} />
          {toggleSourceText && <CardInput rows={1} autoSize={true} value={sourceText} onChange={(e) => setSourceText(e.target.value)} />}
          <CardButtons>
            <Button
              className={createdCards && createdCards.length === 0 && inputText.length == 0 ? 'BatchOCRButton' : ''}
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
            <Button className={createdCards && createdCards.length === 0 && inputText.length == 0 ? 'BatchOptimizeButton' : ''} onClick={() => optimizeImage()}>
              Optimize
            </Button>
          </CardButtons>
          <p>Parsed Text: [{inputText}]</p>
          <CardButtons>
            <Button onClick={() => scanForIDs(inputText, true, false)}>Scan for created cards</Button>
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
  const [unfinishedCards, setUnfinishedCards] = useState(0)
  const [ocrPendingCards, setOcrPendingCards] = useState(0)
  const [initCardsDone, setInitCardsDone] = useState(0)
  const [currentSessionCompleted, setCurrentSessionCompleted] = useState(0)
  const [showKanjiRecognition, setShowKanjiRecognition] = useState(false)
  const [hideDone, setHideDone] = useState(false)

  const [ocrModalVisible, setOcrModalVisible] = useState(false)
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
    const ocrButtons = document.querySelectorAll('.BatchOCRButton')
    const optimizeButtons = document.querySelectorAll('.BatchOptimizeButton')
    setDoneOcr(0)
    const ocrLimit = Math.min(ocrButtons.length, optimizeButtons.length, batchOcrLimit) // need to ensure backend doesn't get out of sync
    setBatchOcrLimit(ocrLimit) // react state hooks have a delay
    console.log('Starting batch OCR run of ' + ocrLimit + ' image(s)')
    for (var i = 0; i < ocrLimit; i++) {
      let startTime = new Date()
      ocrButtons[i].click()
      optimizeButtons[i].click()
      //due to React being weird, need to sleep to avoid timeouts
      await new Promise((r) => setTimeout(r, avgOcrTime * 1000))
      setDoneOcr((prevCount) => prevCount + 1)
      setAvgOcrTime(Math.round((new Date() - startTime) / 1000) + 5)
    }
    console.log('Completed batch OCR run of ' + ocrLimit + ' image(s)')
  }

  const jumpToNextUnfinished = () => {
    if (document.getElementsByClassName('unfinished')[0]) document.getElementsByClassName('unfinished')[0].scrollIntoView({ behavior: 'smooth' })
    else
      notification.open({
        message: 'Unfinished Images',
        description: 'No unfinished images to jump to!',
      })
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

  const refreshStats = () => {
    // not rly true but w/e, good enough
    const batchOcrButtons = document.querySelectorAll('.BatchOCRButton')
    const unfinishedLength = document.getElementsByClassName('unfinished').length
    setUnfinishedCards(unfinishedLength)
    setOcrPendingCards(unfinishedLength - batchOcrButtons.length)
    setCurrentSessionCompleted(pendingCards.length - unfinishedLength - initCardsDone)
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
      <JumpToNextUnfinishedFab onClick={() => jumpToNextUnfinished()}>⬇️</JumpToNextUnfinishedFab>
      <OCRFab onClick={() => setOcrModalVisible(true)}>{doneOcr === batchOcrLimit ? 'OCR' : `${doneOcr}/${batchOcrLimit}`}</OCRFab>
      <StatsDiv>
        <p>Current Stats:</p>
        <p>Total Loaded Cards: {pendingCards.length}</p>
        <p>Unfinished Cards: {unfinishedCards}</p>
        <p>OCR&apos;d but pending cards: {ocrPendingCards}</p>
        <p>Cards done this session: {currentSessionCompleted}</p>
        <Button onClick={() => refreshStats()}>Refresh</Button>
        <Button onClick={() => setInitCardsDone(pendingCards.length - document.getElementsByClassName('unfinished').length)}>Reset Session</Button>
      </StatsDiv>
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
            <ModalButton key='makeNewCard' size='large' onClick={() => uploadClipboardImage()}>
              create new card from clipboard contents
            </ModalButton>,
          ]}
        >
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
            <p>Image pasted from clipboard:</p>
            <Image style={{ maxHeight: '60vh' }} src={clipboardImageURL} />
          </div>
        </Modal>
        <Modal
          centered
          visible={ocrModalVisible}
          onCancel={() => {
            setOcrModalVisible(false)
            setBatchOcrLimit(0)
            setDoneOcr(0)
          }}
          footer={[
            <ModalButton
              key='startOcr'
              onClick={() => {
                batchOcr()
                setOcrModalVisible(false)
              }}
            >
              Start OCR
            </ModalButton>,
          ]}
        >
          <p>Number of cards to OCR:</p>
          <InputNumber defaultValue={25} onChange={(value) => setBatchOcrLimit(value)} />
          <p>Delay between OCR: {avgOcrTime}</p>
        </Modal>
      </Wrapper>
    </>
  )
}

export default Japanese
