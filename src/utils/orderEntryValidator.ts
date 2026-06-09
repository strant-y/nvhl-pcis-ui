import { selectDist,  } from "@/api/prod";
import dayjs from "dayjs";

interface OpertaorType {
  getTableRefByKey: (key: string) => {
    getFromValue: () => PayPlanItem[]; // 缴费计划列表类型
    getValue?: (field: string) => string | number | null; // 保险区间字段值
  };
}

//定义缴费计划单项类型
export interface PayPlanItem {
  "Pay.tPayBgnTm"?: string | number | null; // 缴费起期
  "Pay.tPayEndTm"?: string | number | null; // 缴费止期
  [key: string]: any; // 兼容其他字段
}

//  定义函数入参类型
interface CheckPayPlanParams {
  opertaor: OpertaorType;
}

/**
 * 检查缴费计划时间是否有效
 * @param  opertaor 工具
 * @returns {string | null} 校验通过返回 null，校验失败返回具体的错误提示文案
 */
export const checkPayPlanValidity = ({
  opertaor,
}: CheckPayPlanParams): string | null => {
  try {
    const payPlanList = opertaor.getTableRefByKey("payinfo").getFromValue();
    const insuranceStart = opertaor
      .getTableRefByKey("insrnc")
      ?.getValue?.("Base.tInsrncBgnTm");
    const insuranceEnd = opertaor
      .getTableRefByKey("insrnc")
      ?.getValue?.("Base.tInsrncEndTm");

    //日期转换工具函数
    const toValidDate = (
      dateValue: string | number | null | undefined
    ): Date => {
      if (
        dateValue == null ||
        (typeof dateValue === "string" && !dateValue.trim())
      ) {
        return new Date(NaN);
      }
      if (typeof dateValue === "number") {
        const minTimestamp = new Date("1900-01-01").getTime();
        const maxTimestamp = new Date("2100-12-31").getTime();
        return dateValue >= minTimestamp && dateValue <= maxTimestamp
          ? new Date(dateValue)
          : new Date(NaN);
      }
      // 字符串类型 → 直接转换
      const parsedDate = new Date(dateValue);
      return !isNaN(parsedDate.getTime()) ? parsedDate : new Date(NaN);
    };

    //校验保险区间本身是否有效
    const insStartDate = toValidDate(insuranceStart);
    const insEndDate = toValidDate(insuranceEnd);
    if (
      isNaN(insStartDate.getTime()) ||
      isNaN(insEndDate.getTime()) ||
      insStartDate > insEndDate
    ) {
      return "保单的保险起期或止期格式不正确，请检查！";
    }
    
    // 2. 先过滤无效缴费计划（日期格式错误的直接判定无效）
    const validPayPlans = payPlanList.filter((plan) => {
      const payStart = toValidDate(plan["Pay.tPayBgnTm"]);
      const payEnd = toValidDate(plan["Pay.tPayEndTm"]);
      // 日期格式有效 + 起期 <= 止期 + 不超出保险区间（先做基础过滤）
      return (
        !isNaN(payStart.getTime()) &&
        !isNaN(payEnd.getTime()) &&
        payStart <= payEnd &&
        payStart >= insStartDate &&
        payEnd <= insEndDate
      );
    });

    // 3. 校验缴费期数重叠
    const hasOverlap = (() => {
      // 只有 1 条或 0 条计划，不可能重叠
      if (validPayPlans.length <= 1) return false;

      // 按缴费起期排序
      const sortedPlans = [...validPayPlans].sort((a, b) => {
        const startA = toValidDate(a["Pay.tPayBgnTm"]).getTime();
        const startB = toValidDate(b["Pay.tPayBgnTm"]).getTime();
        return startA - startB;
      });

      // 遍历排序后的计划，检查相邻计划是否重叠
      for (let i = 0; i < sortedPlans.length - 1; i++) {
        const currentPlan = sortedPlans[i];
        const nextPlan = sortedPlans[i + 1];

        const currentEnd = toValidDate(currentPlan["Pay.tPayEndTm"]).getTime();
        const nextStart = toValidDate(nextPlan["Pay.tPayBgnTm"]).getTime();

        // 重叠判定
        if (currentEnd >= nextStart) {
          return true;
        }
      }
      return false;
    })();

    // 4. 若存在重叠，直接判定无效
    if (hasOverlap) {
      return "缴费计划的缴费期限存在重叠，请检查！";
    }

    // 5. 原有单条计划校验（兜底：确保无遗漏的无效计划）
    for (const plan of payPlanList) {
      const payStart = toValidDate(plan["Pay.tPayBgnTm"]);
      const payEnd = toValidDate(plan["Pay.tPayEndTm"]);

      if (isNaN(payStart.getTime()) || isNaN(payEnd.getTime())) return "缴费计划时间格式不正确！";
      if (payStart > payEnd) return "缴费计划的开始时间不能晚于结束时间！";
      if (payStart > insEndDate || payEnd > insEndDate) return "缴费计划不能超出保单止期！";
    }

    // 见费出单才进行下面校验
    debugger
    const cNeedfeeFlag = opertaor.getTableRefByKey("plyBase").getValue("Base.cNeedfeeFlag");
    if (cNeedfeeFlag == '1') {
      // 6. 校验缴费计划第一期缴费起期缴费止期必须在规则内
      const appTmVal = opertaor.getTableRefByKey("insrnc").getValue("Base.tAppTm");
      let bgnTmDate = dayjs(appTmVal);
      let endTmDate = dayjs(insuranceStart);
      if (endTmDate.isBefore(bgnTmDate)) {
        // 默认保险期间为3天
        endTmDate = bgnTmDate.add(3, 'day');
      }
      if (payPlanList.length === 1) {
        // 直接利用 dayjs 将时间设置为当天的 23:59:59
        endTmDate = endTmDate.hour(23).minute(59).second(59);
      } else {
        // 如果不是单次缴费，减去1秒
        endTmDate = endTmDate.subtract(1, 'second');
      }
      if (payPlanList && payPlanList.length > 0) {
        const firstPayPlan = payPlanList[0];
        // 获取第一条数据的开始和结束时间，并转为 dayjs 对象
        const payStart = dayjs(firstPayPlan['Pay.tPayBgnTm']);
        const payEnd = dayjs(firstPayPlan['Pay.tPayEndTm']);
        if (payStart.isAfter(endTmDate)) {
          return `首期缴费起期不能晚于 ${endTmDate.format('YYYY-MM-DD HH:mm:ss')}！`;
        }
        if (payEnd.isAfter(endTmDate)) {
          return `首期缴费止期不能晚于 ${endTmDate.format('YYYY-MM-DD HH:mm:ss')}！`;
        }
        if (payStart.isAfter(payEnd)) {
          return "首期缴费计划的开始时间不能晚于结束时间！";
        }
      }
      // 7. 校验 多期缴费最后一期缴费止期不能早于保单止期前30天（保留你的原有逻辑）
      if(payPlanList && payPlanList.length > 1){
        const lastPlan = payPlanList[payPlanList.length - 1];
        const lastPayEnd = toValidDate(lastPlan["Pay.tPayEndTm"]); // 最后一期缴费止期
        // 核心逻辑：最后一期缴费不能晚于保单止期前30天
        const minLastPayEnd = dayjs(insuranceEnd).subtract(30, 'day');
        if (dayjs(lastPayEnd).isAfter(minLastPayEnd)) {
          return `最后一期保费的缴费止期不能晚于保单止期前30天（即不能晚于 ${minLastPayEnd.format('YYYY-MM-DD HH:mm:ss')}）！`;
        }
      }
    }

    return null;
  } catch (error) {
    return "缴费计划校验发生系统异常，请稍后重试！";
  }
};


