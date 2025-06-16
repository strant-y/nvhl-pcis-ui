<template>
  <div>
    <el-form ref="templateRef" :model="termdata" :inline-message="true">
      <el-card class="cvrg-info">
        <template #header>
          <div class="cvrg-hearder">
            <el-row style="margin-top: 5px;">
              <el-col :span="10">
                <div style="display: flex; align-items: center;">
                  <a style="margin-right: 5px" @click="showData = !showData">
                    <el-icon v-if="!showData"><ArrowRightBold /></el-icon>
                    <el-icon v-if="showData"><ArrowDownBold /></el-icon>
                  </a>

                  <el-tag :type="term.cRdrTyp === '0' ? 'danger' : 'success'">{{
                    term.cRdrTyp === "0" ? "主" : "附加"
                  }}</el-tag>
                  <template v-if="termdata['Term.cCancelMrk'] === '1'">
                    <el-badge value="退" class="item">
                      <el-tag type="warning">{{ term.cNmeCn }}</el-tag>
                    </el-badge>
                  </template>
                  <template v-else>
                    <el-tag type="warning"  style="margin-right: 8px;">{{ term.cNmeCn }}</el-tag>
                    <el-tooltip content="下载条款" placement="top">
                      <rt-icon :item="{ icon: 'term' }" />
                    </el-tooltip>
                  </template>
                </div>
              </el-col>
              <el-col :span="12">
                <el-row :gutter="20">
                  <template v-for="(item, k) in termFactormap" :key="k">
                    <el-col :span="11" v-if="item.cPorpShowtitle === '1'">
                      <el-form-item
                        :label="item.title"
                        class="show_title"
                        :prop="item.prop"
                        :rules="isrequired(item) ? getRequired() : undefined"
                      >
                        <from-item
                          v-model="termdata[item.prop]"
                          @update:modelValue="update()"
                          :item="item"
                        />
                      </el-form-item>
                    </el-col>
                  </template>
                </el-row>
              </el-col>
              <el-col :span="2">
                <rtButton
                  v-if="!btnItem.delete.hidden"
                  @click="
                    () => {
                      emit('delete', termdata);
                    }
                  "
                  :item="btnItem.delete"
                />
              </el-col>
            </el-row>
          </div>
        </template>

        <div v-if="showData">
          <template v-if="termTitleConf.cFactorTabType === 'grid'">
            <table style="width: 100%">
              <thead>
                <tr class="table-title">
                  <th>{{ termTitleConf.cFactorTabTitle }}</th>
                  <th>{{ termTitleConf.cFactorTabValue }}</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="(item, k) in termFactormap" :key="k">
                  <tr v-if="item.cPorpShowtitle !== '1'">
                    <td>
                      <el-text
                        v-if="isrequired(item)"
                        class="mx-1"
                        style="margin-right: 2px"
                        type="danger"
                        >*</el-text
                      >
                      <span>{{ item.title }}</span>
                    </td>
                    <td>
                      <el-form-item
                        :rules="isrequired(item) ? getRequired() : undefined"
                        :prop="item.prop"
                      >
                        <from-item
                          v-model="termdata[item.prop]"
                          @update:modelValue="update()"
                          :item="item"
                        />
                      </el-form-item>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </template>
          <template v-else-if="termTitleConf.cFactorTabType === 'table'">
            <table style="width: 100%">
              <thead>
                <tr class="table-title">
                  <template v-for="(item, k) in termFactormap" :key="k">
                    <th v-if="item.cPorpShowtitle !== '1'" :style="{ width: item.cPropHeight?item.cPropHeight+'px':null }">
                      {{ item.title }}
                    </th>
                  </template>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <template v-for="(item, k) in termFactormap" :key="k">
                    <td v-if="item.cPorpShowtitle !== '1'">
                      <el-form-item
                        :rules="isrequired(item) ? getRequired() : undefined"
                        :prop="item.prop"
                      >
                        <from-item
                          v-model="termdata[item.prop]"
                          @update:modelValue="update()"
                          :item="item"
                        />
                      </el-form-item>
                    </td>
                  </template>
                </tr>
              </tbody>
            </table>
          </template>
          <template v-else>
            <app-free-edit
              :freeEditConfig="formconfig1"
              ref="termRef"
              @updateDatas="update"
            />
          </template>
          <template v-for="(ginfo, gk) in groupInfo" :key="gk">
            <el-row>
              <el-col :span="22">
                <a
                  style="margin-right: 5px"
                  @click="ginfo.hidden = !ginfo.hidden"
                >
                  <el-icon v-if="ginfo.hidden"><ArrowRightBold /></el-icon>
                  <el-icon v-if="!ginfo.hidden"><ArrowDownBold /></el-icon>
                </a>
                <span>
                  {{ ginfo.cGroupTitle }}
                </span>
              </el-col>
            </el-row>
            <el-row v-if="!ginfo.hidden">
              <table style="width: 100%">
                <thead>
                  <tr class="table-title">
                    <th
                      v-for="col in getColinfo(ginfo.cGroupId)"
                      :key="col.cColId"
                      :width="col.cColWidth ? col.cColWidth : null"
                    >
                      {{ col.cColTitle }}
                    </th>
                    <th v-for="v in extermConf" :key="v.c_pk_id">
                      {{ v.title }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <template v-if="groupconf[ginfo.cGroupId]">
                    <template
                      v-for="(riskdata, k, ri) in groupconf[ginfo.cGroupId]
                        .riskList"
                      :key="k"
                    >
                      <template v-if="riskdata.maxNum > 0">
                        <tr
                          v-for="n in riskdata.maxNum"
                          :key="`${ginfo.cGroupId}-${k}-${n}`"
                        >
                          <template
                            v-for="colinfo in riskdata.col"
                            :key="`${ginfo.cGroupId}-${k}-${n}-${colinfo.cColId}`"
                          >
                            <template
                              v-if="
                                riskdata.rowConfig[colinfo.cColId] &&
                                riskdata.rowConfig[colinfo.cColId][n - 1]
                              "
                            >
                              <td
                                :rowspan="
                                  riskdata.rowConfig[colinfo.cColId][n - 1]
                                    ?.cPorpType === 'rowspan'
                                    ? riskdata.maxNum
                                    : null
                                "
                                :class="{
                                    'custom-indent':riskdata.rowConfig[colinfo.cColId]?.[n - 1]?.cPorpType === 'text' &&  riskdata.rowConfig[colinfo.cColId]?.[n - 1]?.factorItem?.Indent === '1',
                                 }"
                              >
                                <template
                                  v-if="
                                    riskdata.rowConfig[colinfo.cColId][n - 1]
                                      .cPorpType === 'text'
                                  "
                                >
                                  <el-text
                                    v-if="
                                      isrequired(
                                        riskdata.rowConfig[colinfo.cColId][
                                          n - 1
                                        ].factorItem
                                      )
                                    "
                                    class="mx-1"
                                    style="margin-right: 2px"
                                    type="danger"
                                    >*</el-text
                                  >
                                  <span
                                    >{{
                                      riskdata.rowConfig[colinfo.cColId][n - 1]
                                        .factorItem.title
                                    }}
                                  </span>
                                </template>
                                <template v-else>
                                  <el-form-item
                                    :error="
                                      showError(
                                        riskdata.rowConfig[colinfo.cColId][
                                          n - 1
                                        ],
                                        riskList[
                                          riskdata.rowConfig[colinfo.cColId][
                                            n - 1
                                          ].cRiskNo
                                        ][
                                          riskdata.rowConfig[colinfo.cColId][
                                            n - 1
                                          ].factorItem?.prop
                                        ]
                                      )
                                    "
                                  >
                                    <from-item
                                      v-model="
                                        riskList[
                                          riskdata.rowConfig[colinfo.cColId][
                                            n - 1
                                          ].cRiskNo
                                        ][
                                          riskdata.rowConfig[colinfo.cColId][
                                            n - 1
                                          ].factorItem?.prop
                                        ]
                                      "
                                      @update:modelValue="update()"
                                      :item="
                                        riskdata.rowConfig[colinfo.cColId][
                                          n - 1
                                        ].factorItem
                                      "
                                    />
                                  </el-form-item>
                                </template>
                              </td>
                            </template>
                          </template>
                          <template v-if="n === 1 && ri === 0">
                            <template v-for="v in extermConf" :key="v.c_pk_id">
                              <td :rowspan="groupconf[ginfo.cGroupId].sumMax">
                                <el-form-item
                                  :rules="
                                    isrequired(v) ? getRequired() : undefined
                                  "
                                  :prop="v.prop"
                                >
                                  <from-item
                                    v-model="termdata[v.prop]"
                                    @update:modelValue="update()"
                                    :item="v"
                                  />
                                </el-form-item>
                              </td>
                            </template>
                          </template>
                        </tr>
                      </template>
                    </template>
                  </template>
                </tbody>
              </table>
            </el-row>
          </template>
        </div>
      </el-card>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { getTRFactorJson } from "@/api/prod";
