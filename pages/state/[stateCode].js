import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import {
  Typography,
  Button,
  Card,
  Spin,
  Space,
  Table,
  Col,
  Row,
  Tag,
  Statistic,
} from 'antd'
import { DateTime } from 'luxon'
import Layout from '../../components/layout'
import marked from 'marked'

const { Title } = Typography

const columns = [
  {
    title: 'Date',
    dataIndex: 'formattedDate',
    width: 100,
    fixed: 'left',
  },
  {
    title: 'Cases',
    dataIndex: 'positive',
  },
  {
    title: 'Tests',
    children: [
      {
        title: 'Negative',
        dataIndex: 'negative',
      },
      {
        title: 'Pending',
        dataIndex: 'pending',
      },
    ],
  },
  {
    title: 'Viral tests',
    children: [
      {
        title: 'Positive cases',
        dataIndex: 'positiveCasesViral',
      },
      {
        title: 'Positive tests',
        dataIndex: 'positiveTestsViral',
      },
      {
        title: 'Negative tests',
        dataIndex: 'negativeTestsViral',
      },
      {
        title: 'Total',
        dataIndex: 'totalTestsViral',
      },
    ],
  },
  {
    title: 'Hospitalized',
    children: [
      {
        title: 'Currently',
        dataIndex: 'hospitalizedCurrently',
      },
      {
        title: 'Cumulative',
        dataIndex: 'hospitalizedCumulative',
      },
    ],
  },
  {
    title: 'In ICU',
    children: [
      {
        title: 'Currently',
        dataIndex: 'inIcuCurrently',
      },
      {
        title: 'Cumulative',
        dataIndex: 'inIcuCumulative',
      },
    ],
  },
  {
    title: 'On Ventilator',
    children: [
      {
        title: 'Currently',
        dataIndex: 'onVentilatorCurrently',
      },
      {
        title: 'Cumulative',
        dataIndex: 'onVentilatorCumulative',
      },
    ],
  },
  {
    title: 'Outcomes',
    children: [
      {
        title: 'Recovered',
        dataIndex: 'recovered',
      },
      {
        title: 'Death',
        dataIndex: 'death',
      },
    ],
  },
].map((item) => {
  item.key = item.dataIndex
  return item
})

const History = ({ history, state }) => {
  const [tableData, setTableData] = useState(false)
  const [preview, setPreview] = useState(false)
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)

  const loadPreview = () => {
    fetch(`/api/state/preview?state=${state.toLowerCase()}`)
      .then((response) => response.json())
      .then((result) => {
        setPreview(result)
        setIsLoadingPreview(false)
        setTableData(
          history.map((historyRow) => {
            const row = { ...historyRow }
            row.formattedDate = DateTime.fromISO(row.date).toFormat(
              'ccc LLL d yyyy',
            )
            const previewRow = result
              .filter(
                (previewRow) =>
                  parseInt(previewRow.date, 10) === parseInt(row.date, 10),
              )
              .pop()

            if (previewRow) {
              row.formattedDate = (
                <>
                  {row.formattedDate}
                  <Tag>Batch {previewRow.batchId}</Tag>
                </>
              )
              Object.keys(previewRow).forEach((key) => {
                if (
                  typeof row[key] !== 'undefined' &&
                  typeof row[key] === 'number' &&
                  parseInt(row[key], 10) !== parseInt(previewRow[key], 10)
                ) {
                  row[key] = (
                    <>
                      {row[key].toLocaleString()}
                      <Tag color="volcano">
                        {previewRow[key].toLocaleString()}
                      </Tag>
                    </>
                  )
                  return
                }
                if (typeof row[key] === 'number') {
                  row[key] = row[key].toLocaleString()
                }
              })
            }
            return row
          }),
        )
      })
      .catch((e) => {
        console.log(e)
      })
  }

  useEffect(() => {
    setTableData(
      history.map((historyRow) => {
        const row = { ...historyRow }
        row.formattedDate = DateTime.fromISO(row.date).toFormat(
          'ccc LLL d yyyy',
        )
        Object.keys(row).forEach((key) => {
          if (typeof row[key] === 'number') {
            row[key] = row[key].toLocaleString()
          }
        })
        return row
      }),
    )
  }, [])

  return (
    <>
      <p>
        <Button
          onClick={(event) => {
            event.preventDefault()
            setIsLoadingPreview(true)
            loadPreview()
          }}
          loading={isLoadingPreview}
          disabled={preview !== false}
        >
          {preview ? 'Preview data loaded' : 'Load preview data'}
        </Button>
      </p>
      {tableData && (
        <Table
          dataSource={tableData}
          columns={columns}
          pagination={false}
          scroll={{ x: 2300, y: 900 }}
        />
      )}
    </>
  )
}

export default () => {
  const [stateInfo, setStateInfo] = useState(false)
  const [history, setHistory] = useState(false)
  const router = useRouter()
  const { stateCode } = router.query

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
      `https://covidtracking.com/api/v1/states/${stateCode.toLowerCase()}/daily.json`,
    )
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
          <Title>{stateInfo.name}</Title>
          <Row gutter={16}>
            <Col span={4}>
              {history !== false && (
                <Card>
                  <Statistic
                    title="Data quality grade"
                    value={history[0].dataQualityGrade}
                  />
                </Card>
              )}
            </Col>
            <Col span={20}>
              <Card style={{ marginBottom: '2rem' }}>
                {stateInfo.notes ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: marked(stateInfo.notes),
                    }}
                  />
                ) : (
                  <>No notes</>
                )}
              </Card>
            </Col>
          </Row>
        </>
      )}
      <Card title="History">
        {history ? (
          <History history={history} state={stateCode} />
        ) : (
          <Space size="middle">
            <Spin size="large" />
          </Space>
        )}
      </Card>
    </Layout>
  )
}