// 校验 040005 产品 清单信息与地址信息 问题
export const validateSchoolPersonWithApi = async (param) => {
  if (param.cProdNo !== '040005') {
    return { isValid: true, errorMessages: [] };
  }

  
  let personList = [];
  let schoolList = [];

  try {
    const selData1 = {
      cComponentTable: 'EducatorDist',
      cAppNo: param.cAppNo
    };
    const educatorRes = await selectDist(selData1);
    if (educatorRes.code === 200) {
      personList = educatorRes.data?.data || [];
    }
  } catch (error) {
    console.warn('人员清单接口请求异常，使用空列表校验:', error);
  }

  try {
    const selData2 = {
      cComponentTable: 'AddressDist',
      cAppNo: param.cAppNo
    };
    const addressRes = await selectDist(selData2);
    if (addressRes.code === 200) {
      schoolList = addressRes.data?.data || [];
    }
  } catch (error) {
    console.warn('学校清单接口请求异常，使用空列表校验:', error);
  }

  return validateSchoolAndPerson(personList, schoolList);
};
/**
 * 校验人员清单与学校清单的匹配性
 * @param {Array} personList 人员清单数组 
 * @param {Array} schoolList 学校清单数组 
 *  
 */
export const validateSchoolAndPerson = (personList, schoolList) => {
    const schoolMap = new Map();
  schoolList.forEach(school => {
    schoolMap.set(school['Dist.cSchoolName'], school['Dist.nInsuredNumber']);
  });

  const personSchoolCount = new Map();
  personList.forEach(person => {
    const schoolName = person['Dist.cSchoolName'];
    personSchoolCount.set(schoolName, (personSchoolCount.get(schoolName) || 0) + 1);
  });


  const errors = [];

  personSchoolCount.forEach((_, schoolName) => {
    if (!schoolMap.has(schoolName)) {
      errors.push(`“人员清单”中的学校「${schoolName}」不在“地址清单信息”中`);
    }
  });

  schoolMap.forEach((expectedCount, schoolName) => {
    const actualCount = personSchoolCount.get(schoolName) || 0;
    if (actualCount !== expectedCount) {
      errors.push(`清单信息——学校名称「${schoolName}」与 地址清单信息——投保学生人数 不匹配，“地址清单信息”为${expectedCount}人，“清单信息”为${actualCount}人`);
    }
  });

  return {
    isValid: errors.length === 0,
    errorMessages: errors
  };
};

  let  productTermMap = {
    "020001": 120, // 出口海洋运输货物保险
    "020002": 90,  // 出口陆上运输货物保险
    "020003": 90,  // 出口航空货物运输保险
    "020004": 45,  // 邮包保险
    "020005": 90,  // 进口海洋运输货物保险
    "020006": 90,  // 进口陆上运输货物保险
    "020007": 45,  // 进口航空货物运输保险
    "020009": 45,  // 国内水路、陆路货物运输保险
    "020011": 45,  // 国内航空货物运输保险
    "020013": 45,  // 国内公路货物运输保险
    "020014": 365, // 公路货物运输定额保险（固定365天）
    "020016": 45,  // 水路货物运输保险
    "020017": 45,  // 铁路货物运输保险
    "020018": 365, // 国内公路货物运输定期保险（固定365天）
  };


