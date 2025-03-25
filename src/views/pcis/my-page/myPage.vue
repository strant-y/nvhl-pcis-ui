<!-- 用户管理 -->
<template>
  <div>
    <el-container>
      <el-main>
        <el-container>
          <el-aside :width="(NavigaShow ? 200 : 100) + 'px'">
            <el-affix :offset="150">
              <div class="navi_container">
                <div
                  v-for="(pageConfig, v) in formconfig1"
                  :key="v"
                  class="NavigaList_card"
                >
                  <el-anchor :bound="120" :offset="80">
                    <el-anchor-link :href="`#underwrite`" v-if="underwriteFlag">
                      <span style="font-size: 15px" >
                       核保处理
                      </span>
                    </el-anchor-link>
                    <el-anchor-link
                      v-for="(k, i) in pageConfig?.pageInfo"
                      :key="i"
                      :href="`#${k.pageKey}`"
                    >
                      <rt-icon
                        style="margin-right: 14px"
                        :item="{
                          icon:
                            k.icon && k.icon !== 'null' && k.icon !== ''
                              ? k.icon
                              : 'Tickets',
                        }"
                      />
                      <span style="font-size: 15px" v-if="NavigaShow">
                        {{ k.pageTtile }}
                      </span>
                    </el-anchor-link>
                  </el-anchor>
                </div>
                <div class="NavigaList_card" style="margin-left: 5px">
                  <rt-icon
                    @click="NavigaShow = !NavigaShow"
                    v-if="!NavigaShow"
                    :item="{ icon: 'DArrowRight' }"
                  />
                  <rt-icon
                    @click="NavigaShow = !NavigaShow"
                    v-if="NavigaShow"
                    :item="{ icon: 'DArrowLeft' }"
                  />
                </div>
              </div>
            </el-affix>
          </el-aside>
          <el-container>
            <el-header height="60px">
              <el-affix
                :offset="90"
                style="text-align: center; padding: 5px; background: #ebedfc"
              >
                <div class="tp" style="background: #ebedfc">
                  条款：<span class="publicStyle"
                    >{{ props.param.cTermNo }}&nbsp;&nbsp;{{
                      props.param.cNmeCn
                    }}</span
                  >&nbsp;|&nbsp;出单方式：<span class="publicStyle"
                    >核心出单</span
                  >&nbsp;| <span class="publicStyle">非共保业务</span> |
                  <span class="publicStyle">{{
                    props.param.cGrpMrk == "0" ? "个单" : "团单"
                  }}</span>
                </div>
                <div class="btm" style="background: #ebedfc">
                  保险期限：<span class="publicStyle">{{ tmDay }}</span
                  >&nbsp;|&nbsp;保额：<span class="publicStyle">{{ nAmt }}</span
                  >&nbsp;元&nbsp;|&nbsp;保费为:
                  <span class="publicStyle">{{ nPrm }}</span
                  >元
                </div>
              </el-affix>
            </el-header>
            <el-main>
              <div :id="underwrite" v-if="underwriteFlag" style="margin-bottom: 10px">
                <underwriteRef :param="props.param"  ref="underwrite"></underwriteRef>
              </div>
              <template v-for="(pageConfig, v) in formconfig1" :key="v">
                <div
                  class="card_"
                  v-for="(k, i) in pageConfig?.pageInfo"
                  :key="i"
                  :id="k.pageKey"
                >
                  <component
                    v-if="currentIndex >= i"
                    :ref="
                      (res) => {
                        opertaor.addTableRef(k.pageKey, res);
                      }
                    "
                    :is="
                      k.pageType === 'custom' ? k.pageCode : k.pageKey + '-ref'
                    "
                    :pageSchema="k.pageSchema"
                  />
                </div>
              </template>
            </el-main>
          </el-container>
        </el-container>
      </el-main>
      <el-footer>
        <el-affix position="bottom" :offset="10">
          <div class="bottom-items">
            <rt-button
              v-for="(bth, idx) in bthList"
              :item="bth"
              :key="idx"
              :loading="bth.loading"
            />
          </div>
        </el-affix>
      </el-footer>
    </el-container>
    <el-backtop :right="100" :bottom="100" />
  </div>
</template>

