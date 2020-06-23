import { Menu, Typography } from 'antd'
import Link from 'next/link'

const { Title } = Typography

export default ({ stateInfo }) => (
  <>
    <Title>{stateInfo.name}</Title>
    <Menu mode="horizontal">
      <Menu.Item>
        <Link
          href="/state/[stateCode]"
          as={`/state/${stateInfo.state.toLowerCase()}`}
        >
          <a>History</a>
        </Link>
      </Menu.Item>
      <Menu.Item>
        <Link
          href="/state/[stateCode]/chart"
          as={`/state/${stateInfo.state.toLowerCase()}/chart`}
        >
          <a>Chart</a>
        </Link>
      </Menu.Item>
    </Menu>
  </>
)
