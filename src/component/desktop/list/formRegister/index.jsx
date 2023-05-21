// eslint-disable-next-line no-unused-vars
import React, {useEffect, useMemo, useState} from 'react';
import {Button, Col, DatePicker, Form, Row, Select, TimePicker} from 'antd';
import {SaveOutlined} from '@ant-design/icons';
import dayjs from 'dayjs';
import {fetchAllRecordsCustomer} from '../../../../utils/common';
import MainLayout from '../../../layout/main';
import {addRecord, updateRecord} from '../../../../api/list';

import styles from './styles.module.css';
import CardComponent from '../../common/card/CardComponent';
import Detail from '../../detail';
import Cookie from 'js-cookie';

const idStaffApp = '6';

const FORMAT_DATE_TIME = 'YYYY/MM/DD';
const FORMAT_TIME = 'HH:mm';

const idApp = kintone.app.getId() || kintone.mobile.app.getId();

const paramsURL = new URLSearchParams(location.search);

const userISK = Cookie.get('nameUserLoginTest');
const staffIdLogin = Cookie.get('staffIdLoginTest');

export default function FormRegister({
  type,
  event,
  isAdmin,
  isMobile
}) {

  const [form] = Form.useForm();
  const [staff, setStaff] = useState([]);

  const renderModalContentDetail = (data) => {
    return (
      <Row gutter={50} className={styles.formItem}>
        {data.map((el, index2) => (
          <Col className="gutter-row" span={24} key={`${el?.formItemProps?.name}-${index2}`}>
            <Form.Item {...el.formItemProps}>
              {el.renderInput()}
            </Form.Item>
          </Col>
        ))}
      </Row>
    );
  };

  const onFinish = (payload) => {
    const staffInfo = JSON.parse(payload.staff);
    let body = {
      'app': idApp,
      // 'id': event.record.$id.value,
      'record': {
        'date': {
          'value': dayjs(payload.date).format(FORMAT_DATE_TIME)
        },
        'staff': {
          'value': staffInfo.name
        },
        'id_staff': {
          'value': staffInfo.id
        },
        'time_in': {
          'value': payload.time_in ? dayjs(payload.time_in).format(FORMAT_TIME) : ''
        },
        'time_out': {
          'value': payload.time_out ? dayjs(payload.time_out).format(FORMAT_TIME) : ''
        },
        'user_update': {
          'value' : userISK
        }
      }
    };

    if (type === 'edit') {
      body.id = event.record.$id.value;
      updateRecord(body, () => {
        window.location.href = window.location.origin + `/k/${idApp}/?day=${dayjs(payload.date).format(FORMAT_DATE_TIME)}`;
      });
    } else {
      addRecord(body, () => {
        window.location.href = `${window.location.origin}/k/${idApp}/?day=${dayjs(payload.date).format(FORMAT_DATE_TIME)}`;
      });
    }
  };

  const renderModalContent = () => {
    const registerEdit = [
      {
        formItemProps: {
          label: '日付',
          name: 'date',
          labelAlign: 'left',
          rules: [{
            required: true,
            message: 'Required'
          }]
        },
        renderInput: () =>
          <DatePicker
            format="YYYY/MM/DD"
            placeholder={''}
          />,
      },
      {
        formItemProps: {
          label: '従業員名',
          name: 'staff',
          labelAlign: 'left',
          rules: [{
            required: true,
            message: 'Required'
          }]
        },
        renderInput: () => <Select
          style={{width: 250}}
          options={staff}
          showSearch
          disabled={!isAdmin}
        />,
      },
      {
        formItemProps: {
          label: '出勤時間',
          name: 'time_in',
          labelAlign: 'left',
          // rules: [{
          //   required: true,
          //   message: 'Required'
          // }]
        },
        renderInput: () => <TimePicker format={'HH:mm'} placeholder={''}/>,
      },
      {
        formItemProps: {
          label: '退勤時間',
          name: 'time_out',
          labelAlign: 'left',
        },
        renderInput: () => <TimePicker format={'HH:mm'} placeholder={''}/>,
      },
    ];

    return (
      <div className={styles.formRegister}>
        <Form form={form} autoComplete="off" onFinish={onFinish} scrollToFirstError>
          {renderModalContentDetail(registerEdit)}
          <Form.Item>
            <Button type="primary" htmlType="submit">
              <SaveOutlined/>{type === 'edit' ? '保存' : '登録'}
            </Button>
          </Form.Item>
        </Form>
      </div>
    );
  };

  useEffect(() => {
    fetchAllRecordsCustomer(idStaffApp).then(function(records) {
      const data = records.map((val) => ({
        value: JSON.stringify({
          name: val.name.value,
          id: val.$id.value
        }),
        label: val.name.value
      }));
      setStaff(data);
    });
  }, []);

  useEffect(() => {
    form.setFieldsValue({
      date: dayjs(),
    });
    if (type === 'edit') {
      const data = event.record;
      console.log(event)
      form.setFieldsValue({
        date: data?.date.value && dayjs(data?.date?.value),
        time_in: data?.time_in.value && dayjs(data?.time_in?.value, FORMAT_TIME),
        time_out: data?.time_out.value && dayjs(data?.time_out?.value, FORMAT_TIME),
        staff: data.staff.value && JSON.stringify({
          name: data.staff.value,
          id: data.id_staff.value
        })
      });
      ;
    }
  }, [event, type]);

  useEffect(() => {
    if(!isAdmin) {
      if(type === 'edit') {
        if(staffIdLogin !== event.record.id_staff.value)
          window.location.href = `${window.location.origin}/k${isMobile ? '/m' : ''}/${idApp}`
      }
      else {
        // if(paramsURL.get('idStaff') !== staffIdLogin || paramsURL.get('idViewHistory') !== staffIdLogin || checkHash.idViewHistory !== staffIdLogin)
        //   window.location.href = `${window.location.origin}/k${isMobile ? '/m' : ''}/${idApp}`
      }

    }
  }, [event, type, isAdmin, staffIdLogin, checkHash, paramsURL])

  console.log(event)

  useEffect(() => {
    if (paramsURL.get('idStaff') && paramsURL.get('nameStaff')) {
      form.setFieldsValue({
        staff: JSON.stringify({
          name: paramsURL.get('nameStaff'),
          id: paramsURL.get('idStaff')
        })
      });

      if(paramsURL.get('day')){
        form.setFieldsValue({
          date: dayjs(paramsURL.get('day'))
        });
      }
    }
  }, [paramsURL]);

  const checkHistory = useMemo(() => {
      return paramsURL.get('idViewHistory')
  }, [paramsURL])

  const checkHash = useMemo(() => {
    let hashParams = {};
    location.hash.slice(1).split("&").forEach(function(param) {
      let paramArray = param.split("=");
      hashParams[paramArray[0]] = decodeURIComponent(paramArray[1]);
    });

    return hashParams;
  }, [location])

  return (
        !(checkHistory || checkHash?.idViewHistory) ?
          <MainLayout isAdmin={isAdmin} isMobile={isMobile}>
            <CardComponent
              title={type === 'edit' ? '勤怠編集' : '勤怠登録'}
              btnLeft={'戻る'}
              onClickLeft={() => window.history.back()}
            >
                <div className={'mainAppCustom'}>
                    {renderModalContent()}
                </div>
            </CardComponent>
        </MainLayout> :
          <Detail idStaff={paramsURL.get('idViewHistory') || checkHash?.idViewHistory}
                  name={paramsURL.get('nameViewHistory') || checkHash.nameViewHistory}
                  isAdmin={isAdmin}
                  isMobile={isMobile}
          ></Detail>
  );
}