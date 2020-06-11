import { Layout, Menu } from "antd";
import Link from "next/link";

const { SubMenu } = Menu;
const { Header, Footer, Sider, Content } = Layout;

export default ({ title, children }) => (
  <Layout>
    <Sider>
      <Menu>
        <Menu.Item>Menu</Menu.Item>
        <Menu.Item>
          <Link href="/two">Two</Link>
        </Menu.Item>
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
);