<script setup lang="ts">
import { createFreeButtonBase, FreeButtonBase } from "@/shared/button-config";
import { getProductPage } from "../../../api/prod/index";
import {
  getAppPlyInfoByAppNo,
  saveAppPlyInfo,
  generatelSingleNo,
  appCalc,
  submitToUndr,
  getAppPolicy,submitUnderwriting,submitUnderwritingEdr
} from "../../../api/query/index";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import moment from "moment";
import dayjs from "dayjs";
import { useDzModal } from "@/common/dzmodel/DzModalService";
const CostInformation = defineAsyncComponent(
    () => import("@/views/pcis-new-udr-list/pages/CostInformation.vue")
);
// 历次批单 弹框页面
const PreviousdrOpnList = defineAsyncComponent(
    () => import("@/views/pcis-new-udr-list/common/PreviousdrOpnList.vue")
);
const opertaor = dataOpertaor();
opertaor.init();
const underwrite = ref(null)
const props = defineProps({
  param: {
    type: Object,
  },
});

opertaor.setParam(props.param);

// 当前加载的组件索引
const currentIndex = ref(0);
const NavigaShow = ref(true);
const formconfig1 = opertaor.getTableConfig();
const bthList = ref<Array<FreeButtonBase>>([]);
const tempFindBtn = [];
let underwriteFlag=false
const user = JSON.parse(sessionStorage.getItem("user"));
const nAmt = ref(0.0);
const nPrm = ref(0.0);
const tmDay = ref(0);
const dzmodal = useDzModal();
onBeforeMount(() => {
  console.log("路由参数props.param", props.param);
  initPage();
});

/**
 * 数据初始化
 * @param data
 */
const initPage = async () => {
  const getProductRes = await getProductPage({
    CProdNo: props.param.cProdNo,
    CGrpMrk: props.param.cGrpMrk,
  });
  if (props.param.pageType === "PLY_UW") {
      underwriteFlag=true
  }else{
      underwriteFlag=false
  }
  // 页面初始化
  const formconfig11 = JSON.parse(getProductRes.data);
  console.log("页面初始化返回数据", formconfig11);
  opertaor.setTableConfig(formconfig11);
  renderComponents();
};

/**
 * 逐个渲染组件
 */
function renderComponents() {
  const interval = setInterval(() => {
    if (currentIndex.value < formconfig1[0]?.pageInfo.length - 1) {
      currentIndex.value++;
    } else {
      loadAfter(); //页面加载完成之后,再加载后续所需的事件
      clearInterval(interval);
    }
  }, 100); // 延迟组件渲染,增加页面响应效率
}

/**
 * 页面加载后
 */