import {
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import { formInit } from "@/shared/from-init";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { terConfig } from "@/store/modules/term-config";
import { useValidator } from "@/typings/useValidator";
const templateRef = ref();
const opertaor = dataOpertaor();
const pageparam = opertaor.getParam();
const terconfig = terConfig();
const { getRules } = useValidator();
const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  disabledFlag: {
    type: Boolean,
    default: false,
  },
  faters: {
    type: Object,
  },
});

const emit = defineEmits(["update:modelValue", "delete"]);
const termRef = ref<AppFreeEditMethod | null>(null);
const groupconf = ref<{ [key: string]: any }>({}); // 渲染数据分离,解决因为数据变更,导致触发重新渲染

const termdata = ref<{ [key: string]: any }>({});
const riskList = ref<{ [key: string]: any }>({});

const pageInit = ref(false);

const btnItem = ref<{ [key: string]: { [key: string]: any } }>({
  delete: {
    label: "删除",
  },
});

function update() {
  let newData;

  if (
    termTitleConf.value.cFactorTabType === "grid" ||
    termTitleConf.value.cFactorTabType === "table"
  ) {
    newData = termdata.value;
  } else {
    newData = termRef.value?.getFromValue();
  }
  const fromc = termFactormap.value?.filter(
    (v: any) => v.cPorpShowtitle === "1"
  );
  if (fromc && fromc.length > 0) {
    // 将标题数据,回填到数据组中
    fromc.forEach((v: any) => {
      newData[v.prop] = termdata.value[v.prop];
    });
  }
  // const list = JSON.parse(JSON.stringify(riskList.value));
  let ril: any[] = [];
  Object.keys(riskList.value).forEach((k: any) => {
    ril.push(riskList.value[k]);
  });
  newData.riskList = ril;
  emit("update:modelValue", newData);
}
function initData(data: any) {
  const newData = JSON.parse(JSON.stringify(data));
  // 缓存条款数据
  const termData = JSON.parse(JSON.stringify(data));
  termData.riskList = null;
  termdata.value = termData;
  // 缓存条款责任数据
  let riskData: { [key: string]: any } = {};
  newData.riskList?.forEach((v: any) => {
    let cRiskNo = v["TermRisktgt.cLiabCode"];
    riskData[cRiskNo] = {
      ...v,
    };
  });
  riskList.value = riskData;
  nextTick(() => {
    if (
      termTitleConf.value.cFactorTabType !== "grid" &&
      termTitleConf.value.cFactorTabType !== "table"
    ) {
      termRef.value?.setFormValue(termdata.value, true);
    }
  });
}

