import React, { useEffect, useState } from 'react'
import { Button } from 'antd'
import styled from 'styled-components'

import { APIENDPOINT } from '../constants'

const DrawInputWrapper = styled.div`
  z-index: 10;
  float: left;
  position: fixed;
  pointer-events: auto;
  left: 50px;
  bottom: 50px;
  width: 400px;
  height: 390px;
  border-radius: 20px;
  background: white;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23);
`

const DrawInputBottom = styled.div`
  height: 40px;
  width: 100%;
  padding: 0 5px;
  margin-top: -13px;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const Canvas = styled.canvas`
  position: relative;
  margin-left: 50px;
  margin-top: 5px;
  margin-bottom: 10px;
  width: 300px;
  height: 300px;
  border: 1px solid #c4c4c4;
  border-radius: 10px;
  cursor: crosshair;
`

const CanvasTitle = styled.h2`
  text-align: center;
  margin-top: 5px;
  margin-bottom: 0px;
`

const KanjiRecognition = () => {
  //  innitialize draw input
  const [canvas, setCanvas] = useState(null)
  // show returned options
  const [inputSuggestions, setInputSuggestions] = useState([])

  const [loading, setLoading] = useState(true)

  const inputOptions = {
    width: 300, //int, width of the writing area, default: undefined
    height: 300, //int, height of the writing area, default: undefined
    language: 'ja', //string, language of input trace, default: "zh_TW"
    numOfWords: 1, //int, number of words of input trace, default: undefined
    numOfReturn: 4, //int, number of maximum returned results, default: undefined
  }

  const inputCallback = (result, err) => {
    if (err) throw err
    else setInputSuggestions(result)
  }

  useEffect(() => {
    //@ts-ignore
    if (!loading) {
      const can1 = new window.handwriting.Canvas(document.getElementById('handInput'))
      setCanvas(can1)
    }
  }, [loading])

  const recognizeKanji = () => {
    canvas && canvas.recognize(canvas.trace, inputOptions, inputCallback)
  }

  const chooseInput = (e) => {
    const chosenInput = e?.currentTarget?.value
    navigator.clipboard.writeText(chosenInput)
    eraseKanji()
  }

  const eraseKanji = () => {
    canvas && canvas.erase()
    setInputSuggestions([])
  }

  useEffect(() => {
    const script = document.createElement('script')
    const body = document.getElementsByTagName('body')[0]
    script.src = `${APIENDPOINT}/static/handwriting.canvas.js`
    body.appendChild(script)
    script.onload = () => setLoading(false)
  }, [])

  return (
    !loading && (
      <DrawInputWrapper>
        <CanvasTitle>Kanji Search</CanvasTitle>
        <Canvas width={300} height={300} id={'handInput'} />
        <DrawInputBottom>
          <Button shape='round' onClick={recognizeKanji}>
            Search
          </Button>
          {inputSuggestions.map((suggestion) => (
            <Button shape='round' key={suggestion} value={suggestion} onClick={(e) => chooseInput(e)}>
              {suggestion}
            </Button>
          ))}
          <Button shape='round' onClick={eraseKanji}>
            Clear
          </Button>
        </DrawInputBottom>
      </DrawInputWrapper>
    )
  )
}

export default KanjiRecognition
