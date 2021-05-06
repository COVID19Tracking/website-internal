import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Typography, Card, Col, Row } from 'antd'
import Layout from '../../components/layout'
import Navigation from '../../components/state/navigation'
import HistoryTable from '../../components/state/history-table'
import marked from 'marked'

const { Title } = Typography

export default () => {
  const [stateInfo, setStateInfo] = useState(false)
  const [history, setHistory] = useState(false)
  const [screenshots, setScreenshots] = useState(false)
  const [production, setProduction] = useState(true)
  const router = useRouter()
  const { stateCode } = router.query

  useEffect(() => {
    if (!stateCode) {
      return
    }
    fetch(`/public-api/v1/states/${stateCode.toLowerCase()}/info.json`)
      .then((response) => response.json())
      .then((result) => {
        setStateInfo(result)
      })
      .catch((e) => {
        console.log(e)
      })
    fetch(
      `/api/state?state=${stateCode.toLowerCase()}&production=${production}`,
    )
      .then((response) => response.json())
      .then((result) => {
        setHistory(result)
      })
      .catch((e) => {
        console.log(e)
      })
    fetch(`/public-api/v1/states/${stateCode.toLowerCase()}/screenshots.json`)
      .then((response) => response.json())
      .then((result) => {
        setScreenshots(result)
      })
      .catch((e) => {
        console.log(e)
      })
  }, [stateCode, production])

  return (
    <Layout
      title={stateInfo ? stateInfo.name : 'Loading...'}
      production={production}
      setProduction={(newProduction) => setProduction(newProduction)}
    >
      {stateInfo !== false && (
        <>
          <h2
            style={{
              paddingLeft: 18,
            }}
          >
            {stateInfo.name}
          </h2>
          {history && screenshots && (
            <HistoryTable
              history={history}
              screenshots={screenshots}
              state={stateCode}
            />
          )}
        </>
      )}
    </Layout>
  )
}
