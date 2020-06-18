import { useState, useEffect } from 'react'
import { Card, Space, Spin, Row, Col, Statistic } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'
import { DateTime } from 'luxon'
import Layout from '../components/layout'

export default function Home() {
  const [history, setHistory] = useState(false)
  const [preview, setPreview] = useState(false)
  const [current, setCurrent] = useState(false)
  const [previewCurrent, setPreviewCurrent] = useState(false)

  useEffect(() => {
    fetch('/api/us')
      .then((response) => response.json())
      .then((result) => {
        setHistory(result)
        setCurrent(result.sort((a, b) => (a.date < b.date ? 1 : -1)).shift())
      })
    fetch('/api/us?preview')
      .then((response) => response.json())
      .then((result) => {
        setPreview(result)
        setPreviewCurrent(
          result.sort((a, b) => (a.date < b.date ? 1 : -1)).shift(),
        )
      })
  }, [])

  const ComparisonStatistic = ({ title, field }) => {
    if (current[field] < previewCurrent[field] || field === 'positive') {
      return (
        <Statistic
          title={title}
          value={current[field]}
          prefix={<ArrowUpOutlined />}
          suffix={`Preview: ${previewCurrent[field].toLocaleString()}`}
        />
      )
    }
    if (current[field] > previewCurrent[field]) {
      return (
        <Statistic
          title={title}
          value={current[field]}
          prefix={<ArrowUpOutlined />}
          suffix={`Preview: ${previewCurrent[field].toLocaleString()}`}
        />
      )
    }
    return <Statistic title={title} value={current[field]} />
  }

  return (
    <Layout title="Home">
      {current ? (
        <>
          <h1>
            Numbers as of{' '}
            {DateTime.fromISO(current.date).toFormat('LLLL dd yyyy')}
          </h1>
          <p>Any changes in preview will appear below.</p>
          <Row gutter={16}>
            <Col span={6}>
              <Card title="Testing">
                <ComparisonStatistic title="Cases" field="positive" />
                <ComparisonStatistic title="Negative" field="negative" />
                <ComparisonStatistic title="Pending" field="pending" />
              </Card>
            </Col>
            <Col span={6}>
              <Card title="Viral tests">
                <Statistic
                  title="Positive cases"
                  value={current.positiveCasesViral}
                />
                <Statistic
                  title="Positive tests"
                  value={current.positiveTestsViral}
                />
                <Statistic
                  title="Negative tests"
                  value={current.negativeTestsViral}
                />
                <ComparisonStatistic title="Total" field="totalTestsViral" />
              </Card>
            </Col>
            <Col span={6}>
              <Card title="Hospitalizations">
                <Statistic
                  title="Currently"
                  value={current.hospitalizedCurrently}
                />
                <Statistic
                  title="Cumulative"
                  value={current.hospitalizedCumulative}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card title="In ICU">
                <ComparisonStatistic title="Currently" field="inIcuCurrently" />
                <ComparisonStatistic
                  title="Cumulative"
                  field="inIcuCumulative"
                />
              </Card>
            </Col>
          </Row>
          <Row gutter={16} style={{ marginTop: '2rem' }}>
            <Col span={6}>
              <Card title="On Ventilator">
                <Statistic
                  title="Currently"
                  value={current.onVentilatorCurrently}
                />
                <Statistic
                  title="Cumulative"
                  value={current.onVentilatorCumulative}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card title="Outcomes">
                <ComparisonStatistic title="Recovered" field="recovered" />
                <ComparisonStatistic title="Death" field="death" />
              </Card>
            </Col>
          </Row>
        </>
      ) : (
        <Space size="middle">
          <Spin size="large" />
        </Space>
      )}
    </Layout>
  )
}
