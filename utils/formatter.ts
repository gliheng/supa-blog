import moment from 'moment';

export function formatDate(d: string) {
  const t = moment(d);
  const c = moment().subtract(7, 'days');
  if (t.isAfter(c)) {
    return t.fromNow();
  }
  return t.format('YYYY/MM/DD');
}
