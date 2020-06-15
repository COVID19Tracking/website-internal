import { Layout, Menu } from 'antd'
import Link from 'next/link'
import states from '../_api/v1/states/info.json'

const { SubMenu } = Menu
const { Header, Footer, Sider, Content } = Layout

export default ({ title, children }) => (
  <Layout>
    <Sider id="sidebar">
      <img src="/logo.svg" alt="Covid tracking project" />
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
