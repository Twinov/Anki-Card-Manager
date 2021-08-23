import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { Button, Space } from 'antd'

const Wrapper = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const Header = styled.h1`
  margin-top: 80px;
`

const Home = () => {
  return (
    <Wrapper>
      <Header>Welcome to Anki Card Manager!</Header>
      <Space direction='vertical'>
        <Link to='/chinese'>
          <Button type='primary' shape='round' size='large' style={{ width: '200px' }}>
            Chinese
          </Button>
        </Link>
        <Link to='/japanese'>
          <Button type='primary' shape='round' size='large' style={{ width: '200px' }}>
            Japanese
          </Button>
        </Link>
      </Space>
    </Wrapper>
  )
}

export default Home
