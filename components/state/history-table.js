import { useState, useEffect } from 'react'
import { Button, Table, Tag } from 'antd'
import { DateTime } from 'luxon'

const columns = [
  {
    title: 'Date',
    dataIndex: 'formattedDate',
    width: 100,
    fixed: 'left',
  },
  {
    title: 'Batch',
    dataIndex: 'batchId',
    width: 80,
  },
  {
    title: 'Screenshots',
    children: [
      { title: 'Primary', dataIndex: '_screenshotsPrimary', width: 150 },
      { title: 'Secondary', dataIndex: '_screenshotsSecondary', width: 150 },
      { title: 'Tertiary', dataIndex: '_screenshotsTertiary', width: 150 },
    ],
  },
  {
    title: 'API links',
    dataIndex: '_api',
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

const Screenshots = ({ screenshots }) => {
  if (!screenshots) {
    return null
  }
  return (
    <ul className="screenshots">
      {screenshots.map((shot) => (
        <li key={shot.url}>
          <a href={shot.url} target="_blank">
            {DateTime.fromISO(shot.dateChecked)
              .setZone('America/New_York')
              .toFormat('h:mm a')}
          </a>
        </li>
      ))}
    </ul>
  )
}

const APIpreview = ({ date, state }) => (
  <>
    <a
      href={`https://covidtracking.com/api/v1/states/${state.toLowerCase()}/${date}.json`}
    >
      JSON
    </a>{' '}
    |
    <a
      href={`https://covidtracking.com/api/v1/states/${state.toLowerCase()}/${date}.csv`}
    >
      CSV
    </a>
  </>
)

export default ({ history, screenshots, state }) => {
  const [tableData, setTableData] = useState(false)
  const [preview, setPreview] = useState(false)
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)
  const [changedRows, setChangedRows] = useState([])

  const addColumns = (row) => {
    row._screenshotsPrimary = (
      <Screenshots
        screenshots={screenshots.filter(
          (screenshot) =>
            !screenshot.secondary &&
            !screenshot.tertiary &&
            parseInt(screenshot.date, 10) === parseInt(row.date, 10),
        )}
      />
    )
    row._screenshotsSecondary = (
      <Screenshots
        screenshots={screenshots.filter(
          (screenshot) =>
            screenshot.secondary &&
            parseInt(screenshot.date, 10) === parseInt(row.date, 10),
        )}
      />
    )
    row._screenshotsTertiary = (
      <Screenshots
        screenshots={screenshots.filter(
          (screenshot) =>
            screenshot.tertiary &&
            parseInt(screenshot.date, 10) === parseInt(row.date, 10),
        )}
      />
    )
    row._api = <APIpreview date={row.date} state={row.state} />
  }

  const loadPreview = () => {
    fetch(`/api/state?state=${state.toLowerCase()}&preview=true`)
      .then((response) => response.json())
      .then((result) => {
        setPreview(result)
        setIsLoadingPreview(false)
        setTableData(
          history.map((historyRow) => {
            const row = { ...historyRow }
            addColumns(row)
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
              Object.keys(previewRow).forEach((key) => {
                if (
                  typeof row[key] !== 'undefined' &&
                  typeof row[key] === 'number' &&
                  parseInt(row[key], 10) !== parseInt(previewRow[key], 10)
                ) {
                  if (changedRows.indexOf(row.date) > -1) {
                    changedRows.push(row.date)
                  }
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
              })
            }
            Object.keys(row).forEach((key) => {
              if (typeof row[key] === 'number' && key !== 'date') {
                row[key] = row[key].toLocaleString()
              }
            })
            return row
          }),
        )
        setChangedRows(changedRows)
      })
      .catch((e) => {
        console.log(e)
      })
  }

  useEffect(() => {
    setTableData(
      history.map((historyRow) => {
        const row = { ...historyRow }
        addColumns(row)
        row.formattedDate = DateTime.fromISO(row.date).toFormat(
          'ccc LLL d yyyy',
        )
        Object.keys(row).forEach((key) => {
          if (typeof row[key] === 'number' && key !== 'date') {
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
        {changedRows.length > 0 && (
          <>There are {changedRows.length} rows with changes.</>
        )}
      </p>
      {tableData && (
        <Table
          dataSource={tableData}
          columns={columns}
          pagination={false}
          rowKey="date"
          scroll={{ x: 2300, y: 900 }}
        />
      )}
    </>
  )
}
