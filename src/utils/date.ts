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
	// var monthDiff = 0;
  //   //计算年份差距
	// var year2 = parseFloat(date2.getFullYear());
	// var year1 = parseFloat(date1.getFullYear());
	// if (year2 > year1) {
	// 	monthDiff = monthDiff + 12 * (year2 - year1);
	// }

  //   //计算月份差距
	// var month2 = parseFloat(date2.getMonth());
	// var month1 = parseFloat(date1.getMonth());
	// monthDiff = monthDiff + (month2 - month1);

  //   //计算日期差距
	// var day2 = parseFloat(date2.getDate());
	// var day1 = parseFloat(date1.getDate());
	// if (day2 > (day1 - 1)) {
	// 	monthDiff = monthDiff + 1;
	// }
	// return monthDiff;
	const year2 = parseFloat(date2.getFullYear());
	const month2 = parseFloat(date2.getMonth());
	const day2 = parseFloat(date2.getDate());
	const year1 = parseFloat(date1.getFullYear());
	const month1 = parseFloat(date1.getMonth());
	const day1 = parseFloat(date1.getDate());

	let yearDiff = year2 - year1;
	let monthDiff = month2 - month1;
	if(monthDiff < 0) {
		yearDiff -= 1;
		monthDiff += 12;
	}

	monthDiff = monthDiff + yearDiff * 12;
	if (day2 > (day1 - 1)) {
		monthDiff = monthDiff + 1;
	}
	return monthDiff;
}

/**
 * 判断保险期限是否小于 6 个自然月 （日历上月数）
 * @param {number} date1 起期时间戳（ms）
 * @param {number} date2 止期时间戳（ms）
 * @returns {boolean} true=不足6个月
 */
export function lessThan6Months(date1, date2) {
  if (!date1 || !date2) return false;

  const start = new Date(date1);
  const end   = new Date(date2);
  if (end <= start) return false;

  // 1. 整月差
  let months = (end.getFullYear() - start.getFullYear()) * 12 +
               (end.getMonth() - start.getMonth());

  // 2. 如果止期的“日”小于起期的“日”，则再减 1 个月
  if (end.getDate() < start.getDate()) months -= 1;

  // 3. 加上剩余天数折算的小数月（按当月总天数折算）
  const daysRemained = Math.max(0, end.getDate() - start.getDate());
  if (daysRemained > 0) {
    // 用起期所在月的总天数做分母，保持自然月定义
    const totalDaysInMonth = new Date(
      start.getFullYear(),
      start.getMonth() + 1,
      0
    ).getDate();
    months += daysRemained / totalDaysInMonth;
  }
  return months < 6;
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
		let sTimeArray = [];
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
	// sTimeArray = strDate.substring(11).split(":");
 
  const timeStr = strDate.substring(11, 19); 
  sTimeArray = timeStr.split(":");

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