const groupInfo = ref<{ [key: string]: any }>({});
const colInfo = ref([]);
const factormap = ref<{ [key: string]: any }>({});
const termFactormap = ref([]);
const collist = ref([]);
const term = ref<{ [key: string]: any }>({});
const termTitleConf = ref<{ [key: string]: any }>({});
const extermConf = ref<any>([]); // 个性化扩展槽

const formconfig1 = reactive(
  createAppFreeEditConfig({
    fromUi: {
      cols: 2,
      showTitleBar: false,
    },
  })
);

function getRequired() {
  return getRules("required", {});
}

const showData = ref(true);
const showRiskInfo = ref(true);
const foldRiskInfo = ref(true);
const showRequried = ref(false);

function getColinfo(groupId: string) {
  return colInfo.value.filter((v: any) => v.cGroupId === groupId);
}

function getcolConfig(groupId: string, riskNo: string) {
  const conf = {
    col: getcol(groupId),
    maxNum: maxNum(groupId, riskNo),
    rowConfig: getRowConfig(groupId, riskNo),
  };
  return conf;
}

function getRisk(groupId: string) {
  let risklist: { [key: string]: any } = {};
  const risks = riskList.value || {}; // 初始化为一个空对象以防 undefined
  Object.keys(risks).forEach((riskNo) => {
    risklist[riskNo] = {
      ...getcolConfig(groupId, riskNo),
    };
  });
  return risklist;
}
function getcol(groupId: string) {
  return colInfo.value.filter((v: any) => v.cGroupId === groupId);
}

