import { useState, useEffect } from 'react'
import { Typography, Card, Spin, Space, Table } from 'antd'
import { DateTime } from 'luxon'
import Layout from '../../components/layout'
const { Title } = Typography

const columns = [
  {
    title: 'Date & time',
    dataIndex: 'time',
  },
  {
    title: 'Note',
    dataIndex: 'title',
  },
  {
    title: 'View site',
    dataIndex: 'url',
  },
].map((item) => {
  item.key = item.dataIndex
  return item
})

const History = ({ history }) => (
  <Table
    dataSource={history.map((item) => {
      item.url = (
        <a href={item.url} target="_blank">
          View
        </a>
      )
      item.time = DateTime.fromISO(item.time)
        .setZone('America/New_York')
        .toFormat('ccc LLL d yyyy h:mm a')
      return item
    })}
    columns={columns}
  />
)

export default () => {
  const [history, setHistory] = useState(false)

  useEffect(() => {
    fetch('/api/website/builds')
      .then((response) => response.json())
      .then((result) => {
        setHistory(result)
      })
  }, [])

  return (
    <Layout title="Website history">
      <Title>Website history</Title>
      <Card>
        {history ? (
          <History history={history} />
        ) : (
          <Space size="middle">
            <Spin size="large" />
          </Space>
        )}
      </Card>
    </Layout>
  )
}
