import moment from 'moment';

export function formatDateTime(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}


// 默认三十天
export function getDaysAgo(date, between: number) {
  // 修正日期，因为 setMonth()会将日期设置为当月的第一天
  date.setDate(date.getDate() - between);
  return formatDateTime(date);
}
// 默认3个月
export function getDefaultDateRange() {
  // 获取今天的日期
  const today = moment();
  // 计算3个月前的日期
  const threeMonthsAgo = moment().subtract(3, 'months');
  // 返回开始和结束日期，确保都是当天的开始和结束时间
  return {
    start: threeMonthsAgo.startOf('day').format('YYYY-MM-DD'), 
    end: today.endOf('day').format('YYYY-MM-DD')
  };
}
// 日期格式化工具
export function formatDate(datetime, format: string): string {
  const date = new Date(datetime);
  const map: { [key: string]: string | number } = {
    'yyyy': date.getFullYear(),
    'MM': (date.getMonth() + 1).toString().padStart(2, '0'),
    'dd': date.getDate().toString().padStart(2, '0'),
    'HH': date.getHours().toString().padStart(2, '0'),
    'mm': date.getMinutes().toString().padStart(2, '0'),
    'ss': date.getSeconds().toString().padStart(2, '0'),
  };
  return format.replace(/yyyy|MM|dd|HH|mm|ss/g, match => map[match]);
}
