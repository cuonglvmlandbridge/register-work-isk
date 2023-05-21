// eslint-disable-next-line no-unused-vars
import React, {useEffect, useState} from 'react';
import {Button, Table} from 'antd';
import {getRecords} from '../../../api/list';
import Pagination from '../../common/Pagination';
import FilterList from './filter';
import dayjs from 'dayjs';
import styles from './styles.module.css';
import FormRegister from './formRegister';
import {ID_APP_CUSTOMER, ID_APP_STAFF} from '../../common/const';
import MainLayout from '../../layout/main';
import CardComponent from '../common/card/CardComponent';
import Cookie from 'js-cookie';
import {fetchAllRecordsStaff, fetchAllStaffRegister} from '../../../utils/common';

const DEFAULT_PAGE_SIZE = 10;

const FORMAT_DATE = 'YYYY/MM/DD';
const FORMAT_DATETIME = 'YYYY/MM/DD HH:mm';

const idApp = kintone.app.getId() || kintone.mobile.app.getId();

const staffIdLogin = Cookie.get('staffIdLoginTest');

const paramsURL = new URLSearchParams(location.search);

export default function TableList({isAdmin, isMobile}) {

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(dayjs().format(FORMAT_DATE));

  const convertData = (payload) => {
    const result = payload.map((val) => {
      let objItem = {};
      for (const item in val) {
        objItem = Object.assign(objItem, {[item]: val[item]['value']});
      }
      return objItem;
    });
    return result
  };

  const fetchData = async (payload) => {
    setLoading(true)
    const [staffs, staffsRegister] = await Promise.all([
      fetchAllRecordsStaff(ID_APP_STAFF, !isAdmin && staffIdLogin),
      fetchAllStaffRegister(date , !isAdmin && staffIdLogin)
    ]);
    let objIds = {}
    staffsRegister.forEach((val) => {
      Object.assign(objIds, {
        [val.id_staff.value] :  val
      })
    })
    const result = staffs.map((val) => {
      if(objIds[val.$id.value]) {
        return {...val, ...{id_staff: {value: val.$id.value}} , ...objIds[val.$id.value]}
      }
      else {
        return {...val, ...{id_staff: {value: val.$id.value}}}
      }
    })

    const dataFinal = convertData(result)
    setData(dataFinal)
    setLoading(false);
    setLoading(false)
  }

  useEffect(() => {
    if(paramsURL.get('day')) {
      setDate(dayjs(paramsURL.get('day')).format(FORMAT_DATE))
    }
  }, [paramsURL])

  useEffect(() => {
    fetchData()
  }, [date]);

  const columns = [
    {
      title: 'No.',
      key: 'No.',
      align: 'center',
      width: 50,
      render: (item, record, index) => {
        return <>{index + 1}</>
      }
    },
    {
      title: '従業員名',
      dataIndex: 'name',
      width: 120,
      key: '従業員名',
      align: 'center',
    },
    {
      title: '出勤時間',
      key: '出勤時間',
      width: 120,
      align: 'center',
      render: (item) => {
        return item.date && (
          <div>
            <div>
              {item.date}
            </div>
            <div>
              {item.time_in}
            </div>
        </div>)
      }
    },
    {
      title: '退勤時間',
      key: '退勤時間',
      width: 120,
      align: 'center',
      render: (item) => {
        const date1 = dayjs(`2000-01-01 ${item.time_in}`)
        const date2 = dayjs(`2000-01-01 ${item.time_out}`)
        return <div>
          <div>
            {date1.diff(date2) > 0 ? dayjs(dayjs(item.date).add(1, 'day')).format(FORMAT_DATE) : item.date}
          </div>
          <div>
            {item.time_out}
          </div>
        </div>
      }
    },
    {
      title: '更新者',
      dataIndex: 'user_update',
      key: '更新者',
      width: 120,
      align: 'center',
    },
    {
      title: '更新日時',
      key: '更新日時',
      width: 120,
      align: 'center',
      render: (item) =>  item.time_in && dayjs(item.Updated_datetime).format(FORMAT_DATETIME)
    },
    {
      title: '',
      width: 120,
      key: 'action',
      fixed: 'right',
      render: (record) => (
        <div className={styles.btnGroup}>
          {
            // isAdmin &&
            <div className={styles.btnTop}>
              <Button
                type={'text'}
                disabled={!!record.time_in}
                onClick={() => {
                  if(isMobile) {
                    window.location.href = `${window.location.origin}/k/m/${idApp}/edit?idStaff=${record.id_staff}&nameStaff=${record.name}&day=${date}`
                  }
                  else {
                    window.location.href = `${window.location.origin}/k/${idApp}/edit?idStaff=${record.id_staff}&nameStaff=${record.name}&day=${date}`
                  }
                }}
              >
                登録
              </Button>
              <Button type={'text'}
                      onClick={() => {
                        if(record.date) {
                          if(isMobile) {
                            window.location.href = `${window.location.origin}/k/m/${idApp}/show?record=${record.$id}#mode=edit`
                          }
                          else {
                            window.location.href = `${window.location.origin}/k/${idApp}/show#record=${record.$id}&mode=edit`
                          }
                        }
                        else {
                          if(isMobile) {
                            window.location.href = `${window.location.origin}/k/m/${idApp}/edit?idStaff=${record.id_staff}&nameStaff=${record.name}`
                          }
                          else {
                            window.location.href = `${window.location.origin}/k/${idApp}/edit?idStaff=${record.id_staff}&nameStaff=${record.name}`
                          }
                        }
                      }}>
                編集
              </Button>
            </div>
          }
          <div className={styles.btnBottom}>
            <Button type={'text'}
                    onClick={() =>{
                      if(isMobile) {
                        window.location.href = `${window.location.origin}/k/m/${idApp}/edit#idViewHistory=${record.id_staff}&nameViewHistory=${record.name}&month=${dayjs(date).format('YYYY/MM')}`
                      }
                      else  window.location.href = `${window.location.origin}/k/${idApp}/edit?idViewHistory=${record.id_staff}&nameViewHistory=${record.name}&month=${dayjs(date).format('YYYY/MM')}`
                    }}>
              勤怠履歴
            </Button>
          </div>
        </div>
      )
    },
  ];

  const onFinish = (payload) => {
    setDate(dayjs(payload.date).format(FORMAT_DATE))
  };

  return (
    <MainLayout isAdmin={isAdmin} isMobile={isMobile}>
      <CardComponent title={'勤怠一覧'} >
        <FilterList onFinish={onFinish} date={date}/>
        <Table dataSource={data} columns={columns} loading={loading} scroll={{x: 1000}}/>
      </CardComponent>
    </MainLayout>
  );
}