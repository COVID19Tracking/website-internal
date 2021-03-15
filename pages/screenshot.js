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
  let qsState = false
  let qsDataType = 'state_screenshots'
  let qsSubType = false

  if (typeof window !== 'undefined') {
    const address = url.parse(window.location.href, true)
    if (address.query.state) {
      qsState = address.query.state
    }
    if (address.query.datatype) {
      qsDataType = address.query.datatype
    }
    if (address.query.subtype) {
      qsSubType = address.query.subtype
    }
  }

  const [state, setState] = useState(qsState)
  const [defaultState] = useState(qsState)
  const [defaultDataType] = useState(qsDataType)
  const [defaultCoreDataType] = useState(qsSubType)
  const [dataType, setDataType] = useState(qsDataType)
  const [coreDataType, setCoreDataType] = useState(qsSubType)
  const [dateTime, setDateTime] = useState(moment())
  const [success, setSuccess] = useState(false)
  const filePickerRef = useRef(false)
  const client = filestack.init('A1A13ZY4SSAm4lBR3j4X8z')

  useEffect(() => {
    if (success) {
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    }
  }, [success])

  const onFileSelected = (file) => {
    const suffix = file.originalFile.name.split('.').pop()
    return {
      ...file,
      name: `${state}-${
        dataType === 'state_screenshots' ? `${coreDataType}-` : `${dataType.toLowerCase()}-`
      }${dateTime.format('YYYYMMDD-HHmmss')}.${suffix}`,
    }
  }

  useEffect(() => {
    if (filePickerRef.current) {
      filePickerRef.current.close()
    }
    const options = {
      displayMode: 'inline',
      container: '#filepicker',
      maxFiles: 1,
      fromSources: ['local_file_system'],
      uploadInBackground: false,
      disableStorageKey: true,
      onUploadDone(result) {
        console.log(result)
        setSuccess(true)
        fetch('/api/screenshot-notify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            screenshot: `https://covid-tracking-project-data.s3.amazonaws.com/${result.filesUploaded[0].key}`,
            state,
            dataType,
            coreDataType,
            dateTime,
          }),
        })
      },
      onFileSelected: (file) => {
        return onFileSelected(file)
      },
      storeTo: {
        location: 's3',
        path: `/${dataType}/${state}/manual/`,
      },
    }
    filePickerRef.current = client.picker(options)
    filePickerRef.current.open()
  }, [state, dateTime, dataType, coreDataType])

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
              <Radio value="state_screenshots">TACO</Radio>
              <Radio value="CRDT">CRDT</Radio>
              <Radio value="LTC">LTC</Radio>
              <Radio value="vaccine">Vaccine</Radio>
            </Radio.Group>
          </Form.Item>
          {dataType === 'state_screenshots' && (
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
                  /{dataType}/{state}/manual/{state}-
                  {dataType === 'state_screenshots' ? (
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
