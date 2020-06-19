import { Fragment } from 'react'
import { useState, useEffect } from 'react'
import {
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  ResponsiveContainer,
} from 'recharts'
import { useRouter } from 'next/router'
import { Typography, Card, Form, Button, Select, Checkbox } from 'antd'
import { DateTime } from 'luxon'
import randomcolor from 'randomcolor'
import Layout from '../../../components/layout'
import Navigation from '../../../components/state/navigation'
import openApi from '../../../_api/v1/openapi.json'

const { Option } = Select
const { Title } = Typography

const Chart = ({ fields, history, preview, showPreview }) => {
  const data = []
  history.forEach((row) => {
    const item = {
      name: DateTime.fromISO(row.date).toFormat('ccc LLL d yyyy'),
    }
    fields.forEach((field) => {
      item[field] = row[field]
    })
    data.push(item)
  })

  return (
    <ResponsiveContainer width="100%" height={500}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        {fields.map((field) => (
          <Bar dataKey={field} fill={randomcolor()} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

const FieldForm = ({ fields, setFields, setShowPreview }) => {
  const [selectedFields, setSelectedFields] = useState(fields)
  const [preview, setPreview] = useState(false)
  const { properties } = openApi.components.schemas.States
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
        {Object.keys(properties).map((field) => (
          <Fragment key={field}>
            {properties[field].type === 'integer' && (
              <Option value={field}>{field}</Option>
            )}
          </Fragment>
        ))}
      </Select>
      <Form.Item style={{ marginLeft: '2rem' }}>
        <Checkbox
          onChange={(event) => {
            setPreview(event.value)
          }}
        >
          Show preview data"
        </Checkbox>
      </Form.Item>
      .
      <Form.Item style={{ marginLeft: '2rem' }}>
        <Button
          onClick={(event) => {
            event.preventDefault()
            setFields(selectedFields)
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
  const [fields, setFields] = useState(['positive'])
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