// 保险期限设置工具
export const setInsuranceTerm =(ops, productCode) => {
   // 确保ops.insrnc存在，避免后续赋值报错
    if (!ops.insrnc) {
      ops.insrnc = {};
    }
    const currentTime = dayjs();
    // 计算起始时间（统一为明天0点）
    const beginTm = currentTime.add(1, 'day').format("YYYY-MM-DD 00:00:00");
    // 计算结束时间（根据产品类型适配）
    let endTm;
    if (this.productTermMap.hasOwnProperty(productCode)) {
      // 特殊产品：使用映射表中的天数
      const days = this.productTermMap[productCode];
      // 结束时间 = 起始日 + 天数 - 1天（确保总天数准确）
      endTm = currentTime.add(1, 'day').add(days - 1, 'day').format("YYYY-MM-DD 23:59:59");
    } else {
      // 其他产品：默认1年
      endTm = currentTime.add(1, 'year').format("YYYY-MM-DD 23:59:59");
    }

    // 投保时间（当前时间）
    const appTm = currentTime.format("YYYY-MM-DD HH:mm:ss");
    // 设置到操作对象
    ops.insrnc["Base.tInsrncBgnTm"] = beginTm;
    ops.insrnc["Base.tInsrncEndTm"] = endTm;
    ops.insrnc["Base.tAppTm"] = appTm;
    return ops;
  } ;


 


 /**
   * 单独获取保险期限信息（不修改原对象）
   * @param {string} productCode - 当前产品编号
   * @returns {Object} 包含起止时间和投保时间的对象
   */
export const getInsuranceTermInfo = (productCode) =>{
    const currentTime = dayjs();
    const beginTm = currentTime.add(1, 'day').format("YYYY-MM-DD 00:00:00");
    let endTm;

    if (this.productTermMap.hasOwnProperty(productCode)) {
      const days = this.productTermMap[productCode];
      endTm = currentTime.add(1, 'day').add(days - 1, 'day').format("YYYY-MM-DD 23:59:59");
    } else {
      endTm = currentTime.add(1, 'year').format("YYYY-MM-DD 23:59:59");
    }

    return {
      beginTm,
      endTm,
      appTm: currentTime.format("YYYY-MM-DD HH:mm:ss")
    };
  }


export default {
  checkPayPlanValidity,
  setInsuranceTerm,
  getInsuranceTermInfo
};

 