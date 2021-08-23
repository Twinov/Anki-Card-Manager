import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Button, List } from 'antd'

import { APIENDPOINT } from '../constants'

const Wrapper = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const Japanese = () => {
  const [pendingCards, setPendingCards] = useState([])

  useEffect(() => {
    console.log(`${APIENDPOINT}/pending_card_names`)
    fetch(`${APIENDPOINT}/pending_card_names`)
      .then(response => response.json())
      .then(res => setPendingCards(res['cardNames']))
  }, [])

  return (
    <Wrapper>
      <List
        header={<p style={{ textAlign: 'center' }}>Pending Anki Cards</p>}
        bordered
        dataSource={pendingCards}
        renderItem={(item) => (
          <List.Item>
            {item}
          </List.Item>
        )}
      />
      <Button onClick={() => console.log(pendingCards)}>lol</Button>
    </Wrapper>
  )
}

export default Japanese