async function loadAfter() {
  console.log("setPage");
  console.log(props.param);
  // page.getRefTab("base").setFormValue(lowercaseKeys(props.param));
  if (props.param.pageType === "app") {
    //获取单号
    getCAppNoFun();
    bthList.value.push(
      createFreeButtonBase({
        label: "保存模板",
        type: "primary",
        func: () => {},
      }),
      createFreeButtonBase({
        label: "复制出单",
        type: "primary",
        func: () => {},
      }),
      createFreeButtonBase({
        label: "保费计算",
        type: "primary",
        id: "btn010101",
        func: () => {
          calcPremium();
        },
      }),
      createFreeButtonBase({
        label: "提交",
        type: "primary",
        id: "btn010102",
        func: () => {
          savePlyInfo();
        },
      }),
      createFreeButtonBase({
        label: "申请核保",
        type: "primary",
        id: "btn010103",
        func: () => {
          submitToUndrFn();
        },
      }),
      createFreeButtonBase({
        label: "发票信息",
        type: "primary",
        func: () => {},
      }),
      createFreeButtonBase({
        label: "反洗钱扩展信息",
        type: "primary",
        func: () => {},
      })
    );
    nextTick(() => {
      //保险期间初始化
      const baseBefore = {};
      baseBefore["Base.tAppTm"] = moment(new Date()).format(
        "YYYY-MM-DD HH:mm:ss"
      );
      baseBefore["Base.tInsrncBgnTm"] = moment(
        new Date(Date.now() + 1 * 1000 * 60 * 60 * 24)
      ).format("YYYY-MM-DD 00:00:00");
      baseBefore["Base.tInsrncEndTm"] = dayjs(baseBefore["Base.tInsrncBgnTm"])
        .add(1, "year")
        .format("YYYY-MM-DD 23:59:59");
      const tm = moment(baseBefore["Base.tInsrncEndTm"]).diff(
        moment(baseBefore["Base.tInsrncBgnTm"]),
        "days"
      );
      baseBefore["Base.cTmSysCde"] = tm;
      tmDay.value = tm;
      opertaor.getTableRefByKey("insrnc").setFormValue(baseBefore);
      //保单基本信息初始化
      const baseobj = {};
      baseobj["Base.cRenewMrk"] = "0";
      opertaor.getTableRefByKey("plyBase").setFormValue(baseobj);
      //承保信息初始化
      const baseafterobj = {};
      baseafterobj["Base.cRatioTyp"] = "3";
      baseafterobj["Base.cInstMrk"] = "0";
      baseafterobj["Base.cDisptSttlCde"] = "D";
      baseafterobj["Applicant.cStkMrk"] = "0";
      baseafterobj["Applicant.cCustRiskRank"] = "925104";
      baseafterobj["Insured.cStkMrk"] = "0";
      baseafterobj["Insured.cCustRiskRank"] = "925104";
      opertaor.getTableRefByKey("base").setFormValue(baseafterobj);
      opertaor.getTableRefByKey("applicant").setFormValue(baseafterobj);
      opertaor.getTableRefByKey("insured").setFormValue(baseafterobj);
    });
  } else if (props.param.pageType === "edit") {
    const cAppNo = props.param.cAppNo;
    loadAppPlyInfo(cAppNo);
    bthList.value.push(
      createFreeButtonBase({
        label: "保存模板",
        type: "primary",
        func: () => {},
      }),
      createFreeButtonBase({
        label: "复制出单",
        type: "primary",
        func: () => {},
      }),
      createFreeButtonBase({
        label: "保费计算",
        type: "primary",
        id: "btn010101",
        func: () => {
          calcPremium();
        },
      }),
      createFreeButtonBase({
        label: "提交",
        type: "primary",
        id: "btn010102",
        func: () => {
          savePlyInfo();
        },
      }),
      createFreeButtonBase({
        label: "申请核保",
        type: "primary",
        id: "btn010103",
        func: () => {
          submitToUndrFn();
        },
      }),
      createFreeButtonBase({
        label: "发票信息",
        type: "primary",
        func: () => {},
      }),
      createFreeButtonBase({
        label: "反洗钱扩展信息",
        type: "primary",
        func: () => {},
      })
    );
  } else if (props.param.pageType === "PLY_UW") {
      const cAppNo = props.param.cAppNo;
      loadAppPlyInfo(cAppNo);
      bthList.value.push(
          createFreeButtonBase({
              label: "提交",
              type: "primary",
              id: 'btnUdr',
              func: () => {
                  underwrite.value?.validate().then((isValid) => {
                      if (isValid) {
                          submitUnderwritingFn()
                      } else {
                          ElMessage.error("请填写必填项");
                      }
                  });
              },
          }),
          createFreeButtonBase({
              label: "费用信息",
              type: "primary",
              id: "modFee",
              func: () => {
                  dzmodal
                      .open(CostInformation, { type: "Issuer", data: {} })
                      .then((res: any) => {
                          if (res.type === "ok") {
                          }
                      });
              },
          }),
          createFreeButtonBase({
              label: "历次批单",
              type: "primary",
              id: 'preOrder',
              func: () => {
                  dzmodal
                      .open(PreviousdrOpnList, { type: "Issuer", data: {} })
                      .then((res: any) => {
                          if (res.type === "ok") {
                          }
                      });
              },
          }),
          createFreeButtonBase({
              label: "任务痕迹",
              func: () => {
                  dzmodal
                      .open(CostInformation, { type: "Issuer", data: {} })
                      .then((res: any) => {
                          if (res.type === "ok") {
                          }
                      });
              },
          }),
      );
  }else if (props.param.pageType === "readonly") {
    // 查询数据
    const getAppPlyInfoRes = await getAppPlyInfoByAppNo({
      CAppNo: props.param.cAppNo,
    });
    console.log("getAppPlyInfoRes", getAppPlyInfoRes);
    const data = getAppPlyInfoRes.data;
    nextTick(() => {
      console.log(data);
      opertaor.setDataAll(data);
      // set
      // page.getRefTab("base").setFormValue(lowercaseKeys(data["base"]));
      // let cvrgList = data["cvrg"];
      // cvrgList = cvrgList.map((item) => {
      //   item.nTgtNumFld8 = 10;
      //   return lowercaseKeys(item);
      // });
      // page.getRefTab("cvrg").setFormValue(cvrgList);
      // page.getRefTab("tgt").setFormValue(lowercaseKeys(data["tgt"]));
      // page
      //   .getRefTab("applicant")
      //   .setFormValue(lowercaseKeys(data["applicant"]));
    });
  }

  bthList.value.push(
    createFreeButtonBase({
      label: "返回",
      func: () => {
        history.back();
      },
    })
  );
}
const getCAppNoFun = () => {
  const res = {
    cProdNo: props.param.cProdNo,
    cDptCde: props.param.cDptCde,
    icVchTyp: "POLICY_NUMBER",
  };
  generatelSingleNo(res).then((res) => {
    console.log("generatelSingleNo-res", res);
    if (res["code"] == "200") {
      opertaor.getTableRefByKey("plyBase").setValue("Base.cAppNo", res["data"]);
    }
  });
};
/**
 * 加载投保单明细
 */
