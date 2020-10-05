import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Typography, Spin, Table, Button, Tag } from 'antd'
import Layout from '../../../../components/layout'
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'
import Navigation from '../../../../components/state/navigation'
import { columns } from '../../../../components/state/history-table'
import { DateTime } from 'luxon'

const { Title } = Typography

const RowDiff = ({ item, field, previousRow }) => {
  const getPercentage = (current, prior) =>
    Math.round(((current - prior) / prior) * 100 * 10) / 10

  if (!previousRow || !previousRow[field] || item === previousRow[field]) {
    return <>{item.toLocaleString()}</>
  }
  if (item > previousRow[field]) {
    return (
      <>
        {item.toLocaleString()}{' '}
        <Tag className="diff" color="grey">
          <ArrowUpOutlined alt="" aria-label="Number is up from prior day" />
          {(item - previousRow[field]).toLocaleString()}{' '}
          {getPercentage(item, previousRow[field])}%
        </Tag>
      </>
    )
  }
  if (item < previousRow[field]) {
    return (
      <>
        {item.toLocaleString()}{' '}
        <Tag className="diff" color="#2db7f5">
          <ArrowDownOutlined
            alt=""
            aria-label="Number is down from prior day"
          />
          {(previousRow[field] - item).toLocaleString()}{' '}
          {getPercentage(item, previousRow[field])}%
        </Tag>
      </>
    )
  }
  return (
    <>
      {item.toLocaleString()}
      <strong>hw</strong>
    </>
  )
}

export default () => {
  const [stateInfo, setStateInfo] = useState(false)
  const [history, setHistory] = useState(false)
  const [production, setProduction] = useState(true)
  const [showDeltas, setShowDeltas] = useState(false)
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
      title: 'Published',
      dataIndex: 'batch__publishedAt',
      key: 'batch__publishedAt',
      width: 200,
      fixed: 'left',
      render: (date) => DateTime.fromRFC2822(date).toFormat('f'),
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
      title: 'Changed Fields',
      dataIndex: 'batch__changedFields',
      key: 'batch__changedFields',
      width: 200,
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
        const rows = result.map((row, index) => {
          row.key = index
          Object.keys(row.batch).forEach((key) => {
            row[`batch__${key}`] = row.batch[key]
          })
          return row
        })

        setHistory(
          rows.map((historyRow, index) => {
            const row = { ...historyRow }
            row.formattedDate = DateTime.fromISO(row.date).toFormat(
              'ccc LLL d yyyy',
            )
            Object.keys(row).forEach((key) => {
              if (typeof row[key] === 'number' && key.search('batch') === -1) {
                row[key] = (
                  <RowDiff
                    item={row[key]}
                    field={key}
                    previousRow={rows[index + 1]}
                  />
                )
              }
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
        <>
          <p>
            <Button
              onClick={(event) => {
                event.preventDefault()
                setShowDeltas(!showDeltas)
              }}
            >
              {showDeltas ? 'Hide daily changes' : 'Show daily changes'}
            </Button>
          </p>
          <div className={showDeltas ? 'show-diff' : ''}>
            <Table
              dataSource={history}
              columns={batchTableColumns}
              pagination={false}
              rowKey="batch__batchId"
              size="small"
              scroll={{ x: 2300, y: 900 }}
              expandable={{
                expandedRowRender: (record) => (
                  <div className="expanded-note">{record.batch__batchNote}</div>
                ),
                rowExpandable: (record) => record.batch__batchNote,
              }}
            />
          </div>
        </>
      ) : (
        <Spin />
      )}
    </Layout>
  )
}
