import { useState, useEffect } from 'react'
import { Layout, Menu, Switch } from 'antd'
import Head from 'next/head'
import { LeftOutlined, MenuOutlined } from '@ant-design/icons'
import Link from 'next/link'
import states from '../_api/v1/states/info.json'

const { Sider, Content } = Layout

export default ({ title, margin, children, production, setProduction }) => {
  const [loggedIn, setLoggedIn] = useState(false)
  const [hideSidebar, setHideSidebar] = useState(false)

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
      <Head>
        <title>{title}</title>
      </Head>
      {loggedIn ? (
        <>
          {hideSidebar ? (
            <button
              className="sidebar-hide-button"
              aria-label="Show menu"
              onClick={(event) => {
                event.preventDefault()
                setHideSidebar(false)
              }}
            >
              <MenuOutlined />
            </button>
          ) : (
            <Sider>
              <div id="sidebar">
                <Menu>
                  <Menu.Item>
                    <button
                      className="close-menu"
                      onClick={(event) => {
                        event.preventDefault()
                        setHideSidebar(true)
                      }}
                    >
                      <LeftOutlined /> Close menu
                    </button>
                  </Menu.Item>
                  <Menu.Item>
                    <Link href="/website/history">
                      <a>CTP website history</a>
                    </Link>
                  </Menu.Item>
                  <Menu.Item>
                    <Link href="/website/api-fields">
                      <a>API fields</a>
                    </Link>
                  </Menu.Item>
                  <Menu.Item>
                    <Link href="/">
                      <a>US overview</a>
                    </Link>
                  </Menu.Item>
                  <Menu.Item>
                    <Link href="/avocado">
                      <a>Avocado</a>
                    </Link>
                  </Menu.Item>
                  <Menu.Item>
                    <Switch
                      defaultChecked
                      style={{ marginLeft: 0, marginRight: '1rem' }}
                      onChange={() => {
                        setProduction(!production)
                      }}
                    />
                    {production ? <>Production</> : <>Staging</>}
                  </Menu.Item>
                  <Menu.Divider />
                  {states
                    .sort((a, b) => (a.name > b.name ? 1 : -1))
                    .map((state) => (
                      <Menu.Item key={state.state}>
                        <Link
                          href="/state/[stateCode]"
                          as={`/state/${state.state.toLowerCase()}`}
                        >
                          <a>{state.name}</a>
                        </Link>
                      </Menu.Item>
                    ))}
                </Menu>
              </div>
            </Sider>
          )}
          <Layout>
            <Content
              className="site-layout-background"
              style={{
                padding: 0,
                margin: margin ? '2rem' : 0,
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
