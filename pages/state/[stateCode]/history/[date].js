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
  const [production, setProduction] = useState(true)
  const router = useRouter()
  const { stateCode, date } = router.query
  const tableColumns = columns.filter((column) => !column.hideInBatch)
  tableColumns.unshift({
    title: 'Note',
    dataIndex: 'batch__batchNote',
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

    fetch(
      `/api/history?state=${stateCode.toLowerCase()}&date=${date}&production=${production}`,
    )
      .then((response) => response.json())
      .then((result) => {
        setHistory(
          result.map((row) => {
            Object.keys(row.batch).forEach((key) => {
              row[`batch__${key}`] = row.batch[key]
            })
            return row
          }),
        )
      })
      .catch((e) => {
        console.log(e)
      })
  }, [stateCode, production])

  return (
    <Layout
      title={stateInfo ? stateInfo.name : 'Loading...'}
      production={production}
      setProduction={(newProduction) => setProduction(newProduction)}
    >
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
