import moment from "moment";
import dayjs from "dayjs";


export const getData = (opertaor: any) => {
  const user = JSON.parse(sessionStorage.getItem("user"));
  const param = opertaor.getParam();
  const productNo = param?.cProdNo;
  // 个别产品的保险期限
  const productTermMap = {
    "020001": 120, // 出口海洋运输货物保险
    "020002": 90, // 出口陆上运输货物保险
    "020003": 90, // 出口航空货物运输保险
    "020004": 45, // 邮包保险
    "020005": 90, // 进口海洋运输货物保险
    "020006": 90, // 进口陆上运输货物保险
    "020007": 45, // 进口航空货物运输保险
    "020009": 45, // 国内水路、陆路货物运输保险
    "020011": 45, // 国内航空货物运输保险
    "020013": 45, // 国内公路货物运输保险
    "020014": 365, // 公路货物运输定额保险（固定365天）
    "020016": 45, // 水路货物运输保险
    "020017": 45, // 铁路货物运输保险
    "020018": 365, // 国内公路货物运输定期保险（固定365天）
  };

  const defultdata = () => {
    // 默认全量初始化数据
    //保单基本信息初始化
    const dataInit = {};
    dataInit["Base.tAppTm"] = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

    const startDate = dayjs().add(1, "day").format("YYYY-MM-DD 00:00:00");
    dataInit["Base.tInsrncBgnTm"] = startDate;
    const startDayjs = dayjs(startDate);
    let termDays;
          // 特殊产品：使用固定天数
    if (productTermMap.hasOwnProperty(productNo)) {
      termDays = productTermMap[productNo];
    } else {
      // 非特殊产品：按1年计算（自动区分平闰年）
      const endOfYear = startDayjs.add(1, "year")
      termDays = endOfYear.diff(startDayjs, "day"); // 动态得到365或366
    }
    const endDate = startDayjs
      .add(termDays, "day")
      .subtract(1, "second")
      .format("YYYY-MM-DD HH:mm:ss");

    dataInit["Base.tInsrncEndTm"] = endDate;
    const tm = dayjs(endDate).add(1, "second").diff(startDayjs, "day");
    dataInit["Base.cTmSysCde"] = tm;

    dataInit["Base.cRenewMrk"] = "0";
    dataInit["Base.cIsNet"] = "0";
    dataInit["Base.cJuriCde"] =
      "本保单受中华人民共和国司法管辖（港、澳、台除外）";
    dataInit["Base.nRatioCoef"] = "1.000000";
    dataInit["Base.cRatioTyp"] = "2";
    dataInit["Base.cInstMrk"] = "0";
    dataInit["Base.cDisptSttlCde"] = "B";
    dataInit["Base.cInsExchCde"] = "1";
    dataInit["Base.cPremExchCde"] = "1";
    dataInit["Base.cPrmCur"] = "CNY";
    dataInit["Base.cAmtCur"] = "CNY";

    // 录单日期、签单日期默认值
    dataInit["Base.tOprTm"] = moment(new Date()).format("YYYY-MM-DD");
    dataInit["Base.tIssueTm"] = moment(new Date()).format("YYYY-MM-DD");
    // 是否见费出单 默认值
    dataInit["Base.cNeedfeeFlag"] = "1";
    //是否可疑交易，默认否
    dataInit["Base.cSusBusiness"] = "0";
    //录单人 默认系统操作员..
    dataInit["Base.cOprCde"] = user.opCde;
    //录单人联系方式  默认操作员的
    if (user.phoneNO !== null && user.phoneNO !== "") {
      dataInit["Base.cCiOprRel"] = user.phoneNO;
    }

    // 录单机构
    dataInit["Base.cDptCde"] = param.cDptCde;
    // 涉农标志
    dataInit["Base.cAgriMrk"] = "2";
    //联共保业务
    dataInit["Base.cCiMrk"] = "0";
    dataInit["Base.cIntroDptcde"] = param.cDptCde;
    dataInit["Base.cCiMrk"] = param.cCiMrk || "0";
    dataInit["Base.nPayNum"] = "1"; //缴费期数
    dataInit["Base.cIsFollowUp"] = "0"; //是否后续出营业中断险

    dataInit["Applicant.cStkMrk"] = "0";
    dataInit["Applicant.cCustRiskRank"] = "925104";
    dataInit["Insured.cStkMrk"] = "0";
    dataInit["Insured.cCustRiskRank"] = "925104";
    //设置是否单项工程默认值：是
    dataInit["Tgt.cIsSingle"] = "1";
    dataInit["Tgt.cContractCurrency"] = "CNY";
    //光船租赁标志程、船舶抵押标志、保赔协会成员标志默认值：否
    dataInit["Tgt.cRentalLogo"] = "0";
    dataInit["Tgt.cMortgageMark"] = "0";
    dataInit["Tgt.cMemberLogo"] = "0";
    //自航标志默认是
    dataInit["Tgt.cNavigationMark"] = "1";
    //保险价值币种 默认人民币
    dataInit["Tgt.cInsuranceCurrency"] = "CNY";
    // “标的信息”中“车辆使用性质”默认值为营运
    dataInit["Tgt.cUsageNature"] = "364113098";
    dataInit["Tgt.cPayCur"] = "CNY";
    // 标的信息中的车辆类型默认为电动自行车
    // dataInit["Tgt.cCarType"] = "00";


    return dataInit;
  };

  const di = defultdata();
  const diy = {};
  // 这里插入个性初始化逻辑
  if (param.cProdNo === "043009") {
    diy["Tgt.cInsuranceMethod"] = "613001";
  }
  if (param.cProdNo === "040002" || param.cProdNo === "049035") {
    diy["Tgt.cDeterminingMethod"] = "0"; //赔偿限额确定方式 页面初始化为直接限额制
    diy["Tgt.cRegisteredLogo"] = "0"; //记名投保标志
    diy["Tgt.cIncludeHighrisk"] = "0"; //是否包含高风险
    diy["Tgt.cInvolveHighaltitude"] = "0"; //是否涉及高空作
    diy["Tgt.cInvolveAgelimit"] = "0"; //是否涉及超龄人
  }

  if (param.cProdNo === "020001" ||param.cProdNo === "020005" ) {
    diy["Tgt.cRailwayIntermodal"] = "0"; //是否铁路联运
  }
  const defultData = Object.assign(diy, di);
  return defultData;
};

