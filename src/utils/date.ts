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


/*
* 比较两个日期的月份差距
* author Yesic 2008-10-23
*/
export function monthBetween(date1, date2) {
	var monthDiff = 0;
    //计算年份差距
	var year2 = parseFloat(date2.getFullYear());
	var year1 = parseFloat(date1.getFullYear());
	if (year2 > year1) {
		monthDiff = monthDiff + 12 * (year2 - year1);
	}

    //计算月份差距
	var month2 = parseFloat(date2.getMonth());
	var month1 = parseFloat(date1.getMonth());
	monthDiff = monthDiff + (month2 - month1);

    //计算日期差距
	var day2 = parseFloat(date2.getDate());
	var day1 = parseFloat(date1.getDate());
	if (day2 > (day1 - 1)) {
		monthDiff = monthDiff + 1;
	}
	return monthDiff;
}

/*
* 将字符串转换成日期对象
* 参数1： str 日期字符串（格式为yyyy[[-MM][-dd]] [[[HH][:mm]][:ss]]）
* 返回值：日期对象
*/
export function toDate(strDate) {
	var year;
	var month;
	var day;
	var hour;
	var minute;
	var second;
	var date = new Date(0);
	//TODO校验字符串格式
	//得到参数日期的年月日数值
	var sDateArray = strDate.substring(0, 10).split("-");
	if (sDateArray[0] == null) {
		tool.alert("\u65e5\u671f\u5fc5\u987b\u5305\u542b\u5e74");
		return null;
	} else {
		year = parseInt(sDateArray[0], 10);
		date.setFullYear(year);//设置年份
	}
	if (sDateArray[1] != null) {
		month = parseInt(sDateArray[1], 10) - 1;
		date.setMonth(month);//设置月份
	}
	if (sDateArray[2] != null) {
		day = parseInt(sDateArray[2], 10);
		date.setDate(day);//设置天份
	}
	//得到参数日期的时分秒值
	sTimeArray = strDate.substring(11).split(":");
	if (sTimeArray[0] != null) {
		hour = sTimeArray[0];
		date.setHours(hour);//设置小时
	}
	if (sTimeArray[1] != null) {
		minute = sTimeArray[1];
		date.setMinutes(minute);//设置分钟
	}
	if (sTimeArray[2] != null) {
		second = sTimeArray[2];
		date.setSeconds(second);//设置秒
	}
	return date;
}