function getRowConfig(groupId: string, riskNo: string) {
  const all = collist.value.filter(
    (v: any) => v.cGroupId === groupId && v.cRiskNo === riskNo
  );
  const tgt = opertaor.getTableRefByKey("tgt");
  const colMap = all.reduce(
    (acc, item: { [key: string]: any }) => {
      const key = item["cColId"];
      if (!acc[key]) {
        acc[key] = [];
      }

      let colconfig = Object.assign({}, item);
      colconfig["factorItem"] = getProp(item);
      // 040002产品特殊处理，判断 cDeterminingMethod ,显示需要的列
      if (pageparam.cProdNo === "040002") {
        let deter = null;
        if (tgt) {
          deter = tgt.getValue("Tgt.cDeterminingMethod");
        }
        if (deter && deter === "1") {
          if (colconfig["cRiskNo"] === "042225") {
            if (
              colconfig["factorItem"]["prop"] !== "TermRisktgt.nPersonDeath"
            ) {
              acc[key].push(colconfig);
            }
          } else {
            acc[key].push(colconfig);
          }
        } else if (deter && deter === "0") {
          if (colconfig["cRiskNo"] === "042225") {
            if (
              colconfig["factorItem"]["prop"] !== "TermRisktgt.nDeathLimit" &&
              colconfig["factorItem"]["prop"] !== "TermRisktgt.nDisabilityLimit"
            ) {
              acc[key].push(colconfig);
            }
          } else {
            acc[key].push(colconfig);
          }
        } else {
          acc[key].push(colconfig);
        }
      } else {
        acc[key].push(colconfig);
      }

      return acc;
    },
    {} as { [key: string]: any[] }
  );
  return colMap;
}

function maxNum(groupId: string, riskNo: string) {
  let sumKey: { [key: string]: number } = {};
  collist.value.forEach((v) => {
    if (v["cGroupId"] === groupId && v["cRiskNo"] === riskNo) {
      const colId = v["cColId"];
      if (sumKey[colId]) {
        sumKey[colId] += 1;
      } else {
        sumKey[colId] = 1;
      }
    }
  });
  let max = Math.max(...Object.values(sumKey));
  return max;
}

const getText = computed(() => {
  return (col: any) => {
    const factorId = col["cFactorId"];
    const fact = factormap.value[factorId];
    return fact.title;
  };
});

