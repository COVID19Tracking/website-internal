import { useState, useEffect } from 'react'
import { Spin, Table } from 'antd'
import Layout from '../components/layout'

const columns = [
  'state',
  'date_used',
  'date',
  'timestamp',
  'fetch_timestamp',
  'positive',
  'positiveCasesViral',
  'probableCases',
  'death',
  'deathConfirmed',
  'deathProbable',
  'totalTestsPeople',
  'totalTestsAntibody',
  'positiveTestsAntibody',
  'negativeTestsAntibody',
  'totalTestsViral',
  'positiveTestsViral',
  'negativeTestsViral',
  'totalTestEncountersViral',
  'totalTestsAntigen',
  'positiveTestsAntigen',
  'negativeTestsAntigen',
]
export default function Home() {
  const [data, setData] = useState(false)

  useEffect(() => {
    fetch('/api/avocado')
      .then((response) => response.json())
      .then((result) => {
        setData(
          result.map((item) => {
            item.timestamp = item.timestamp.value
            item.fetch_timestamp = item.fetch_timestamp.value
            return item
          }),
        )
      })
  }, [])
  return (
    <Layout title="Home" margin>
      {data ? (
        <Table
          dataSource={data}
          columns={columns.map((column, index) => ({
            title: column,
            dataIndex: column,
            fixed: index < 3 ? 'left' : false,
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
