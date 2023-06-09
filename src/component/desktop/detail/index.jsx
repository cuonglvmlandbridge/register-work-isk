// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from 'react';
import MainLayout from '../../layout/main';
import styles from './styles.module.css';
import {Button, DatePicker, Table} from 'antd';
import CardComponent from '../common/card/CardComponent';
import { getRecords } from "../../../api/list";
import dayjs from "dayjs";
import Pagination from "../../common/Pagination";
import Cookie from 'js-cookie';
import {ID_APP_REGISTER, URL_WEB} from '../../common/const';

const idApp = kintone.app.getId() || kintone.mobile.app.getId();
const FORMAT_DATE = 'YYYY/MM/DD';
const FORMAT_MONTH = 'YYYY/MM';

const DEFAULT_PAGE_SIZE = 10;

const staffIdLogin = Cookie.get('staffIdLogin');

export default function Detail({ idStaff, name, isAdmin, isMobile }) {
    const [data, setData] = useState([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [month, setMonth] = useState(dayjs().format(FORMAT_MONTH))

    const [params, setParams] = useState({
        app: idApp,
        query: `id_staff = ${idStaff} and date like "${month}" limit ${page * DEFAULT_PAGE_SIZE} offset 0`,
        fields: ['$id', 'staff', 'date', 'time_in', 'time_out'],
        totalCount: true
    });

    const fetchRecords = async (payload) => {
        const records = await getRecords(payload);
        const result = records.records.map((val) => {
            let objItem = {};
            for (const item in val) {
                objItem = Object.assign(objItem, { [item]: val[item]['value'] });
            }
            return objItem;
        })
        let newResult = result.sort((a, b) => new Date(b.date) - new Date(a.date));

        setData(newResult);
        setTotal(records.totalCount);
    };

    const columns = [
        {
            title: '日付',
            dataIndex: 'date',
            key: '日付',
            width: 100,
            align: 'center',
        },
        {
            title: '従業員名',
            dataIndex: 'staff',
            key: '従業員名',
            width: 100,
            align: 'center',
        },
        {
            title: '出勤時間',
            key: '出勤時間',
            width: 100,
            align: 'center',
            render: (item) => {
                return <div>
                    <div>
                        {item.date}
                    </div>
                    <div>
                        {item.time_in}
                    </div>
                </div>
            }
        },
        {
            title: '退勤時間',
            key: '退勤時間',
            width: 100,
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
            title: '',
            key: 'action',
            width: 100,
            align: 'center',
            fixed: 'right',
            render: (item) => (
                <div className={styles.btnGroup}>
                    <div className={styles.btnTop}>
                        <Button
                            type={'text'}
                            onClick={() => {
                                if(isMobile) {
                                    window.location.href = `${window.location.origin}/k/m/${idApp}/show?record=${item.$id}#mode=edit`
                                }
                                else window.location.href = `${window.location.origin}/k/${idApp}/show#record=${item.$id}&mode=edit`
                            }}
                        >
                            編集
                        </Button>
                    </div>
                </div>
            )
        },
    ];

    const handleChangePage = (val) => {
        let queryIndex = params.query.indexOf('limit');
        let newQuery = params.query.substring(0, queryIndex);
        setPage(val);
        setParams({
            ...params,
            query: newQuery + `limit ${DEFAULT_PAGE_SIZE} offset ${(val - 1) * DEFAULT_PAGE_SIZE}`
        });
    };

    const onChangeMonth = (payload) => {
        let newMonth = dayjs(payload).format(FORMAT_MONTH);
        setMonth(newMonth)
        setParams({
            ...params,
            query: `id_staff = ${idStaff} and date like "${newMonth}" limit ${page * DEFAULT_PAGE_SIZE} offset 0`,
        });
    }

    useEffect(() => {
        if(!isAdmin) {
            if(idStaff === staffIdLogin ) {
                fetchRecords(params);
            }
            else {
                window.location.href = `${URL_WEB}/k/${ID_APP_REGISTER}/`
            }
        }
        else {
            fetchRecords(params);
        }
    }, [params, idStaff, staffIdLogin]);

    return (
        <MainLayout isAdmin={isAdmin} isMobile={isMobile}>
            <CardComponent
                title={'勤怠履歴'}
                btnLeft={'戻る'}
                onClickLeft={() => window.history.back()}
            >
                <div className={styles.user}>
                    {
                        !!data?.length && data[0].staff || name
                    }
                </div>
                <div className={styles.itemDate}>
                    <label>日付:</label>
                    <DatePicker picker={'month'} value={dayjs(month)} placeholder={''} onChange={onChangeMonth} />
                </div>
                <Table dataSource={data} columns={columns} scroll={{x: 800}} pagination={false}/>
                <Pagination total={total} page={page} onChangePage={handleChangePage}
                            defaultPageSize={DEFAULT_PAGE_SIZE}/>
            </CardComponent>
        </MainLayout>
    );
}