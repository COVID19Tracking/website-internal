import { useState, useEffect } from 'react'
import { Card, Space, Spin, Row, Col, Statistic } from 'antd'
import { DateTime } from 'luxon'
import Layout from '../components/layout'

export default function Home() {
  const [history, setHistory] = useState(false)
  const [current, setCurrent] = useState(false)

  useEffect(() => {
    fetch('/api/us')
      .then((response) => response.json())
      .then((result) => {
        setHistory(result)
        setCurrent(result.sort((a, b) => (a.date < b.date ? 1 : -1)).shift())
      })
  }, [])
  return (
    <Layout title="Home">
      {current ? (
        <>
          <h1>
            Numbers as of{' '}
            {DateTime.fromISO(current.date).toFormat('LLLL dd yyyy')}
          </h1>
          <Row gutter={16}>
            <Col span={6}>
              <Card title="Testing">
                <Statistic title="Cases" value={current.positive} />
                <Statistic title="Negative" value={current.positive} />
                <Statistic title="Pending" value={current.Pending} />
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
                <Statistic title="Total" value={current.totalTestsViral} />
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
                <Statistic title="Currently" value={current.inIcuCurrently} />
                <Statistic title="Cumulative" value={current.inIcuCumulative} />
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
                <Statistic title="Recovered" value={current.recovered} />
                <Statistic title="Death" value={current.death} />
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
