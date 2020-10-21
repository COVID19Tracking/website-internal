import { useState } from 'react'
import { Button, Modal, Table, Tag } from 'antd'
import { useRouter } from 'next/router'
import Link from 'next/link'
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  AlertOutlined,
} from '@ant-design/icons'
import { DateTime } from 'luxon'

const columns = [
  {
    title: 'Date',
    dataIndex: 'date',
    width: 150,
    fixed: 'left',
    hideInBatch: true,
    render: (date, record) => (
      <Link
        href={`/state/${record.state.toLowerCase()}/history/${record.date}`}
      >
        <a>{date}</a>
      </Link>
    ),
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
  { title: 'Positive', dataIndex: 'positive' },
  { title: 'Negative', dataIndex: 'negative' },
  { title: 'Pending', dataIndex: 'pending' },
  { title: 'Hospitalized – Currently', dataIndex: 'hospitalizedCurrently' },
  { title: 'Hospitalized – Cumulative', dataIndex: 'hospitalizedCumulative' },
  { title: 'In ICU – Currently', dataIndex: 'inIcuCurrently' },
  { title: 'In ICU – Cumulative', dataIndex: 'inIcuCumulative' },
  { title: 'On Ventilator – Currently', dataIndex: 'onVentilatorCurrently' },
  {
    title: 'On Ventilator – Cumulative',
    dataIndex: 'onVentilatorCumulative',
  },
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
    item.width = 150
  }
  return item
})

const RowDiff = ({ item, field, previousRow }) => {
  const getPercentage = (current, prior) =>
    Math.round(((current - prior) / prior) * 100 * 10) / 10
  if (!previousRow || item === previousRow[field]) {
    return <>{item.toLocaleString()}</>
  }
  if (item && !previousRow[field]) {
    return (
      <>
        {item.toLocaleString()}{' '}
        <Tag className="diff" color="#87d068">
          <AlertOutlined alt="" aria-label="Number is new" />
          New value
        </Tag>
      </>
    )
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
  return <>{item.toLocaleString()}</>
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

export default ({ history, screenshots, state, batchView }) => {
  const [showDeltas, setShowDeltas] = useState(false)
  const [activeBatch, setActiveBatch] = useState(false)
  const [batch, setBatch] = useState(false)
  const [stateBatch, setStateBatch] = useState(false)
  const [batchDate, setBatchDate] = useState(false)
  const router = useRouter()
  columns[1].render = (batchId, record) => (
    <a
      onClick={(event) => {
        event.preventDefault()
        setActiveBatch(batchId)
        setBatchDate(record.date)
        fetch(`/api/batch?batch=${batchId}`)
          .then((result) => result.json())
          .then((batch) => {
            setBatch(batch)
            setStateBatch(
              batch.coreData.find(
                (b) => b.state.toLowerCase() === state.toLowerCase(),
              ),
            )
          })
      }}
    >
      {batchId}
    </a>
  )

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
            size="small"
          />
          <Modal
            visible={activeBatch}
            onCancel={() => {
              setActiveBatch(false)
              setBatch(false)
            }}
            footer={[
              <Button
                key="back"
                onClick={(event) => {
                  router.push(
                    `/state/${state.toLowerCase()}/history/${batchDate}`,
                  )
                }}
              >
                View row history
              </Button>,
            ]}
          >
            {batch ? (
              <>
                <h2>Batch {batch.batchId}</h2>
                <p>
                  <strong>Published at:</strong> {batch.publishedAt}
                </p>
                <p>
                  <strong>User:</strong> {batch.user}
                </p>
                <p>
                  <strong>Shift lead:</strong> {batch.shiftLead}
                </p>
                {batch.changedDates && (
                  <p>
                    <strong>Changed dates:</strong> {batch.changedDates}
                  </p>
                )}
                {batch.changedFields && (
                  <p>
                    <strong>Changed fields:</strong> {batch.changedFields}
                  </p>
                )}
                {batch.link && (
                  <p>
                    <strong>Link:</strong>{' '}
                    <a href={batch.link} target="_blank">
                      Open
                    </a>
                  </p>
                )}
                <p>
                  <strong>Log category:</strong> {batch.logCategory}
                </p>
                <h3>Batch note</h3>
                <div>{batch.batchNote}</div>
              </>
            ) : (
              <p>Loading</p>
            )}
          </Modal>
        </div>
      )}
    </>
  )
}

export { columns }
