// 定义排序顺序
const order = ["ready", "doing", "complete"];

export const sortedData = (data) => {
    return Object.entries(data)
    .sort((a, b) => {
        return order.indexOf(a[0]) - order.indexOf(b[0]);
    })
    .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});
}
// 转换金额
export const formattedAmount = (amount) => {
    let unit;
    const factor = Math.pow(10, 2);
    
    if (amount >= 100000000) {
      amount = amount / 100000000;
      amount = Math.round(amount * factor) / factor;
      unit = '亿元';
    } else if (amount >= 10000) {
      amount = amount / 10000;
      amount = Math.round(amount * factor) / factor;
      unit = '万元';
    } else {
      unit = '元';
    }
    return `${amount}${unit}`;
}
export const tipObj = {
    serviceContent: "<strong>服务机构：</strong>已提供预防申请服务的企业服务商统计<br /><strong>个人专家：</strong>已提供预防申请服务的个人专家统计<br /><strong>服务次数：</strong>已提供预防申请服务次数统计", // 服务统计
    accidentContent: "<strong>已投保企业：</strong>已投保且申请事故预防的企业统计<br /><strong>事故预防：</strong>申请事故预防次数统计<br /><strong>质检：</strong>事故预防完成后做过质检的次数统计", // 事故预防
    problemContent: "整改信息中风险因素前10排名",  // 问题排名
    pcisContent: "当前登录机构下承保/理赔信息统计",  // 承保/理赔统计
    barContent: "统计当前机构近五年预防金额费用、已服务次数、已服务企业数量", // 预防费用统计
    pieContent: "<strong>预防申请任务风险等级统计</strong><br />评定规则如下:<br />A、当保单风险因素中含重大风险则该保单归为重大风险<br />B、当保单风险因素中较大风险条数占比大于等于整单风险因素条数的30%，该保单评定成较大风险<br />C、当保单风险因素全部为低风险，该保单归为低风险<br />D、除上述场景，其他保单归为一般风险", // 保单风险预警统计
    pieHellowContent: "<strong>风险整改：</strong>当期机构所有风险因素整改情况统计<br /><strong>右侧饼图：</strong>当前机构不同风险等级的风险因素整改情况统计", // 整改统计
}

