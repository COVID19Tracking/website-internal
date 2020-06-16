import { useState, useEffect } from 'react'
import { Layout, Menu, Dropdown, Button } from 'antd'
import netlifyIdentity from 'netlify-identity-widget'
import { DownOutlined } from '@ant-design/icons'

import Link from 'next/link'
import states from '../_api/v1/states/info.json'

const { SubMenu } = Menu
const { Header, Footer, Sider, Content } = Layout

export default ({ title, children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    netlifyIdentity.init()
    const user = netlifyIdentity.currentUser()
    if (!user) {
      netlifyIdentity.open()
    } else {
      setIsLoggedIn(true)
    }
  }, [])

  return (
    <Layout>
      {isLoggedIn ? (
        <>
          <Sider>
            <div id="sidebar">
              <img src="/logo.svg" alt="Covid tracking project" />
              <Dropdown
                trigger={['click']}
                overlay={
                  <Menu>
                    <Menu.Item>
                      <Link href="/website/history">
                        <a>CTP website history</a>
                      </Link>
                    </Menu.Item>
                  </Menu>
                }
              >
                <Button>
                  More options <DownOutlined />
                </Button>
              </Dropdown>
              <h2>States</h2>
              <Menu>
                {states
                  .sort((a, b) => (a.name > b.name ? 1 : -1))
                  .map((state) => (
                    <Menu.Item key={state.state}>
                      <Link href={`/state/${state.state.toLowerCase()}`}>
                        <a>{state.name}</a>
                      </Link>
                    </Menu.Item>
                  ))}
              </Menu>
            </div>
          </Sider>
          <Layout>
            <Content
              className="site-layout-background"
              style={{
                padding: 24,
                margin: 0,
                minHeight: 280,
              }}
            >
              {children}
            </Content>
          </Layout>
        </>
      ) : (
        <></>
      )}
    </Layout>
  )
}
