import { useState, useEffect, useRef } from 'react'
import { Card, Select, Form, Radio, DatePicker, Alert } from 'antd'
import * as filestack from 'filestack-js'
import moment from 'moment'
import states from '../_api/v1/states/info.json'
import Layout from '../components/layout'
import slugify from 'slugify'
import url from 'url'

const { Option } = Select

const coreDataTypes = [
  'Primary Source',
  'Data Dashboard',
  'Official COVID Website',
  'State Social Media',
  'Press Conferences',
  'GIS Query',
  'Other source',
]

export default function Screenshot() {
  const [state, setState] = useState(false)
  const [defaultState, setDefaultState] = useState(false)
  const [defaultDataType, setDefaultDataType] = useState(false)
  const [defaultCoreDataType, setDefaultCoreDataType] = useState(false)
  const [dataType, setDataType] = useState('taco')
  const [coreDataType, setCoreDataType] = useState('state-link')
  const [dateTime, setDateTime] = useState(moment())
  const [success, setSuccess] = useState(false)
  const filePickerRef = useRef(false)

  useEffect(() => {
    if (success) {
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    }
  }, [success])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    const address = url.parse(window.location.href, true)
    if (address.query.state) {
      setDefaultState(address.query.state)
      setState(address.query.state)
    }
    if (address.query.datatype) {
      setDefaultDataType(address.query.datatype)
      setDataType(address.query.datatype)
    }
    if (address.query.subtype) {
      setCoreDataType(address.query.subtype)
      setDefaultCoreDataType(address.query.subtype)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || !state) {
      return
    }
    const client = filestack.init('A1A13ZY4SSAm4lBR3j4X8z')
    const options = {
      displayMode: 'inline',
      container: '#filepicker',
      maxFiles: 1,
      fromSources: ['local_file_system'],
      uploadInBackground: false,
      disableStorageKey: true,
      onUploadDone() {
        setSuccess(true)
      },
      onFileSelected(file) {
        return {
          ...file,
          name: `${state}-${
            dataType === 'taco'
              ? `${coreDataType}-`
              : `${dataType.toLowerCase()}-`
          }${dateTime.format('YYYYMMDD-HHmmss')}.png`,
        }
      },
      storeTo: {
        location: 's3',
        path: `/state_screenshots/${state}/manual/`,
      },
    }
    if (filePickerRef.current) {
      filePickerRef.current = false
    }
    filePickerRef.current = client.picker(options)
    filePickerRef.current.open()
  }, [state, dateTime, dataType])

  return (
    <Layout title="Upload screenshot" margin>
      <Card title="Upload">
        <Form>
          <Form.Item label="Date and time" name="date">
            <DatePicker
              showTime
              onChange={(value) => {
                console.log(value)
                setDateTime(value)
              }}
              defaultValue={moment()}
            />
          </Form.Item>
          <Form.Item label="State" name="state">
            <Select
              showSearch
              onChange={(state) => setState(state)}
              defaultValue={defaultState}
              style={{ width: 300 }}
            >
              {states.map((state) => (
                <Option value={state.state} key={state.state}>
                  {state.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Data type" name="data-type">
            <Radio.Group
              value={dataType}
              onChange={(event) => setDataType(event.target.value)}
              defaultValue={defaultDataType}
            >
              <Radio value="taco">TACO</Radio>
              <Radio value="crdt">CRDT</Radio>
              <Radio value="ltc">LTC</Radio>
            </Radio.Group>
          </Form.Item>
          {dataType === 'taco' && (
            <Form.Item label="TACO data subtype" name="data-sub-type">
              <Radio.Group
                onChange={(event) => setCoreDataType(event.target.value)}
                defaultValue={defaultCoreDataType}
              >
                {coreDataTypes.map((type) => (
                  <Radio value={slugify(type, { lower: true })}>{type}</Radio>
                ))}
              </Radio.Group>
            </Form.Item>
          )}

          <Form.Item>
            {state && (
              <p>
                Filename:{' '}
                <code>
                  /state_screenshots/{state}/manual/{state}-
                  {dataType === 'taco' ? (
                    <>{coreDataType}-</>
                  ) : (
                    <>{dataType.toLowerCase()}-</>
                  )}
                  {dateTime.format('YYYYMMDD-HHmmss')}
                </code>
              </p>
            )}
            {success && <Alert type="success" message="Upload successful" />}
          </Form.Item>
          <Form.Item>
            <div id="filepicker" style={{ width: 500, height: 300 }} />
          </Form.Item>
        </Form>
      </Card>
    </Layout>
  )
}