export const getECargoData = (idxParam: any) => {
  const user = JSON.parse(sessionStorage.getItem("user"));
  const param = idxParam.param;

  const defultdata = () => {
    // 默认全量初始化数据
    //保单基本信息初始化
    const dataInit = {};
    dataInit["ECargoBase.tAppTm"] = moment(new Date()).format(
      "YYYY-MM-DD HH:mm:ss"
    );
    dataInit["ECargoBase.tInsrncBgnTm"] = moment(
      new Date(Date.now() + 1 * 1000 * 60 * 60 * 24)
    ).format("YYYY-MM-DD 00:00:00");
    dataInit["ECargoBase.tInsrncEndTm"] = dayjs()
      .add(1, "year")
      .format("YYYY-MM-DD 23:59:59");

    const tm = moment(dataInit["ECargoBase.tInsrncEndTm"])
      .add(1, "second")
      .diff(moment(dataInit["ECargoBase.tInsrncBgnTm"]), "days");
    dataInit["ECargoBase.cTmSysCde"] = tm;
    // tmDay.value = tm;
    dataInit["ECargoBase.cRenewMrk"] = "0";
    dataInit["ECargoBase.cIsNet"] = "0";
    dataInit["ECargoBase.cPolicySource"] = "1";
    dataInit["ECargoBase.cJuriCde"] =
      "本保单受中华人民共和国司法管辖（港、澳、台除外）";
    dataInit["ECargoBase.nRatioCoef"] = "1.000000";
    dataInit["ECargoBase.cRatioTyp"] = "2";
    dataInit["ECargoBase.cInstMrk"] = "0";
    dataInit["ECargoBase.cDisptSttlCde"] = "B";
    dataInit["ECargoBase.cInsExchCde"] = "1";
    dataInit["ECargoBase.cPremExchCde"] = "1";
    dataInit["ECargoBase.cPrmCur"] = "CNY";
    dataInit["ECargoBase.cAmtCur"] = "CNY";

    // 录单日期、签单日期默认值
    dataInit["ECargoBase.tOprTm"] = moment(new Date()).format("YYYY-MM-DD");
    dataInit["ECargoBase.tIssueTm"] = moment(new Date()).format("YYYY-MM-DD");
    // 是否见费出单 默认值
    dataInit["ECargoBase.cNeedfeeFlag"] = "1";
    //是否可疑交易，默认否
    dataInit["ECargoBase.cSusBusiness"] = "0";
    //录单人 默认系统操作员..
    dataInit["ECargoBase.cOprCde"] = user.opCde;
    //录单人联系方式  默认操作员的
    if (user.phoneNO !== null && user.phoneNO !== "") {
      dataInit["ECargoBase.cCiOprRel"] = user.phoneNO;
    }

    // 录单机构
    // dataInit["ECargoBase.cDptCde"] = param.cDptCde;
    // 涉农标志
    dataInit["ECargoBase.cAgriMrk"] = "2";
    //联共保业务
    dataInit["ECargoBase.cCiMrk"] = "0";
    dataInit["ECargoBase.cIntroDptcde"] = param.cDptCde;
    dataInit["ECargoBase.cCiMrk"] = param.cCiMrk || "0";
    dataInit["ECargoBase.nPayNum"] = "1"; //缴费期数

    // dataInit["ECargoApplicant.cStkMrk"] = "0";
    // dataInit["ECargoApplicant.cCustRiskRank"] = "925104";
    // dataInit["ECargoInsuredDist.cStkMrk"] = "0";
    // dataInit["ECargoInsuredDist.cCustRiskRank"] = "925104";
    return dataInit;
  };

  const defultData = defultdata();
  return defultData;
};
