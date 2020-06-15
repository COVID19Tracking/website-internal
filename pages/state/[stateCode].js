import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Typography, Card, Spin, Space, Table, Col, Row, Statistic } from 'antd'
import { DateTime } from 'luxon'
import Layout from '../../components/layout'
import marked from 'marked'
import openApi from '../../_api/v1/openapi.json'

const { Title } = Typography

const columns = [
  {
    title: 'Date',
    dataIndex: 'date',
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

const History = ({ history }) => (
  <Table
    dataSource={history.map((row) => {
      row.date = DateTime.fromISO(row.date).toFormat('ccc LLL d yyyy')
      Object.keys(row).forEach((field) => {
        if (typeof row[field] === 'number') {
          row[field] = row[field].toLocaleString()
        }
      })
      return row
    })}
    columns={columns}
    pagination={false}
    scroll={{ x: 2300 }}
  />
)

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
                <div
                  dangerouslySetInnerHTML={{ __html: marked(stateInfo.notes) }}
                />
              </Card>
            </Col>
          </Row>
        </>
      )}
      <Card title="History">
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
