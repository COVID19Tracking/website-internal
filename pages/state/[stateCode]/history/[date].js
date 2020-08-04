import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Typography, Spin, Table } from 'antd'
import Layout from '../../../../components/layout'
import Navigation from '../../../../components/state/navigation'
import { columns } from '../../../../components/state/history-table'

const { Title } = Typography

export default () => {
  const [stateInfo, setStateInfo] = useState(false)
  const [history, setHistory] = useState(false)
  const router = useRouter()
  const { stateCode, date } = router.query
  const tableColumns = columns.filter(
    (column) => column.title !== 'Screenshots',
  )
  tableColumns.unshift({
    title: 'Note',
    dataIndex: 'batch.batchNote',
  })

  useEffect(() => {
    if (!stateCode) {
      return
    }
    fetch(
      `https://covidtracking.com/api/v1/states/${stateCode.toLowerCase()}/info.json`,
    )
      .then((response) => response.json())
      .then((result) => {
        setStateInfo(result)
      })
      .catch((e) => {
        console.log(e)
      })

    fetch(`/api/history?state=${stateCode.toLowerCase()}&date=${date}`)
      .then((response) => response.json())
      .then((result) => {
        setHistory(result)
      })
      .catch((e) => {
        console.log(e)
      })
  }, [stateCode])

  return (
    <Layout title={stateInfo ? stateInfo.name : 'Loading...'}>
      {stateInfo !== false && (
        <>
          <Navigation stateInfo={stateInfo} />
        </>
      )}
      {history ? (
        <Table
          dataSource={history}
          columns={tableColumns}
          pagination={false}
          rowKey="date"
          scroll={{ x: 2300, y: 900 }}
        />
      ) : (
        <Spin />
      )}
    </Layout>
  )
}
