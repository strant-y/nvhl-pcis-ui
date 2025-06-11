import moment from "moment";
import dayjs from "dayjs";
import { dataOpertaor } from "@/store";

export const getData = () => {
  const user = JSON.parse(sessionStorage.getItem("user"));
  const opertaor = dataOpertaor();
  const param = opertaor.getParam();

  const defultdata = () => {
    // 默认全量初始化数据
    //保单基本信息初始化
    const dataInit = {};
    dataInit["Base.tAppTm"] = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    dataInit["Base.tInsrncBgnTm"] = moment(
      new Date(Date.now() + 1 * 1000 * 60 * 60 * 24)
    ).format("YYYY-MM-DD 00:00:00");
    dataInit["Base.tInsrncEndTm"] = dayjs(dataInit["Base.tInsrncBgnTm"])
      .add(1, "year")
      .format("YYYY-MM-DD 23:59:59");
    const tm = moment(dataInit["Base.tInsrncEndTm"]).diff(
      moment(dataInit["Base.tInsrncBgnTm"]),
      "days"
    );
    dataInit["Base.cTmSysCde"] = tm;
    // tmDay.value = tm;
    dataInit["Base.cRenewMrk"] = "0";
    dataInit["Base.cIsNet"] = "0";
    dataInit["Base.cPolicySource"] = "1";
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
    dataInit["Base.cOprCde"] = user.userName;
    //录单人联系方式  默认操作员的
    if (user.phoneNO !== null && user.phoneNO !== "") {
      dataInit["Base.cCiOprRel"] = user.phoneNO;
    }

    // 录单机构
    dataInit["Base.cDptCde"] = param.cDptCde;
    //联共保业务
    dataInit["Base.cCiMrk"] = "0";
    dataInit["Base.cIntroDptcde"] = param.cDptCde;
    dataInit["Base.cCiMrk"] = param.cCiMrk || "0";

    dataInit["Applicant.cStkMrk"] = "0";
    dataInit["Applicant.cCustRiskRank"] = "925104";
    dataInit["Insured.cStkMrk"] = "0";
    dataInit["Insured.cCustRiskRank"] = "925104";
    //设置是否单项工程默认值：是
    dataInit["Tgt.cIsSingle"] = "1";
    dataInit["Tgt.cContractCurrency"] = "01";
    return dataInit;
  };

  const di = defultdata();
  const diy = {};
  // 这里插入个性初始化逻辑
  if (param.cProdNo === "043009") {
    diy["Tgt.cInsuranceMethod"] = "613001";
  }
  const defultData = Object.assign(diy, di);
  return defultData;
};
