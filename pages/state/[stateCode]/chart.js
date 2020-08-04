import { useState, useEffect } from 'react'
import {
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ComposedChart,
  Bar,
  Line,
  ResponsiveContainer,
} from 'recharts'
import { useRouter } from 'next/router'
import { Card, Form, Button, Select, Checkbox } from 'antd'
import { DateTime } from 'luxon'
import Color from 'color'
import Layout from '../../../components/layout'
import Navigation from '../../../components/state/navigation'

const { Option } = Select

const chartableFields = [
  {
    name: 'Cases',
    field: 'positive',
    color: '#b5e3db',
  },
  {
    name: 'Cases: Daily',
    field: 'positiveIncrease',
    color: '#aa0000',
  },
  {
    name: 'Test: Negative',
    field: 'negative',
    color: '#cccc00',
  },
  {
    name: 'Test: Pending',
    field: 'pending',
    color: '#a19bca',
  },
  {
    name: 'Outcomes: Recovered',
    field: 'recovered',
    color: '#f4a071',
  },
  {
    name: 'Outcomes: Death',
    field: 'death',
    color: '#2f6488',
  },
  {
    name: 'Hospitalized: Currently',
    field: 'hospitalizedCurrently',
    color: '#527740',
  },
  {
    name: 'Hospitalized: Cumulative',
    field: 'hospitalizedCumulative',
    color: '#264a8c',
  },
  {
    name: 'In ICU: Currently',
    field: 'inIcuCurrently',
    color: '#5e4f24',
  },
  {
    name: 'In ICU: Cumulative',
    field: 'inIcuCumulative',
    color: '#4c5153',
  },
]

const Chart = ({ fields, history, preview, showPreview }) => {
  const data = []
  history.forEach((row, rowIndex) => {
    const item = {
      date: DateTime.fromISO(row.date).toFormat('ccc LLL d yyyy'),
    }
    fields.forEach(({ field, name }) => {
      item[name] = row[field]
      const pastRows = []
      let pastIndex = rowIndex
      while (pastIndex >= 0 && pastIndex >= rowIndex - 6) {
        pastRows.push(history[pastIndex][field])
        pastIndex -= 1
      }
      item[`${name} (7 day average)`] =
        pastRows.reduce((a, b) => a + b, 0) / pastRows.length
    })
    data.push(item)
  })

  return (
    <ResponsiveContainer width="100%" height={500}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        {fields.map(({ name, color }) => (
          <Bar dataKey={name} fill={color} />
        ))}
        {fields.map(({ name, color }) => (
          <Line
            dataKey={`${name} (7 day average)`}
            stroke={Color(color).darken(0.25)}
            dot={false}
            strokeWidth={3}
          />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  )
}

const FieldForm = ({ fields, setFields, setShowPreview }) => {
  const [selectedFields, setSelectedFields] = useState(fields)
  const [preview, setPreview] = useState(false)

  return (
    <Form
      layout="inline"
      style={{
        marginBottom: '1rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid grey',
      }}
    >
      <Select
        placeholder="Select fields"
        mode="multiple"
        style={{ width: '50%' }}
        onChange={(value) => {
          setSelectedFields(value)
        }}
      >
        {chartableFields.map((field, index) => (
          <Option value={index}>{field.name}</Option>
        ))}
      </Select>
      <Form.Item style={{ marginLeft: '2rem' }}>
        <Checkbox
          onChange={(event) => {
            setPreview(event.value)
          }}
        >
          Show preview data
        </Checkbox>
      </Form.Item>

      <Form.Item style={{ marginLeft: '2rem' }}>
        <Button
          onClick={(event) => {
            event.preventDefault()
            setFields(selectedFields.map((index) => chartableFields[index]))
            setShowPreview(preview)
          }}
        >
          Update chart
        </Button>
      </Form.Item>
    </Form>
  )
}

export default () => {
  const [stateInfo, setStateInfo] = useState(false)
  const [history, setHistory] = useState(false)
  const [previewHistory, setPreviewHistory] = useState(false)
  const [fields, setFields] = useState(
    chartableFields.filter((field) => field.field === 'positive'),
  )
  const [showPreview, setShowPreview] = useState(false)

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
    fetch(`/api/state?state=${stateCode.toLowerCase()}`)
      .then((response) => response.json())
      .then((result) => {
        setHistory(result.sort((a, b) => (a.date > b.date ? 1 : -1)))
      })
      .catch((e) => {
        console.log(e)
      })
    fetch(`/api/state?state=${stateCode.toLowerCase()}&preview=true`)
      .then((response) => response.json())
      .then((result) => {
        setPreviewHistory(result.sort((a, b) => (a.date > b.date ? 1 : -1)))
      })
      .catch((e) => {
        console.log(e)
      })
  }, [stateCode])

  return (
    <Layout title={stateInfo ? stateInfo.name : 'Loading...'}>
      {stateInfo && <Navigation stateInfo={stateInfo} />}
      <Card
        style={{ marginTop: '2rem' }}
        loading={!(history && previewHistory)}
      >
        {history && previewHistory && (
          <>
            <FieldForm
              fields={fields}
              setFields={(newFields) => setFields(newFields)}
              setShowPreview={(newShowPreview) =>
                setShowPreview(newShowPreview)
              }
            />
            <Chart
              fields={fields}
              history={history}
              preview={previewHistory}
              showPreview={showPreview}
            />
          </>
        )}
      </Card>
    </Layout>
  )
}