const loadAppPlyInfo = (CAppNo) => {
  const res = { CAppNo: CAppNo };
  getAppPolicy(res).then((res) => {
    console.log("投保单明细getAppPolicy-res", res);
    if (res["code"] == "200") {
      const ops = opertaor.convertData(res);
      console.log("转换的数据", ops);
      ElMessage.success(res.msg);
      opertaor.setDataAll(ops);
    }
  });
};
/**
 * 获取button
 * @param id
 */
const getBtn = (id) => {
  if (tempFindBtn.length === 0) {
    for (const btnArr of bthList.value) {
      tempFindBtn.push(btnArr);
    }
  }
  return tempFindBtn.find((item) => {
    return id === item.id;
  });
};
/**
 * 投保保费计算
 */
const calcPremium = () => {
  const btn = getBtn("btn010101");
  btn.loading = true;
  const res = opertaor.getDataAll();
  res["user"] = user;
  res["plyBase"]["Base.cDptCde"] = props.param.cDptCde;
  res["plyBase"]["Base.cProdNo"] = props.param.cProdNo;
  console.log(res);
  if (res["cvrg"].items.length == 0) {
    ElMessage.error("请录入条款信息");
    btn.loading = false;
    return;
  }
  appCalc(res).then((res) => {
    btn.loading = false;
    console.log("appCalc-res", res);
    if (res["code"] == "200") {
      const ops = opertaor.convertData(res);
      console.log("保费计算转换的数据", ops);
      ElMessage.success(res.msg + "保费为：" + ops["base"]["Base.nPrm"]);
      opertaor.setDataAll(ops);
      nAmt.value = ops["base"]["Base.nAmt"];
      nPrm.value = ops["base"]["Base.nPrm"];
      tmDay.value = ops["base"]["Base.cTmSysCde"];
      const payInfo = setPayInfo(ops["base"], ops["applicant"]);
      console.log("生成缴费计划内容", payInfo);
      opertaor.getTableRefs()["payinfo"].setFormValue(payInfo);
    } else {
      ElMessage.error(res.msg);
    }
    // ElMessage.success(res.msg);
    // history.back();
  });
};
const setPayInfo = (base, applicant) => {
  const payList = [];
  const pay = {};
  pay["Pay.nTms"] = 1;
  if (applicant) {
    pay["Pay.cPayorCde"] = applicant["Applicant.cAppCde"];
    pay["Pay.cPayorNme"] = applicant["Applicant.cAppNme"];
  } else {
    pay["Pay.cPayorCde"] = "";
    pay["Pay.cPayorNme"] = "";
  }
  pay["Pay.nPayablePrm"] = base["Base.nPrm"];
  pay["Pay.tPayBgnTm"] = base["Base.tAppTm"];
  pay["Pay.tPayEndTm"] = base["Base.tInsrncBgnTm"];
  pay["Pay.nOwnPrm"] = base["Base.nPrm"];
  payList.push(pay);
  return payList;
};
/**
 * 投保申请核保
 */
