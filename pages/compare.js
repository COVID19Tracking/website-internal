import { useState, useEffect } from 'react'
import { DateTime } from 'luxon'
import { Table, Spin } from 'antd'
import Layout from '../components/layout'

const Compare = ({ preview, current }) => {
  const results = []
  const columns = [
    {
      title: 'Error',
      dataIndex: 'error',
      key: 'error',
      width: 150,
    },
  ]

  const dataSource = []
  current.forEach((row) => {
    const previewRow = preview.find(
      (p) =>
        p.state === row.state &&
        DateTime.fromISO(p.date).equals(DateTime.fromISO(row.date)),
    )
    if (!previewRow) {
      dataSource.push({
        error: 'Does not exist in preview',
        ...row,
      })
    } else {
      const unmatchedFields = []
      const fields = {}
      const merged = {}
      Object.keys(row).forEach((key) => {
        merged[key] = `${row[key]} - ${previewRow[key]}`
        if (key === 'date' || key === 'dateChecked' || key === 'lastUpdateEt') {
          return
        }
        if (
          !(row[key] === null && !previewRow[key]) &&
          row[key] !== previewRow[key] &&
          typeof previewRow[key] !== 'undefined'
        ) {
          unmatchedFields.push(key)
        }
      })
      if (unmatchedFields.length) {
        dataSource.push({
          error: unmatchedFields.join(', '),
          ...merged,
        })
      }
    }
  })
  Object.keys(current[0]).forEach((key) => {
    columns.push({
      title: key,
      dataIndex: key,
      key,
      width: 150,
    })
  })

  return (
    <>
      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        scroll={{ x: 2300, y: 900 }}
      />
    </>
  )
}

export default () => {
  const production = true
  const [current, setCurrent] = useState(false)
  const [preview, setPreview] = useState(false)

  useEffect(() => {
    fetch(`https://api.covidtracking.com/v1/states/daily.json`)
      .then((response) => response.json())
      .then((result) => {
        setCurrent(result)
      })
      .catch((e) => {
        console.log(e)
      })
    fetch(`/api-preview/states/daily`)
      .then((response) => response.json())
      .then((result) => {
        setPreview(result)
      })
      .catch((e) => {
        console.log(e)
      })
  }, [])

  return (
    <Layout title="Compare API">
      {preview && current ? (
        <Compare preview={preview} current={current} />
      ) : (
        <Spin />
      )}
    </Layout>
  )
}
