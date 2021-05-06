import { useState, useEffect } from 'react'
import { Typography, Card, Spin, Space, Table } from 'antd'
import marked from 'marked'
import Layout from '../../components/layout'
const { Title } = Typography

const columns = [
  {
    title: 'Column name in sheet',
    dataIndex: 'x-sheetColumn',
    sorter: (a, b) => {
      if (typeof a['x-sheetColumn'] === 'undefined') {
        return -1
      }
      if (typeof b['x-sheetColumn'] === 'undefined') {
        return 1
      }
      return a['x-sheetColumn'] > b['x-sheetColumn'] ? 1 : -1
    },
  },
  {
    title: 'API field',
    dataIndex: 'apiField',
    sorter: (a, b) => (a.apiField > b.apiField ? 1 : -1),
  },
  {
    title: 'Website note',
    dataIndex: 'x-websiteLabel',
  },
  {
    title: 'Deprecated in API',
    dataIndex: 'x-deprecated',
    render: (text) => (text ? 'Yes' : 'No'),
    sorter: (a, b) => (a['x-deprecated'] && !b['x-deprecated'] ? 1 : -1),
  },
  {
    title: 'Note',
    dataIndex: 'description',
  },
  {
    title: 'Internal note',
    dataIndex: 'x-internalNote',
    render: (text) => {
      if (!text) {
        return null
      }
      return <div dangerouslySetInnerHTML={{ __html: marked(text) }} />
    },
  },
].map((item) => {
  item.key = item.dataIndex
  return item
})

const ApiFields = ({ openApi }) => {
  const { properties } = openApi.components.schemas.States
  const fields = []
  Object.keys(properties).forEach((fieldName) => {
    const property = properties[fieldName]
    fields.push({
      ...property,
      apiField: fieldName,
      ...property.metadata,
    })
  })
  return (
    <Table
      dataSource={fields.sort((a, b) => (a.apiField > b.apiField ? 1 : -1))}
      columns={columns}
      pagination={false}
    />
  )
}

export default () => {
  const [openApi, setOpenApi] = useState(false)

  useEffect(() => {
    fetch('/public-api/v1/openapi.json')
      .then((response) => response.json())
      .then((result) => {
        setOpenApi(result)
      })
  }, [])

  return (
    <Layout title="API fields">
      <Title>API fields</Title>
      <Card loading={!openApi}>
        {openApi && (
          <>
            <p>
              This table shows all the fields we display in our website or serve
              <a href="https://covidtracking.com/api">in our API</a> for state
              and US COVID data.{' '}
            </p>
            <ApiFields openApi={openApi} />
          </>
        )}
      </Card>
    </Layout>
  )
}
