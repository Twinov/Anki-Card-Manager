import React from 'react'
import styled from 'styled-components'
import { Button } from 'antd'

const Wrapper = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const Chinese = () => {
  return (
    <Wrapper>
      <Button type='primary' shape='round' size='large' style={{ width: '300px', marginTop: '100px' }}>
        Add sentences to all cards
      </Button>
    </Wrapper>
  )
}

export default Chinese
