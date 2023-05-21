import Cookie from 'js-cookie';
import {ID_APP_REGISTER} from '../component/common/const';

const idAuth = '32'

export function fetchAllRecordsCustomer(appId, opt_offset, opt_limit, opt_records) {
  let offset = opt_offset || 0;
  let limit = opt_limit || 100;
  let allRecords = opt_records || [];
  let params = {app: appId, query: 'limit ' + limit + ' offset ' + offset, fields: ['$id', 'fullname', 'name']};
  return kintone.api('/k/v1/records', 'GET', params).then(function(resp) {
    allRecords = allRecords.concat(resp.records);
    if (resp.records.length === limit) {
      return fetchAllRecordsCustomer(appId, offset + limit, limit, allRecords);
    }
    return allRecords;
  });
}

export function fetchAllRecordsStaff(appId, idStaff, opt_offset, opt_limit, opt_records) {
  let offset = opt_offset || 0;
  let limit = opt_limit || 100;
  let allRecords = opt_records || [];
  let params = {
    app: appId,
    query: `${idStaff ? `$id = "${idStaff}"` : ''} limit ${limit} offset ${offset}`,
    fields: ['$id', 'fullname', 'name']};
  return kintone.api('/k/v1/records', 'GET', params).then(function(resp) {
    allRecords = allRecords.concat(resp.records);
    if (resp.records.length === limit) {
      return fetchAllRecordsCustomer(appId, idStaff, offset + limit, limit, allRecords);
    }
    return allRecords;
  });
}

export function fetchAllStaffRegister(date, idStaff, opt_offset, opt_limit, opt_records) {
  let offset = opt_offset || 0;
  let limit = opt_limit || 100;
  let allRecords = opt_records || [];
  let params = {
    app: ID_APP_REGISTER,
    query: `date = "${date}" ${idStaff ? `and id_staff = "${idStaff}"` : ''} limit ${limit} offset ${offset}`,
    fields: ['$id', 'staff', 'date', 'time_in', 'time_out', 'id_staff', 'Updated_datetime', 'user_update'],};
  return kintone.api('/k/v1/records', 'GET', params).then(function(resp) {
    allRecords = allRecords.concat(resp.records);
    if (resp.records.length === limit) {
      return fetchAllStaffRegister(date, idStaff, offset + limit, limit, allRecords);
    }
    return allRecords;
  });
}

export function formatMoney(value) {
  if (!value) return '';
  const format = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${ format }円`;
}

export const logout = () => {
  Cookie.remove('staffIdLogin');
  Cookie.remove('userISK');
  Cookie.remove('passISK');
  Cookie.remove('userLogin');
  window.location.href = `${window.location.origin}/k/${idAuth}`
}
