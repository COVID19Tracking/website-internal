import { Layout, Menu, Dropdown, Button } from 'antd'
import { DownOutlined } from '@ant-design/icons'

import Link from 'next/link'
import states from '../_api/v1/states/info.json'

const { SubMenu } = Menu
const { Header, Footer, Sider, Content } = Layout

export default ({ title, children }) => (
  <Layout>
    <Sider id="sidebar">
      <img src="/logo.svg" alt="Covid tracking project" />
      <Dropdown
        trigger={['click']}
        overlay={
          <Menu>
            <Menu.Item>
              <Link href="website/snapshots">
                <a>CTP website snapshots</a>
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
  </Layout>
)
