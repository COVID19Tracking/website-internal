import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Typography } from 'antd'
import Layout from '../../components/layout'

const { Title } = Typography

export default () => {
  const [stateInfo, setStateInfo] = useState(false)
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
  }, [stateCode])

  return (
    <Layout title={stateInfo ? stateInfo.name : 'Loading...'}>
      {stateInfo !== false && <Title>{stateInfo.name}</Title>}
    </Layout>
  )
}