function getProp(col: any) {
  const factorId = col["cFactorId"];
  let fact: any = JSON.parse(JSON.stringify(factormap.value[factorId]));
  // 将方法回填到item中
  Object.keys(factormap.value[factorId]).forEach((k: any) => {
    if (factormap.value[factorId][k]["func"]) {
      fact[k]["func"] = factormap.value[factorId][k]["func"];
    }
    if (factormap.value[factorId][k]["tableClick"]) {
      fact[k]["tableClick"] = factormap.value[factorId][k]["tableClick"];
    }
  });
  fact.disabled = col["cPorpDisabled"];
  fact.required = col["cPorpRequired"];
  fact.Indent = col["cPropIndent"];  // 缩进
  return fact;
}
/*
条款下载
*/
function downloadTerm() {
  const clauseLink = termdata.value["Term.cClauseLink"];
  if (!clauseLink) {
    ElMessage.warning("条款链接为空，无法下载");
    return;
  }

}

onMounted(async () => {
  initData(props.modelValue);
  dataInit();
});

watch(() => props.modelValue, (newv,oldv)=>{
  initData(newv);
  dataInit();
});

function dataInit() {
  let queryList: { [k: string]: any }[] = [];
  let queryKey = props.modelValue["Term.cClauseCode"];
  props.modelValue.riskList.forEach((item: any) => {
    let p: { [k: string]: any } = {};
    Object.keys(item).forEach((key) => {
      const v = item[key];
      let newKey = "";
      if (key.indexOf(".")) {
        newKey = key.split(".")[1];
      } else {
        newKey = key;
      }
      if (newKey === "cLiabCode") {
        p["cRiskNo"] = v;
      } else {
        p[newKey] = v;
      }
      queryKey += v;
    });
    queryList.push(p);
  });
  const param = {
    cTermNo: props.modelValue["Term.cClauseCode"],
    riskList: queryList,
  };
  const d = terconfig.getConfig(queryKey);
  if (d) {
    collist.value = d.collist;
    factormap.value = d.factormap;
    colInfo.value = d.colInfo;
    groupInfo.value = d.groupInfo;
    term.value = d.term;
    termFactormap.value = d.termFactormap;
    methodLink(termFactormap.value);
    initshowConfig();
    const fromc = termFactormap.value?.filter(
      (v: any) => v.cPorpShowtitle !== "1"
    );
    formconfig1.fromSchema = fromc;
    if (d.termTitleConf?.CCnm) {
      termTitleConf.value = JSON.parse(d.termTitleConf.CCnm);
    }
    if (props.disabledFlag) {
      setDisabledAll();
    }
  } else {
    getTRFactorJson(param).then((res: any) => {
      const { code, data, msg } = res;
      if (200 === code) {
        collist.value = data.data.collist;
        factormap.value = data.data.factormap;
        colInfo.value = data.data.colInfo;
        groupInfo.value = data.data.groupInfo;
        term.value = data.data.term;
        termFactormap.value = data.data.termFactormap;

        methodLink(termFactormap.value);
        initshowConfig();
        const fromc = termFactormap.value?.filter(
          (v: any) => v.cPorpShowtitle !== "1"
        );
        formconfig1.fromSchema = fromc;
        if (data.data.termTitleConf?.CCnm) {
          termTitleConf.value = JSON.parse(data.data.termTitleConf.CCnm);
        }
        terconfig.addConfig(queryKey, data.data);
      } else {
        ElMessage.error(msg);
      }
      if (props.disabledFlag) {
        setDisabledAll();
      }
    });
  }
}

function initshowConfig() {
  termFactormap.value.forEach((item) => { 
    item.required = isrequired(item);
    item.disabled = isdisabled(item);
  });
  let grouplist: { [k: string]: any } = {};
  if (groupInfo.value) {
    exChangeFunc();
    Object.keys(groupInfo.value).forEach((g: any) => {
      const gt = groupInfo.value[g];
      let ngdata: { [key: string]: any } = {
        cGroupId: gt.cGroupId,
        cGroupName: gt.cGroupName,
        cGroupType: gt.cGroupType,
        riskList: getRisk(gt.cGroupId),
      };
      let sumMax = 0;
      Object.keys(ngdata.riskList).forEach((r: any) => {
        sumMax += ngdata.riskList[r].maxNum;
      });
      ngdata["sumMax"] = sumMax;
      grouplist[g] = ngdata;
    });
  }
  groupconf.value = grouplist;
}

