import { useState, useEffect } from 'react'
import { Button, Table, Tag, Spin, Card, Modal } from 'antd'
import Link from 'next/link'
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'
import { DateTime } from 'luxon'

const columns = [
  {
    title: 'Date',
    dataIndex: 'formattedDate',
    width: 100,
    fixed: 'left',
    hideInBatch: true,
  },
  {
    title: 'Batch',
    dataIndex: 'batchId',
    hideInBatch: true,
    width: 80,
    render: (batchId, record) => (
      <Link
        href={`/state/${record.state.toLowerCase()}/history/${record.date}`}
      >
        <a>{batchId}</a>
      </Link>
    ),
  },
  {
    title: 'API links',
    dataIndex: '_api',
    hideInBatch: true,
  },
  { title: 'Positive', dataIndex: 'positive' },
  { title: 'Negative', dataIndex: 'negative' },
  { title: 'Pending', dataIndex: 'pending' },
  { title: 'Hospitalized – Currently', dataIndex: 'hospitalizedCurrently' },
  { title: 'Hospitalized – Cumulative', dataIndex: 'hospitalizedCumulative' },
  { title: 'In ICU – Currently', dataIndex: 'inIcuCurrently' },
  { title: 'In ICU – Cumulative', dataIndex: 'inIcuCumulative' },
  { title: 'On Ventilator – Currently', dataIndex: 'onVentilatorCurrently' },
  { title: 'On Ventilator – Cumulative', dataIndex: 'onVentilatorCumulative' },
  { title: 'Recovered', dataIndex: 'recovered' },
  { title: 'Deaths', dataIndex: 'death' },
  { title: 'Data Quality Grade', dataIndex: 'dataQualityGrade' },
  { title: 'Last Update ET', dataIndex: 'lastUpdateIsoUtc' },
  { title: 'Total Antibody Tests', dataIndex: 'totalTestsAntibody' },
  { title: 'Positive Antibody Tests', dataIndex: 'positiveTestsAntibody' },
  { title: 'Negative Antibody Tests', dataIndex: 'negativeTestsAntibody' },
  { title: 'Total Tests (PCR)', dataIndex: 'totalTestsViral' },
  { title: 'Positive Tests (PCR)', dataIndex: 'positiveTestsViral' },
  { title: 'Negative Tests (PCR)', dataIndex: 'negativeTestsViral' },
  { title: 'Positive Cases (PCR)', dataIndex: 'positiveCasesViral' },
  { title: 'Deaths (confirmed)', dataIndex: 'deathConfirmed' },
  { title: 'Deaths (probable)', dataIndex: 'deathProbable' },
  { title: 'Total PCR Tests (People)', dataIndex: 'totalTestsPeopleViral' },
  { title: 'Total Test Results', dataIndex: 'totalTestResults' },
  { title: 'Probable Cases', dataIndex: 'probableCases' },
  {
    title: 'Total Test Encounters (PCR)',
    dataIndex: 'totalTestEncountersViral',
  },
  {
    title: 'Total Antibody Tests (People)',
    dataIndex: 'totalTestsPeopleAntibody',
  },
  {
    title: 'Positive Antibody Tests (People)',
    dataIndex: 'positiveTestsPeopleAntibody',
  },
  {
    title: 'Negative Antibody Tests (People)',
    dataIndex: 'negativeTestsPeopleAntibody',
  },
  {
    title: 'Total Antigen Tests (People)',
    dataIndex: 'totalTestsPeopleAntigen',
  },
  {
    title: 'Positive Antigen Tests (People)',
    dataIndex: 'positiveTestsPeopleAntigen',
  },
  {
    title: 'Negative Antigen Tests (People)',
    dataIndex: 'negativeTestsPeopleAntigen',
  },
  { title: 'Total Antigen Tests', dataIndex: 'totalTestsAntigen' },
  { title: 'Positive Antigen Tests', dataIndex: 'positiveTestsAntigen' },
  { title: 'Negative Antigen Tests', dataIndex: 'negativeTestsAntigen' },
].map((item) => {
  item.key = item.dataIndex
  if (!item.width) {
    item.width = 80
  }
  return item
})

const RowDiff = ({ item, field, previousRow }) => {
  const getPercentage = (current, prior) =>
    Math.round(((current - prior) / prior) * 100 * 10) / 10

  if (!previousRow || !previousRow[field] || item === previousRow[field]) {
    return <>{item.toLocaleString()}</>
  }
  if (item > previousRow[field]) {
    return (
      <>
        {item.toLocaleString()}{' '}
        <Tag className="diff" color="grey">
          <ArrowUpOutlined alt="" aria-label="Number is up from prior day" />
          {(item - previousRow[field]).toLocaleString()}{' '}
          {getPercentage(item, previousRow[field])}%
        </Tag>
      </>
    )
  }
  if (item < previousRow[field]) {
    return (
      <>
        {item.toLocaleString()}{' '}
        <Tag className="diff" color="#2db7f5">
          <ArrowDownOutlined
            alt=""
            aria-label="Number is down from prior day"
          />
          {(previousRow[field] - item).toLocaleString()}{' '}
          {getPercentage(item, previousRow[field])}%
        </Tag>
      </>
    )
  }
  return (
    <>
      {item.toLocaleString()}
      <strong>hw</strong>
    </>
  )
}

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
      href={`https://api.covidtracking.com/v1/states/${state.toLowerCase()}/${date}.json`}
    >
      JSON
    </a>{' '}
    |
    <a
      href={`https://api.covidtracking.com/v1/states/${state.toLowerCase()}/${date}.csv`}
    >
      CSV
    </a>
  </>
)

export default ({ history, screenshots, state }) => {
  const [showDeltas, setShowDeltas] = useState(false)

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

  const tableData = history.map((historyRow, index) => {
    const row = { ...historyRow }
    addColumns(row)
    row.formattedDate = DateTime.fromISO(row.date).toFormat('ccc LLL d yyyy')
    Object.keys(row).forEach((key) => {
      if (typeof row[key] === 'number' && key !== 'date' && key !== 'batchId') {
        row[key] = (
          <RowDiff
            item={row[key]}
            field={key}
            previousRow={history[index + 1]}
          />
        )
      }
    })
    return row
  })

  return (
    <>
      <p>
        <Button
          onClick={(event) => {
            event.preventDefault()
            setShowDeltas(!showDeltas)
          }}
        >
          {showDeltas ? 'Hide daily changes' : 'Show daily changes'}
        </Button>
      </p>
      {tableData && (
        <div className={showDeltas ? 'show-diff' : ''}>
          <Table
            dataSource={tableData}
            columns={columns}
            pagination={false}
            rowKey="date"
            scroll={{ x: 2300, y: 900 }}
          />
        </div>
      )}
    </>
  )
}

export { columns }
