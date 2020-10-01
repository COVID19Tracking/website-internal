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
  const batchTableColumns = [
    {
      title: 'Batch ID',
      dataIndex: 'batch__batchId',
      width: 60,
      fixed: 'left',
    },
    {
      title: 'Note',
      dataIndex: 'batch__batchNote',
      key: 'batch__batchNote',
      width: 200,
      render: (note) => (note.length > 40 ? `${note.substr(0, 40)}...` : note),
    },
    {
      title: 'User',
      dataIndex: 'batch__user',
      key: 'batch__user',
      width: 90,
    },
    {
      title: 'Shift lead',
      dataIndex: 'batch__shiftLead',
      key: 'batch__shiftLead',
      width: 90,
    },
    {
      title: 'Batch link',
      dataIndex: 'batch__link',
      key: 'batch__link',
      width: 90,
      render: (note) =>
        note ? (
          <a
            href="https://github.com/COVID19Tracking/issues/issues/813"
            target="_blank"
          >
            Link
          </a>
        ) : (
          'none'
        ),
    },
    ...tableColumns.filter((item) => item.dataIndex !== 'date'),
  ]

  useEffect(() => {
    if (!stateCode) {
      return
    }
    fetch(
      `https://api.covidtracking.com/v1/states/${stateCode.toLowerCase()}/info.json`,
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
          result.map((row, index) => {
            row.key = index
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
        <h2
          style={{
            paddingLeft: 18,
          }}
        >
          {stateInfo.name} - {date}
        </h2>
      )}
      {history ? (
        <Table
          dataSource={history}
          columns={batchTableColumns}
          pagination={false}
          rowKey="batch__batchId"
          scroll={{ x: 2300, y: 900 }}
          expandable={{
            expandedRowRender: (record) => (
              <div className="expanded-note">{record.batch__batchNote}</div>
            ),
            rowExpandable: (record) => record.batch__batchNote,
          }}
        />
      ) : (
        <Spin />
      )}
    </Layout>
  )
}
