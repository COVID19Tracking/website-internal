import { useState, useEffect } from 'react'
import { Spin, Table } from 'antd'
import Layout from '../components/layout'

export default function Home() {
  const [data, setData] = useState(false)

  useEffect(() => {
    fetch('/api/avocado')
      .then((response) => response.json())
      .then((result) => {
        setData(result)
      })
  }, [])
  return (
    <Layout title="Home" margin>
      {data ? (
        <Table
          dataSource={data}
          columns={Object.keys(data[0]).map((key, index) => ({
            title: key,
            dataIndex: key,
            fixed: index < 2 ? 'left' : false,
          }))}
          pagination={false}
          style={{
            maxHeight: '90vh',
          }}
          rowKey="date"
          scroll={{ x: 2300, y: '80vh' }}
          size="small"
        />
      ) : (
        <Spin />
      )}
    </Layout>
  )
}