/**
 * 个性化处理,对一些特殊化的信息内容展示
 * @returns
 */
function exChangeFunc() {
  const data: { [key: string]: any } = opertaor.getDataAll();
  extermConf.value = Object.assign({});
  if (pageparam.cProdNo === "043009") {
    if (data["tgt"]["Tgt.cInsuranceMethod"]) {
      if (data["tgt"]["Tgt.cInsuranceMethod"] !== "613001") {
        if (colInfo.value && colInfo.value.length > 0) {
          const r = colInfo.value.filter(
            (r) =>
              r["cColTitle"] !== "分项费率" && r["cColTitle"] !== "分项保费"
          );
          colInfo.value = r;
        }

        const ex = termFactormap.value.filter(
          (r) =>
            r["prop"] === "Term.nRateVal" || r["prop"] === "Term.nInsuranceFee"
        );

        extermConf.value = ex;
      }
      const term = termFactormap.value.filter((r) => {
        let s = r["prop"] !== "Term.nRateVal";
        if (data["tgt"]["Tgt.cInsuranceMethod"] !== "613001") {
          s = s && r["prop"] !== "Term.nInsuranceFee";
        }
        return s;
      });
      termFactormap.value = term;
    } else {
      const r = colInfo.value.filter(
        (r) => r["cColTitle"] !== "分项费率" && r["cColTitle"] !== "分项保费"
      );
      colInfo.value = r;

      const term = termFactormap.value.filter(
        (r) => r["prop"] !== "Term.nRateVal"
      );
      termFactormap.value = term;
    }
  }
  if (pageparam.cProdNo === "040002") {
    if (data["tgt"]["Tgt.cDeterminingMethod"]) {
      if (data["tgt"]["Tgt.cDeterminingMethod"] === "0") {
        const col = colInfo.value.filter((r: any) => r.cColTitle !== "单位");
        colInfo.value = col;
      }
    }
  }
}

function showError(conf: any, value: any) {
  if (conf["cPorpRequired"] === "1") {
    if ((value === null || value === undefined) && showRequried.value) {
      return "该项为必填项";
    }
  }
  return null;
}
async function validate() {
  // 进行责任验证
  let validate = true;
  collist.value?.forEach((col: any) => {
    const fact = factormap.value[col["cFactorId"]];
    const v = riskList.value[col["cRiskNo"]][fact["prop"]];
    if (col["cPorpRequired"] === "1") {
      if (v === "" || v === null || v === undefined) {
        validate = false;
      }
    }
  });

  if (!validate) {
    showRequried.value = true;
  } else {
    showRequried.value = false;
  }
  // 进行条款数据验证
  const p: Promise<any> = new Promise((resolve) => {
    templateRef.value.validate((valid: boolean, fields: any) => {
      if (valid) {
        resolve(true);
      } else {
        resolve(fields);
      }
    });
  });

  const res = await p;
  return (res === true ? true : false) && validate;
}
function setDisabledAll() {
  if(pageparam.cEdrType && !props.modelValue['Term.cRowId']){
    // 批改新增条款时，不禁用
    return ;
  }
  const undis = props.faters?.getndisAbleConfig(
    props.modelValue["Term.cClauseCode"]
  ); // 条款要素批改项配置信息
  const unbut = props.faters?.getndisAbleConfig("null"); //公共按钮类批改项配置信息
  // 禁用表单信息列
  if (
    termTitleConf.value.cFactorTabType !== "grid" &&
    termTitleConf.value.cFactorTabType !== "table"
  ) {
    if (formconfig1.fromSchema && formconfig1.fromSchema.length > 0) {
      formconfig1.fromSchema.forEach((item: any) => {
        item.disabled = true;
        if (undis && undis.length > 0) {
          const t = undis.find((un: any) => un["cEdrItem"] === item["prop"]);
          if (t) {
            item.disabled = false;
          }
        }
      });
    }
  }
  if (termFactormap && termFactormap.value.length > 0) {
    termFactormap.value.forEach((item: any) => {
      item.disabled = true;
      if (undis && undis.length > 0) {
        const t = undis.find((un: any) => un["cEdrItem"] === item["prop"]);
        if (t) {
          item.disabled = false;
        }
      }
    });
  }
  // 禁用扩展表单信息列
  if (extermConf && extermConf.value.length > 0) {
    extermConf.value.forEach((item: any) => {
      item.disabled = true;
      if (undis && undis.length > 0) {
        const t = undis.find((un: any) => un["cEdrItem"] === item["prop"]);
        if (t) {
          item.disabled = false;
        }
      }
    });
  }
  Object.keys(btnItem.value).forEach((k: any) => {
    btnItem.value[k].hidden = true;
    if (unbut && unbut.length > 0) {
      const t = unbut.find((un: any) => un["cEdrItem"] === k + "_btn");
      if (k) {
        btnItem.value[k].hidden = false;
      }
    }
  });
  // 禁用责任表单项
  Object.keys(groupconf.value).forEach((g: any) => {
    const gt = groupconf.value[g];
    Object.keys(gt.riskList).forEach((r: any) => {
      const rowconfig = gt.riskList[r].rowConfig;
      Object.keys(rowconfig).forEach((rc: any) => {
        const row = rowconfig[rc];
        if (row && row.length > 0) {
          row.forEach((ri: any) => {
            ri.factorItem.disabled = true;
            if (undis && undis.length > 0) {
              const t = undis.find(
                (un: any) => un["cEdrItem"] === ri.factorItem["prop"]
              );
              if (t) {
                ri.factorItem.disabled = false;
              }
            }
          });
        }
      });
    });
  });
}

