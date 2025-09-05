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
 * 检查缴费计划时间是否超出保险区间
 * @param  opertaor 工具
 */
export const checkPayPlanValidity = ({
  opertaor,
}: CheckPayPlanParams): boolean => {
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
      return true;
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

    // 3. 校验缴费期数重叠（核心新增逻辑）
    const hasOverlap = (() => {
      // 只有 1 条或 0 条计划，不可能重叠
      if (validPayPlans.length <= 1) return false;

      // 按缴费起期排序（排序后只需对比相邻计划，提升效率）
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

        // 重叠判定：当前计划止期 >= 下一个计划起期（包含首尾相接，如需允许相接可改为 currentEnd > nextStart）
        if (currentEnd >= nextStart) {
          return true;
        }
      }
      return false;
    })();

    // 4. 若存在重叠，直接判定无效
    if (hasOverlap) {
      return true;
    }

    // 5. 原有单条计划校验（兜底：确保无遗漏的无效计划）
    for (const plan of payPlanList) {
      const payStart = toValidDate(plan["Pay.tPayBgnTm"]);
      const payEnd = toValidDate(plan["Pay.tPayEndTm"]);

      if (isNaN(payStart.getTime()) || isNaN(payEnd.getTime())) return true;
      if (payStart > payEnd) return true;
      if (payStart < insStartDate || payEnd > insEndDate) return true;
    }

    return false;
  } catch (error) {
    return true;
  }
};

export default {
  checkPayPlanValidity,
};