const submitToUndrFn = () => {
  const btn = getBtn("btn010103");
  btn.loading = true;
  const res = {};
  console.log(opertaor.getTableRefByKey("plyBase").getFromValue());
  const base = opertaor.getTableRefByKey("plyBase").getFromValue();
  res["user"] = user;
  res["appNo"] = base["Base.cAppNo"];
  console.log(res);
  submitToUndr(res).then((res) => {
    btn.loading = false;
    console.log("submitToUndr-res", res);
    // ElMessage.success(res.msg);
    // history.back();
    if (res["code"] == "200") {
      ElMessage.success(res.msg);
    } else {
      ElMessage.error(res.msg);
    }
  });
};

const savePlyInfo = () => {
  const btn = getBtn("btn010102");
  btn.loading = true;
  const res = opertaor.getDataAll();
  res["user"] = user;
  res["plyBase"]["Base.cDptCde"] = props.param.cDptCde;
  res["plyBase"]["Base.cProdNo"] = props.param.cProdNo;
  console.log(res);
  if (res["cvrg"].items.length == 0) {
    ElMessage.error("请录入条款信息");
    btn.loading = false;
    return;
  }
  saveAppPlyInfo(res).then((res) => {
    console.log("saveAppPlyInfo-res", res);
    btn.loading = false;
    if (res["code"] == "200") {
      const ops = opertaor.convertData(res);
      console.log("转换的数据", ops);
      ElMessage.success(res.msg);
      opertaor.setDataAll(ops);
    } else {
      ElMessage.error(res.msg);
    }
    // ElMessage.success(res.msg);
    // history.back();
  });
};
/**
 * 核保信息 提交
 */
const submitUnderwritingFn = () => {
  // const btn = getBtn("btnUdr");
  // btn.loading = true;
  const res = underwrite.value.getFromValue();
  res["user"] = user;
  res["user"]['opRelCde'] = '10030892';
  res["appNo"] = props.param.cAppNo;
  res["taskId"] = props.param.taskId;
  res["appTyp"] = props.param.bsType;
  res["undrMrk"] = res["cUndrMrk"];
  res["cAntiLnderRisk"] ='0';//关联交易确认
  res["cIsTransaction"] ='0';//反洗钱风险
  res["CRiBesprakMrk"] ='0'; // 预约分保标志
  res["backUndrDptCde"] =null;// 退回指定核保级别机构编码
  res["backUndrClsCde"] =null;// 退回指定核保级别编码
  res["backUndrDptCnm"] =null;// 退回指定核保人员名称
  console.log(res);
  let submitUnder;
    if (props.param.bsType === 'A') { submitUnder = submitUnderwriting(res); }
    if (props.param.bsType === 'E') submitUnder = submitUnderwritingEdr(res);

    submitUnder.then((res) => {
    console.log("submitUnderwriting-res", res);
    // btn.loading = false;
    if (res["code"] == "200") {
      // const ops = opertaor.convertData(res);
      // console.log("转换的数据", ops);
      ElMessage.success(res.msg);
      // opertaor.setDataAll(ops);
    } else {
      ElMessage.error(res.msg);
    }
      // ElMessage.success(res.msg);
      // history.back();
  });
};

// 将对象的属性首字母转换为小写
function lowercaseKeys<T extends object>(
  obj: T
): { [K in keyof T as Uncapitalize<string & K>]: T[K] } {
  // 创建一个新的对象
  const newObj = {} as { [K in keyof T as Uncapitalize<string & K>]: T[K] };
  // 遍历原始对象的属性
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      // 将属性名的首字母转换为小写，并赋值
      const newKey = (key.charAt(0).toLowerCase() +
        key.slice(1)) as Uncapitalize<string & K>;
      newObj[newKey] = obj[key];
    }
  }
  return newObj;
}

opertaor.setFatherPage({
  currentIndex: currentIndex,
  lowercaseKeys: lowercaseKeys,
});
</script>

<style scoped>
.bottom-items {
  height: 50px;
  background-color: #fff;
  display: flex;
  justify-content: end;
  align-items: center;
  padding-right: 20px;
}
.NavigaList_card {
  display: inline-block; /* 设置为行内块元素 */
  vertical-align: middle; /* 垂直居中 */
}
.card_ {
  margin-bottom: 10px;
}

/* 用于包含行内块元素的容器 */
.navi_container {
  line-height: 50px; /* 与容器的高度相同，实现垂直居中 */
}
:deep(.el-main) {
  padding: 10px 10px 10px 10px;
}
.publicStyle {
  color: red;
}
</style>