function isrequired(i: any) {
  if (i.required === "1" || i.required === 1 || i.required === true ||
    i.cPropRequired === "1" || i.cPropRequired === 1 || i.cPropRequired === true 
  ) {
    return true;
  }
  return false;
}
function isdisabled(i: any) {
  if (i.disabled === "1" || i.disabled === 1 || i.disabled === true ||
    i.cPropDisabled === "1" || i.cPropDisabled === 1 || i.cPropDisabled === true 
  ) {
    return true;
  }
  return false;
}

/**
 * 方法连接绑定
 */
function methodLink(items: any) {
  if (items && items.length > 0) {
    for (const i in items) {
      if (items[i]["func"] && typeof items[i]["func"] === "string") {
        items[i]["func"] = methodMap[items[i]["func"]];
      }
    }
  }
}

const methodMap = {
  unifiedPremiumChange: (val: any) => {
    if (pageparam.cProdNo === "040006") {
      termFactormap.value.forEach((item: any) => {
        if (item["prop"] === "Term.nPersonPremium") {
          if (val === "0") {
            item.disabled = true;
          } else {
            item.disabled = false;
          }
        }
        if (item["prop"] === "Term.nDoctorFee" || item["prop"] === "Term.nNurseFee") {
          if (val === "1") {
            item.disabled = true;
          } else {
            item.disabled = false;
          }
        }
      });
    }
  },
};

function setCancel(){
  termdata.value['Term.cCancelMrk'] = '1';
  update();
}

defineExpose({
  dataInit,
  setDisabledAll,
  setCancel,
  validate,
});
</script>
<style lang="scss" scoped>
.cvrg-info {
  :deep(.el-card__header) {
    background-color: #eff3f5;
    padding: 5px 10px;
  }
  :deep(.el-card__body) {
    padding: 5px 10px;
  }
}
.table-title {
  background-color: #e6e6e6;
}
table {
  border-collapse: collapse; /* 合并边框 */
  width: 100%;
}
.show_title {
  margin-bottom: 0px;
}
.custom-indent {
  padding-left: 30px; /* 空三格 */
}

.custom-left {
  text-align: left;
}
table,
th,
td {
  border: 1px solid #e2e2e2; /* 设置边框样式 */
  padding: 2px;
  text-align: left;
}
::v-deep .el-form-item {
  margin-bottom: 0px !important; /* 使内容显示更近紧促 */
}
</style>
