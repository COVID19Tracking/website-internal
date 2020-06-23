import { useState, useEffect } from 'react'
import { Typography, Card, Spin, Space, Table } from 'antd'
import { DateTime } from 'luxon'
import Layout from '../../components/layout'
const { Title } = Typography

const columns = [
  {
    title: 'Column name in sheet',
    dataIndex: 'x-sheetColumn',
  },
  {
    title: 'API field',
    dataIndex: 'apiField',
  },
  {
    title: 'Website note',
    dataIndex: 'x-websiteLabel',
  },
  {
    title: 'Deprecated in API',
    dataIndex: 'x-deprecated',
  },
  {
    title: 'Note',
    dataIndex: 'description',
  },
  {
    title: 'Internal note',
    dataIndex: 'x-internalNote',
  },
].map((item) => {
  item.key = item.dataIndex
  return item
})

const ApiFields = ({ openApi }) => {
  const { properties } = openApi.components.schemas.States
  const fields = []
  properties.forEach((property, fieldName) => {
    fields.push({
      ...property,
      apiField: fieldName,
      ...property.metadata,
    })
  })
  return <Table dataSource={fields} columns={columns} />
}

export default () => {
  const [openApi, setOpenApi] = useState(false)

  useEffect(() => {
    fetch('https://covidtracking.com/api/v1/openapi.json')
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
