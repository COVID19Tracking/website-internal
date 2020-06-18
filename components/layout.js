import { useState, useEffect } from 'react'
import { Layout, Menu, Dropdown, Button, Empty } from 'antd'
import { DownOutlined } from '@ant-design/icons'

import Link from 'next/link'
import states from '../_api/v1/states/info.json'

const { Sider, Content } = Layout

export default ({ title, children }) => {
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    if (
      typeof document !== 'undefined' &&
      document.cookie.search('covidUser') > -1
    ) {
      setLoggedIn(true)
    }
  }, [])

  return (
    <Layout>
      {loggedIn ? (
        <>
          <Sider>
            <div id="sidebar">
              <Link href="/">
                <a>
                  <img src="/logo.svg" alt="Covid tracking project" />
                </a>
              </Link>
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
        <div className="login-required">
          <a
            href={`https://slack.com/oauth/v2/authorize?team=covid-tracking&user_scope=identity.basic&client_id=975992389859.1202235470608&redirect_uri=${encodeURIComponent(
              process.env.authEndpoint,
            )}`}
          >
            Log in
          </a>
        </div>
      )}
    </Layout>
  )
}
