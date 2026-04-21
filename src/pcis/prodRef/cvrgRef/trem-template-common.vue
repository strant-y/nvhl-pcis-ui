<template>
  <div>
    <el-form ref="templateRef" :model="termdata" :inline-message="true">
      <el-card class="cvrg-info">
        <template #header v-if="effectiveShowConf.showHeader">
          <div class="cvrg-hearder">
            <el-row>
              <el-col :span="10">
                <div style="display: flex; align-items: center;">
                  <a style="margin-right: 5px" @click="showData = !showData">
                    <el-icon v-if="!showData" color="var(--el-text-color)"><ArrowUpBold /></el-icon>
                    <el-icon v-if="showData" color="var(--el-text-color)"><ArrowDownBold /></el-icon>
                  </a>

                  <template v-if="effectiveShowConf.showPlanNo">
                    <span style="color: var(--el-text-color); margin-right: 3px;white-space: nowrap;">
                      {{termdata['Term.cPlanNo']}}方案
                    </span>
                  </template>
                  <template v-else>
                    <el-tag :type="term.cRdrTyp === '0' ? 'danger' : 'success'">{{
                    term.cRdrTyp === "0" ? "主" : "附加"
                  }}</el-tag>
                  </template>
                  <template v-if="termdata['Term.cCancelMrk'] === '1'">
                    <el-badge value="退" class="item">
                      <el-tag type="warning">{{ term.cNmeCn }}</el-tag>
                    </el-badge>
                    <!-- 增加应税、免税标识 -->
                    <template v-if="term.isDutyfree">
                      <span class="isDutyfree">
                        <img :src="term.isDutyfree === '0' ? yingImageUrl : term.isDutyfree === '1' ? mianImageUrl : ''" alt="" srcset="">
                      </span>
                    </template>
                  </template>
                  <template v-else>
                    <el-tag type="warning"  style="margin-right: 8px;">{{ term.cNmeCn }}</el-tag>
                    <!-- 增加应税、免税标识 -->
                    <template v-if="term.isDutyfree">
                      <span class="isDutyfree">
                        <img :src="term.isDutyfree === '0' ? yingImageUrl : term.isDutyfree === '1' ? mianImageUrl : ''" alt="" srcset="">
                      </span>
                    </template>
                    <el-tooltip content="预览条款" placement="top">
                      <el-button
                        type="text"
                        @click="previewTerm"
                        style="margin-right: 5px"
                      ><rt-icon :item="{ icon: 'View' }" />
                    </el-button>
                    </el-tooltip>
                  </template>
                </div>
              </el-col>
              <el-col :span="11">
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
                  v-if="!btnItem.edit.hidden"
                  @click="
                    () => {
                      emit('editPlan', termdata);
                    }
                  "
                  :item="btnItem.edit"
                />
              </el-col>
              <el-col :span="1">
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

        <div class="cvrg-body__" v-show="showData">
          <template v-for="(ginfo, gk) in groupInfo" :key="gk">
            <div class="body-group-info">
              <el-row class="group-header">
                <el-col :span="22">
                  <a
                      style="margin-right: 5px"
                      @click="ginfo.hidden = !ginfo.hidden"
                  >
                    <el-icon v-if="ginfo.hidden"><ArrowUpBold /></el-icon>
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
                        v-for="(riskdata, k, ri) in groupconf[ginfo.cGroupId].riskList"
                        :key="k"
                    >
                      <template v-if="riskdata.maxNum > 0">
                        <tr
                            v-for="n in riskdata.maxNum"
                            :key="`${ginfo.cGroupId}-${k}-${n}`"
                            :class="{'selected': isSelected(k)}"
                            @click="selectRow(k)"
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
                                  style="white-space: nowrap;"
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
                                      :style="{'justify-content': colinfo.cColTitle === '责任名称' ? 'right' : 'center', 'min-width': colinfo.cColTitle === '免赔额' || colinfo.cColTitle === '免赔率' ? '100px' : 'auto'}"
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
            </div>
          </template>
          <template v-if ="termFactormap && termFactormap.length && effectiveShowConf.showTerm">
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
                      <td
                      :class="{
                          'custom-indent':item.cPropIndent === '1',
                      }">
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
                    <th v-if="checkExtendshow" width="20px">
                    </th>
                    <template v-for="(item, k) in termFactormap" :key="k">
                      <th v-if="item.cPorpShowtitle !== '1' && item.cPorpExtend !== '1' " :style="{ width: item.cPropHeight?item.cPropHeight+'px':null }">
                        <el-text
                          v-if="isrequired(item)"
                          class="mx-1"
                          style="margin-right: 2px"
                          type="danger"
                          >*</el-text>
                        {{ item.title }}
                      </th>
                    </template>
                  </tr>
                </thead>
                <tbody>
                  <tr
                      :class="{'selected': isSelected(termdata)}"
                      @click="selectRow(termdata)"
                  >
                      <th v-if="checkExtendshow">
                        <a style="margin-right: 5px" @click="showExtend = !showExtend">
                          <el-icon v-if="!showExtend"><ArrowUpBold /></el-icon>
                          <el-icon v-if="showExtend"><ArrowDownBold /></el-icon>
                        </a>
                        
                      </th>
                    <template v-for="(item, k) in termFactormap" :key="k">
                      <td v-if="item.cPorpShowtitle !== '1' && item.cPorpExtend !== '1'">
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
                  <template v-if="checkExtendshow">
                    <tr v-show="showExtend" >
                      <td :colspan="termFactormap.length" >
                        <el-row :gutter="20">
                        <template v-for="(item, k) in termFactormap" :key="k">
                          <template v-if="item.cPorpExtend === '1'">
                            <el-col style="margin-top: 5px" :span="12">
                              <el-form-item
                                :rules="isrequired(item) ? getRequired() : undefined"
                                :prop="item.prop"
                                :label="item.title" 
                                :label-width ="120">
                                <from-item
                                  v-model="termdata[item.prop]"
                                  @update:modelValue="update()"
                                  :item="item"
                                />
                              </el-form-item>
                            </el-col>
                          </template>
                        </template>
                      </el-row>
                      </td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </template>
            <template v-else>
              <div class="crvg_form__">
                <app-free-edit
                    :freeEditConfig="formconfig1"
                    ref="termRef"
                    @updateDatas="update"
                />
              </div>
            </template>
          </template>
        </div>
      </el-card>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { getCurrentInstance } from 'vue'
import { getTRFactorJson,getPrdTermInfo,viewPdfProposal, viewPdfProposalPost,qryTerminationDataList,getPremiumAdjustmentRange } from "@/api/prod";
import {
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import { formInit } from "@/shared/from-init";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { terConfig, configInit } from "@/store/modules/term-config";
import { useValidator } from "@/typings/useValidator";
import { useRoute } from "vue-router";
import { v4 as uuidv4 } from "uuid";
import {CommonConstants} from "@/constants/CommonConstants";
import { ITEM_RENDER_EVT } from "element-plus/es/components/virtual-list/src/defaults";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";
import Decimal from "decimal.js";

const route = useRoute();
const templateRef = ref();
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const opertaor = dataOpertaor(idxParam.opertaorProps);
const pageparam = opertaor.getParam();
const terconfig = terConfig();
const instance = getCurrentInstance();
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
  rowIndex: {
    type: [Number, String],
  },
  showConf: {
    type: Object,
    default:() =>({}),
  },
});

const effectiveShowConf = computed(() => {
  return {
    showHeader: props.showConf?.showHeader ?? props.showHeader ?? true,
    showTerm: props.showConf?.showTerm ?? props.showTerm ?? true,
    showPlanNo:props.showConf?.showPlanNo ?? props.showPlanNo ?? false,
  };
});

const emit = defineEmits(["update:modelValue", "delete", "editPlan"]);
const termRef = ref<AppFreeEditMethod | null>(null);
const groupconf = ref<{ [key: string]: any }>({}); // 渲染数据分离,解决因为数据变更,导致触发重新渲染

const termdata = ref<{ [key: string]: any }>({});
const riskList = ref<{ [key: string]: any }>({});

const pageInit = ref(false);
const btnItem = ref<{ [key: string]: { [key: string]: any } }>({
  edit: {
    type: "primary",
    label: "条款编辑",
    size: "small"
  },
  delete: {
    label: "删除",
    size: "small"
  },
});
const yingImageUrl = ref(new URL(`../../../assets/img/ying.png`, import.meta.url).href);
const mianImageUrl = ref(new URL(`../../../assets/img/mian.png`, import.meta.url).href);

const {selectedRow} = storeToRefs(terconfig);

function update() {
  let newData;

  if( termTitleConf.value.cFactorTabType === "table" ||  termTitleConf.value.cFactorTabType === 'grid' ){
    newData = termdata.value;
  } else {
    newData = termRef.value?.getFromValue();
  }
  if( !newData ){
    newData = termdata.value;
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
  terconfig.selectReset();
  showdataInit();
  const newData = JSON.parse(JSON.stringify(data));
  // 缓存条款数据
  const termData = JSON.parse(JSON.stringify(data));
  termData.riskList = null;
  instance.proxy.$forceUpdate();
  termdata.value = termData;
  if(termdata.value['Term.nSeatTotal']){
    const tgt = opertaor.getTableRefByKey("tgt");
     console.log('触发13',termdata.value['Term.nSeatTotal'])
    // tgt?.setValue('Tgt.nSeatCapacity',termdata.value['Term.nSeatTotal'])
  }
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
      // 页面初始化加载时，这里有时获取的termRef.value的值为null导致数据反显为空，所以用定时器实时判断termRef.value的值来设置数据
      const interval = setInterval(() => {
        if(termRef.value) {
          termRef.value?.setFormValue(termdata.value, true);
          clearInterval(interval)
        }
      }, 1000)
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
      cols: 3,
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

      let colconfig = Object.assign({}, JSON.parse(JSON.stringify(item)));
      colconfig["factorItem"] = getProp(item);
      let cf = null;
      // 040002产品特殊处理，判断 cDeterminingMethod ,显示需要的列
      if (pageparam.cProdNo === "040002") {
        let deter = null;
        if (tgt) {
          deter = tgt.getValue("Tgt.cDeterminingMethod");
        }else{
          deter = "1";
        }
        if (deter && deter === "1") {
          if (colconfig["cRiskNo"] === "040042") {
            if (
              colconfig["factorItem"]["prop"] !== "TermRisktgt.nPersonDeath"
            ) {
              cf = colconfig;
            }
          } else {
            cf = colconfig;
          }
          
          if(cf && cf.cColTitle === '限额值'){
            delete cf.factorItem.suffix ;
          }
        } else if (deter && deter === "0") {
          if (colconfig["cRiskNo"] === "040042") {
            if (
              colconfig["factorItem"]["prop"] !== "TermRisktgt.nDeathLimit" &&
              colconfig["factorItem"]["prop"] !== "TermRisktgt.nDisabilityLimit"
            ) {
              cf = colconfig;
            }
          } else {
            cf = colconfig;
          }
        } else {
          cf = colconfig;
        }
      } else {
        cf = colconfig;
      }
      if(cf){
        acc[key].push(cf);
      }

      return acc;
    },
    {} as { [key: string]: any[] }
  );
  return colMap;
}

const showExtend = ref(false);
const checkExtendshow = computed(() => { 
  let r = false;
  termFactormap.value.forEach((item) => { 
    if(item.cPorpExtend === '1'){
      r = true && showExtend;
    }
  });
  return r;
});

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
  if (factormap.value[factorId]["func"]) {
    fact["func"] = factormap.value[factorId]["func"];
  }
  if (factormap.value[factorId]["tableClick"]) {
    fact["tableClick"] = factormap.value[factorId]["tableClick"];
  }
  if(col['cFatherKey']){
    fact.max = 0;

    const da = riskList.value[col['cRiskNo']][col['cFatherKey']];
    if(da){
      fact.max = da;
    }
  }
  
  fact.cRiskNo = col["cRiskNo"];
  fact.cGroupId = col["cGroupId"];
  fact.cColId = col["cColId"];
  fact.disabled = col["cPorpDisabled"];
  fact.required = col["cPorpRequired"];
  fact.Indent = col["cPropIndent"];  // 缩进
  return fact;
}

function getTermData(){
  let newData;
  if( termTitleConf.value.cFactorTabType === "free" ){
    newData = termRef.value?.getFromValue();
  } else {
    newData = termdata.value;
  }
  return newData;
}
/*
条款预览
*/
function previewTerm() {
  const newparam = { cTermNo: termdata.value['Term.cClauseCode'], pageNum: 1, pageSize: 10 };
  viewPdfProposalPost(newparam).then((res:any) => {
    if(res.code == '0') {
      ElMessage.error(res.message)
    } else {
      viewPdfProposal(newparam).then((res:any) => {
        const blob = new Blob([res.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const previewUrl = url + '#toolbar=0&navpanes=0&scrollbar=0';
        window.open(previewUrl, '_blank');
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 10000); // 10秒后释放URL对象
      })
    }
  }).catch((err:any) => {
    ElMessage.error(err.message)
  });
}
/**
 * 获取文件扩展名
 * @param url 文件链接
 * @returns 文件扩展名
 */
function getFileExtension(url) {
  if (!url) return '';
  // 从URL中提取文件名
  const filename = url.split('/').pop().split('?')[0].split('#')[0];
  // 获取扩展名
  const extension = filename.split('.').pop();
  return extension || '';
}

onMounted(async () => {
  initData(props.modelValue);
  dataInit();
});

watch(() => props.modelValue, (newv,oldv)=>{
  initData(newv);
  dataInit();
});

function dataFlash(){
  initData(props.modelValue);
  dataInit();
}

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
      if (newKey === "cLiabCode" && v) {
        p["cRiskNo"] = v;
        queryKey += v;
      }
    });
    queryList.push(p);
  });
  const param = {
    cTermNo: props.modelValue["Term.cClauseCode"],
    riskList: queryList,
  };
  const r = terconfig.getConfig(queryKey);
  if (r) {
    const d = JSON.parse(r);
    collist.value = getUseData(d.collist);
    factormap.value = d.factormap;
    colInfo.value = d.colInfo;
    groupInfo.value = d.groupInfo;
    term.value = d.term;
    termFactormap.value = getUseData(d.termFactormap);
    methodLink(termFactormap.value);
    riskMethodLink(factormap.value);
    initshowConfig();
    const fromc = termFactormap.value?.filter(
      (v: any) => v.cPorpShowtitle !== "1"
    );
    formconfig1.fromSchema = fromc;
    if (d.termTitleConf?.CCnm) {
      termTitleConf.value = JSON.parse(d.termTitleConf.CCnm);
    }
    // 方案配置时条款信息中的保险费是可以编辑的
    if(route.name === "plan-info") {
      termFactormap.value.forEach((item:any) => {
        if(item.prop === "Term.nInsuranceFee") {
          item.disabled = false
        }
      })
    }
    if (props.disabledFlag) {
      setDisabledAll();
    }
    initMethod();
  } else {
    getTRFactorJson(param).then((res: any) => {
      const { code, data, msg } = res;
      if (200 === code) {
        terconfig.addConfig(queryKey, JSON.stringify(data.data));
        collist.value = getUseData(data.data.collist);
        factormap.value = data.data.factormap;
        colInfo.value = data.data.colInfo;
        groupInfo.value = data.data.groupInfo;
        term.value = data.data.term;
        termFactormap.value = getUseData(data.data.termFactormap);
        methodLink(termFactormap.value);
        riskMethodLink(factormap.value);
        initshowConfig();
        const fromc = termFactormap.value?.filter(
          (v: any) => v.cPorpShowtitle !== "1"
        );
        formconfig1.fromSchema = fromc;
        if (data.data.termTitleConf?.CCnm) {
          termTitleConf.value = JSON.parse(data.data.termTitleConf.CCnm);
        }
      } else {
        ElMessage.error(msg);
      }
      // 方案配置时条款信息中的保险费是可以编辑的
      if(route.name === "plan-info") {
        termFactormap.value.forEach((item:any) => {
          if(item.prop === "Term.nInsuranceFee") {
            item.disabled = false
          }
        })
      }
      if (props.disabledFlag) {
        setDisabledAll();
      }
      initMethod();
    });
  }
}

function showdataInit() {
  collist.value = null;
  factormap.value = null;
  colInfo.value = null;
  groupInfo.value = null;
  termFactormap.value = null;
}

function getUseData(data: any){
  if(!data){
    return null;
  }
  let redata = JSON.parse(JSON.stringify(data));
  const params = opertaor.getParam();
  if(data && data.length > 0){
    redata = redata.filter((item:any) => { 
      let checkKey = null;
      const csc = item.cSysConfig;
      if(params.sysDist === 'PCIS'){    // 核心出单，标记有效性
        if(csc && csc.length > 0) {
          checkKey = csc.charAt(0);
        }
      }else if(params.sysDist === 'PRICE'){
        if(csc && csc.length > 1) {
          checkKey = csc.charAt(1);
        }
      }
      if(checkKey === '2'){  // 无效,删除自己
        return false; // 过滤掉这个项
      }
      if(checkKey === '1'){  // 清除,校验内容
        item.rules = null;
        item.cPorpRequired = null;
        item.required = null;
      }
      return true;
    });
  }
  return redata;
}

/** 初始化需要执行的方法,手动触发 */
function initMethod(){
  if(pageparam.pageType === 'PLY_UW_PROCESS_SCENE' || pageparam.pageType === "readonly"){
    return ;
  }
  // 解决组件初始化时是否统扯保费反显为是的时候医生每人保费、护士/医技人员每人保费没有置灰
    if(termdata.value['Term.cUnifiedPremium'] && !pageparam.cEdrType ) {
      methodMap.unifiedPremiumChange(termdata.value['Term.cUnifiedPremium'])
    }
    // 主条款信息中免赔方式默认为绝对免赔
    if(termFactormap.value.length > 0) {
      const cDeductibleMethod = termFactormap.value.filter((item:any) => item.prop === 'Term.cDeductibleMethod')
      if(cDeductibleMethod.length > 0) {
        cDeductibleMethod[0]['defaultValue'] = "01"
      }
    }
  const plyBase = opertaor.getTableRefByKey("plyBase")?.getFromValue();
  // 如果联共保业务是从共主联、从共无联保则可以批改条款中的保费
  // 保费变化幅度大于限制区间则需要查询数据接口开关，打开则继续，关闭则提示修改幅度超出限制
  if(['2','4'].includes(plyBase?.['Base.cCiMrk']) && pageparam.pageName !== 'priceInquiry') {

    /* 从共时，安责险产品时，当责任代码为 040196 ：法律费用，041129：医疗救护费用，049003：检验评估费用，049002：抢险救援费用 时，责任总保费不能编辑
   040002雇主责任险时,041293 误工费用  040046 法律费用 */
    const readonlyLiabCodes = ['040196','041129','049003','049002','040046','040075'];
    if(groupInfo.value && Object.keys(groupInfo.value)?.length > 0) {
      for(let i in groupInfo.value) {
        const ginfo = groupInfo.value[i]
        const riskList = groupconf.value[ginfo.cGroupId].riskList
        for(let k in riskList) {
          const riskdata = riskList[k];
          const nItemRateList = Object.keys(riskdata.rowConfig).filter((i:any) => riskdata.rowConfig[i].find((it:any) => it.factorItem?.prop === 'TermRisktgt.nItemRate'));
          if(riskdata.maxNum > 0 && nItemRateList?.length > 0) {
            for(let n = 1;n <= riskdata.maxNum;n++) {
              riskdata.col?.forEach((colinfo:any) => {
                const item = riskdata.rowConfig[colinfo.cColId][n - 1]?.factorItem
                if(item?.prop === 'TermRisktgt.nTotalInsuranceFee') {
                  const riskNo = riskdata.rowConfig[colinfo.cColId][n - 1]?.cRiskNo;
                  // 判断是否需要设置为只读（根据责任代码）
                  const isReadonly = readonlyLiabCodes.includes(riskNo);
                  if(isReadonly){
                    item.disabled = true;
                    item.readonly = true;
                    item.funcBlur = null;
                  }else {
                    item.disabled = false;
                    item.funcBlur = (val: any) => nInsuranceFeeChange(val)
                  }
                }
              })
            }
          } else 
          if (termFactormap && termFactormap.value.length > 0) {
            termFactormap.value.forEach((item: any) => {
              if(item.prop === 'Term.nInsuranceFee') {
                item.disabled = false;
                item.funcBlur = (val:any) => nInsuranceFeeChange(val)
              }
            });
          }
        }
      }
      if( extermConf.value && extermConf.value.length > 0 ){
        extermConf.value.forEach((item: any) => {
          if(item?.prop === 'Term.nInsuranceFee') {
            item.disabled = false;
            item.funcBlur = (val:any) => nInsuranceFeeChange(val)
          }
        });
      }
    } else 
    if (termFactormap && termFactormap.value.length > 0) {
      termFactormap.value.forEach((item: any) => {
        if(item.prop === 'Term.nInsuranceFee') {
          item.disabled = false;
          item.funcBlur = (val:any) => nInsuranceFeeChange(val)
        }
      });
    }
  } else {
    // 根据数据控制开关设置条款中的可编辑项(投保单)
    if(pageparam.pageType === 'TEMPORARY_DEPOSIT' && pageparam.cAppTyp === 'A') {
      qryTerminationDataList({ cAppNo: pageparam.cAppNo, cOperType: 'AppPrm' }).then((res:any) => {
        if(res?.code == 200 && res.data?.length > 0) {
          if(res.data[0]?.cAppTyp === 'on') {
            if(Object.keys(groupInfo.value)?.length > 0) {
              for(let i in groupInfo.value) {
                const ginfo = groupInfo.value[i]
                const riskList = groupconf.value[ginfo.cGroupId].riskList
                for(let k in riskList) {
                  const riskdata = riskList[k];
                  const nItemRateList = Object.keys(riskdata.rowConfig).filter((i:any) => riskdata.rowConfig[i].find((it:any) => it.factorItem?.prop === 'TermRisktgt.nItemRate'));
                  if(riskdata.maxNum > 0 && nItemRateList?.length > 0) {
                    for(let n = 1;n <= riskdata.maxNum;n++) {
                      riskdata.col?.forEach((colinfo:any) => {
                        const item = riskdata.rowConfig[colinfo.cColId][n - 1]?.factorItem
                        if(item?.prop === 'TermRisktgt.nTotalInsuranceFee') {
                          item.disabled = false;
                          item.funcBlur = (val:any) => nInsuranceFeeChange(val)
                        }
                      })
                    }
                  } else 
                  if (termFactormap && termFactormap.value.length > 0) {
                    termFactormap.value.forEach((item: any) => {
                      if(item.prop === 'Term.nInsuranceFee') {
                        item.disabled = false;
                        item.funcBlur = (val:any) => nInsuranceFeeChange(val)
                      }
                    });
                  }
                }
              }
              if( extermConf.value && extermConf.value.length > 0 ){
                extermConf.value.forEach((item: any) => {
                  if(item?.prop === 'Term.nInsuranceFee') {
                    item.disabled = false;
                    item.funcBlur = (val:any) => nInsuranceFeeChange(val)
                  }
                });
              }
            } else 
            if (termFactormap && termFactormap.value.length > 0) {
              termFactormap.value.forEach((item: any) => {
                if(item.prop === 'Term.nInsuranceFee') {
                  item.disabled = false;
                  item.funcBlur = (val:any) => nInsuranceFeeChange(val)
                }
              });
            }
          }
        }
      })
    }
    // 根据数据控制开关设置条款中的可编辑项(批单)
    if(pageparam.pageType === 'TEMPORARY_DEPOSIT' && pageparam.cEdrType) {
      qryTerminationDataList({ cAppNo: pageparam.cAppNo, cOperType: 'EdrPrm' }).then((res:any) => {
        if(res?.code == 200 && res.data?.length > 0) {
          if(res.data[0]?.cAppTyp === 'on') {
            if(groupInfo.value && Object.keys(groupInfo.value)?.length > 0) {
              for(let i in groupInfo.value) {
                const ginfo = groupInfo.value[i]
                const riskList = groupconf.value[ginfo.cGroupId].riskList
                for(let k in riskList) {
                  const riskdata = riskList[k];
                  const nItemRateList = Object.keys(riskdata.rowConfig).filter((i:any) => riskdata.rowConfig[i].find((it:any) => it.factorItem?.prop === 'TermRisktgt.nItemRate'));
                  if(riskdata.maxNum > 0 && nItemRateList?.length > 0) {
                    for(let n = 1;n <= riskdata.maxNum;n++) {
                      riskdata.col?.forEach((colinfo:any) => {
                        const item = riskdata.rowConfig[colinfo.cColId][n - 1]?.factorItem
                        if(item?.prop === 'TermRisktgt.nTotalInsuranceFee') {
                          item.disabled = false;
                          item.funcBlur = (val:any) => nInsuranceFeeChange(val)
                        }
                      })
                    }
                  } else 
                  if (termFactormap && termFactormap.value.length > 0) {
                    termFactormap.value.forEach((item: any) => {
                      if(item.prop === 'Term.nInsuranceFee') {
                        item.disabled = false;
                        item.funcBlur = (val:any) => nInsuranceFeeChange(val)
                      }
                    });
                  }
                }
              }
              if( extermConf.value && extermConf.value.length > 0 ){
                extermConf.value.forEach((item: any) => {
                  if(item?.prop === 'Term.nInsuranceFee') {
                    item.disabled = false;
                    item.funcBlur = (val:any) => nInsuranceFeeChange(val)
                  }
                });
              }
            } else 
            if (termFactormap && termFactormap.value.length > 0) {
              termFactormap.value.forEach((item: any) => {
                if(item.prop === 'Term.nInsuranceFee') {
                  item.disabled = false;
                  item.funcBlur = (val:any) => nInsuranceFeeChange(val)
                }
              });
            }
          }
        }
      })
    }
  }
}

/**
 * 条款初始化判断
 * @param item 
 */
function initTermsData(item: any) {
  if(item.prop === 'Term.cClaimInclude'){ //是否计入累计赔偿限额 默认选择否
    if(termdata.value[item.prop] === null || termdata.value[item.prop] === undefined){
      termdata.value[item.prop] = '1';
      return true;
    }
  }

  if(item.prop === 'Term.cLimitSame'){ //赔偿限额是否同主险 默认勾选
    if(termdata.value[item.prop] === null || termdata.value[item.prop] === undefined){
      if(pageparam.cProdNo === "043002"){
        termdata.value[item.prop] = '1';
      }
    }

  }
  return false;
}

/**条则标数据初始化判断 */
function initTermRiskData(item: any){
  let r = false;
  if(item.cPorpType != 'text'){
    const faitem = factormap.value[item['cFactorId']];
    if(faitem.prop === 'TermRisktgt.cDeductibleMethod'){    //免赔方式,默认均为绝对免赔
      if(riskList.value[item['cRiskNo']][faitem.prop] === null || riskList.value[item['cRiskNo']][faitem.prop] === undefined){  // 为空时才赋值
        riskList.value[item['cRiskNo']][faitem.prop] = '01';
        r = true;
      }
    }
  }
  return r;
}


function initshowConfig() {
  // 条款组件遍历,对一些个性化操作进行处理
  let reflash = false;
  termFactormap.value.forEach((item) => { 
    item.required = isrequired(item);
    item.disabled = isdisabled(item);

    reflash = reflash || initTermsData(item);
    if (item.cFatherKey ) {  //如果存在上级,则将上限设置成0,等待父级修改后,再修改自己的上限
      const mx = getTermData()[item.cFatherKey];
      item.max = 0;
      if(mx){
        item.max = mx;
      }
    }
  });

  collist.value?.forEach((item)=>{
    reflash = reflash || initTermRiskData(item);
  })
  if(reflash){  // 如果存在初始化数据,则将初始化数据反馈给父级
    update();
  }

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
  // 043009个性化配置
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
  // 045001个性化配置
  if (pageparam.cProdNo === "045001") {
    if(data["tgt"]["Tgt.cInsuranceMethod"] && data["tgt"]["Tgt.cInsuranceMethod"] !== '613001'){
      const term = termFactormap.value.filter(
        (r) => (r["prop"] !== "Term.nPersonPremium" && r["prop"] !== "Term.nInsuredCount")  //不是按人数投保,不显示投保人数以及每人保费
      );
      // const ex = termFactormap.value.filter(
      //   (r) =>
      //     r["prop"] === "Term.nRateVal" || r["prop"] === "Term.nInsuranceFee"
      // );
      termFactormap.value = term;
      // extermConf.value = ex;
    }else{
      const term = termFactormap.value.filter(
        (r) => r["prop"] !== "Term.nRateVal" 
      );

      termFactormap.value = term;
    }
    
  }
  let deter = null;
   // 040002个性化配置
  if (pageparam.cProdNo === "040002") {
    if(data["tgt"]){
      deter = data["tgt"]["Tgt.cDeterminingMethod"];
      
    }else{
      deter = "0";
    }

    if (deter === "0") {
      const col = colInfo.value.filter((r: any) => r.cColTitle !== "单位");
      colInfo.value = col;
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
      if (t) {
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

  if(i.cPorpRequired === "1" || i.cPorpRequired === 1 || i.cPorpRequired === true){
    return true;
  }
  if(i.cPorpRequired === "0" || i.cPorpRequired === 0 || i.cPorpRequired === false ){
    return false;
  }

  if (i.required === "1" || i.required === 1 || i.required === true) {
    return true;
  }
  return false;
}
function isdisabled(i: any) {
  if(i.cPropDisabled === "1" || i.cPropDisabled === 1 || i.cPropDisabled === true ){
    return true;
  }
  if(i.cPropDisabled === "0" || i.cPropDisabled === 0 || i.cPropDisabled === false ){
    return false;
  }
  
  if (i.disabled === "1" || i.disabled === 1 || i.disabled === true ) {
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
/**
 * 条择标方法绑定
 */
function riskMethodLink(items: any) {
  if (items) {
    Object.keys(items).forEach((k: any) => {
      if (items[k]["func"] && typeof items[k]["func"] === "string") {
        items[k]["func"] = methodMap[items[k]["func"]];
      }
    });
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


  InsuranceChange043009:(val: any)=>{
    if (pageparam.cProdNo === "049035") {
      termFactormap.value.forEach((item: any) => {
        if (item["prop"] === "Term.nAccidentLimit") {
          item['max'] = val/2;
        }
      });
    }
  },
  LimitSameChange:(val: any)=>{
    if(val === '1'){
      const trems = opertaor.getTableRefByKey('cvrg');
      const data = trems.getFromValue();
      const cocyData = {};
      data.forEach((item: any) => {
        if(item['Term.cClauseCode'] === '00425000085'){
          Object.keys(copyMaps).forEach((key: any) => { 
            if(item[copyMaps[key]]){
              cocyData[copyMaps[key]] = item[copyMaps[key]];
            }
          })
        }
      });
    }
  },
  /**
   * 用于父级向子集校验,修改子集可输入的最大值
   */
  FathersCheck:(val:any,row:any,item:any)=>{
    const fk = item.prop;
    termFactormap.value.forEach((item: any) => {
      if(item.cFatherKey === fk){
        item.max = val;

        if(termdata.value[item.prop] ){
          if(val < termdata.value[item.prop]){
            termdata.value[item.prop] = val;
          }
        }
      }
      
    });
    update();
  },

  /**
   * 用于条则标父级向子集校验,修改子集可输入的最大值
   */
  RiskFathersCheck:(val:any,row:any,item:any)=>{
    for (const key in collist.value) {
      if(collist.value[key].cFatherKey === item.prop && collist.value[key].cRiskNo === item.cRiskNo){
        collist.value[key].numberMax = val;
      }
    }
    nextTick(()=>{
      checkData(val,item);
    });
  },
  // nItemFeeChange:(val:any) => {
  //   nInsuranceFeeChange(val)
  // },
};

const checkData = (v :any,item:any) => {
    const cf = groupconf.value[item.cGroupId]['riskList'][item.cRiskNo]['rowConfig'][item.cColId];
    if(cf){
      const fk = item.prop
      cf.forEach((c)=>{
        if(c.cFatherKey === fk){
          c.factorItem.max = v;
          
          if(riskList.value[c.cRiskNo][c.factorItem['prop']]){
            if(v < riskList.value[c.cRiskNo][c.factorItem['prop']]){
              riskList.value[c.cRiskNo][c.factorItem['prop']] = v;
            }
          }
        }
      });
      update();
    }
}

const copyMaps = ['Term.nAccidentLimit','Term.nInsuranceAmount','Term.nLegalAccident','Term.nLegalTotal','Term.nRateVal',
'Term.nResponsePer','Term.nResponseTotal','Term.nSeatLimit','Term.nSeatMedical','Term.nSeatPremium','Term.nSeatProperty',
'Term.nSeatTotal','Term.cLimitMethod']

function setCancel(){
  termdata.value['Term.cCancelMrk'] = '1';
  update();
}

const isSelected = (key: any) => {
  if(!selectedRow.value.data || selectedRow.value.index !== props.rowIndex) return false;
  if(typeof key === CommonConstants.TYPE_OF_STRING) {
    const row = riskList.value[key];
    return selectedRow.value.data['TermRisktgt.cLiabCode'] === row['TermRisktgt.cLiabCode'];
  }else {
    return key['Term.cClauseCode'] === selectedRow.value.data['Term.cClauseCode'];
  }
};
const selectRow = (key: any) => {
  selectedRow.value.index = props.rowIndex;
  if(typeof key === CommonConstants.TYPE_OF_STRING){
    selectedRow.value.data = riskList.value[key];
  } else {
    selectedRow.value.data = key;
  }
};

async function nInsuranceFeeChange(val: any) {
	opertaor.getFatherPage().setIsEditnPrm(true)
  const plyBase = opertaor.getTableRefByKey("plyBase")?.getFromValue();
  let qryTerminationStatus = false;
  // 投保 条款中的保费手动修改后 承保基本信息中的总保费也需要同步
  // (遍历所有条款的责任列表，TermRisktgt.nItemRate有值则累加责任中的保费，没有值则不加，累加的值要赋值到条款的保费字段上，然后累加所有条款的保费，把总值赋值到保单的总保费上)
  if((pageparam.pageType === 'TEMPORARY_DEPOSIT' && pageparam.cAppTyp === 'A' && !pageparam.initFlag) || ['app','template','copy','inquiryToApp'].includes(pageparam.pageType)) {
    // TermRisktgt
    const cvrgData = opertaor.getTableRefByKey("cvrg")?.getFromValue();
    let nInsuranceFee:any = 0;
    cvrgData.forEach((item:any) => {
      if(Array.isArray(item['Term.riskList']) && item['Term.riskList']?.length > 0) {
        if(item['Term.riskList'].filter((item:any) => item['TermRisktgt.nItemRate'])?.length > 0) {
          const totalFee = item['Term.riskList'].reduce((sum, num) => new Decimal(sum).add(new Decimal(num['TermRisktgt.nTotalInsuranceFee'] || 0)), 0)
          item['Term.nInsuranceFee'] = totalFee > 0 ? totalFee : item['Term.nInsuranceFee']
          if(term.value?.cRdrTyp === '0') {
            if(termdata.value['Term.cPlanNo'] === item['Term.cPlanNo']) {
							termdata.value['Term.nInsuranceFee'] = item['Term.nInsuranceFee']
            }
					} else if(termRef.value?.setValue) {
            termRef.value.setValue('Term.nInsuranceFee', item['Term.nInsuranceFee'])
          }
        }
      }
      nInsuranceFee = new Decimal(nInsuranceFee).add(new Decimal(item['Term.nInsuranceFee'] || 0)).toNumber()
    })
    if(['2','4'].includes(plyBase?.['Base.cCiMrk']) && pageparam.pageName !== 'priceInquiry') {// 从共主联、从共无联保
      const qryTerminationData:any = await qryTerminationDataList({ cAppNo: pageparam.cAppNo, cOperType: 'AppPrm' })
      if(qryTerminationData?.code == 200 && qryTerminationData.data?.length > 0) {
        if(qryTerminationData.data[0]?.cAppTyp === 'on') {
          qryTerminationStatus = true;
        }
      }
      // 如果打开数据开关，则不需要判断修改后的总保费是否超出阈值，否则需要判断
      if(qryTerminationStatus === false) {
        let nPrm = opertaor.getTableRefByKey("base")?.getValue("Base.nPrm");
        const nAmt = opertaor.getTableRefByKey("base")?.getValue("Base.nAmt")
        const nPrmRange:any = await getPremiumAdjustmentRange();
        // 调用保费计算接口获取最新保费计算后的保费数据
        const calcres = await opertaor.getFatherPage().calcFunc();
        if(calcres && calcres.code === 200) {
          const newOp: any = opertaor.convertData(calcres);
          nPrm = newOp.base["Base.nPrm"];
          const newAmt = newOp.base["Base.nAmt"];
          if(newAmt != nAmt) {
            opertaor.getTableRefByKey("base")?.setValue("Base.nAmt", newAmt)
          }

          let minPrm:any = 0;
          let maxPrm:any = 0;
          if(nPrmRange.code == 200 && nPrmRange.data?.upperLimit && nPrmRange.data?.lowerLimit) {
            maxPrm = new Decimal(nPrm).add(new Decimal(nPrmRange.data?.upperLimit))
            minPrm = new Decimal(nPrm).add(new Decimal(nPrmRange.data?.lowerLimit))
          } else {
            minPrm = new Decimal(nPrm).sub(new Decimal(10))
            maxPrm = new Decimal(nPrm).add(new Decimal(10))
          }
          if(minPrm < 0) { minPrm = 0 }
          if(maxPrm < 0) { maxPrm = 0 }
          if(new Decimal(nInsuranceFee).lt(minPrm) || new Decimal(nInsuranceFee).gt(maxPrm)) {
            ElMessageBox.confirm(`本次手动调整金额（¥${nInsuranceFee}）已超出预设阈值范围（¥${minPrm} - ¥${maxPrm}）。根据系统规则，需履行审批程序。请您发起OA流程，完成合规授权后生效。`, {
              confirmButtonText: "确定",
              type: "warning",
              showCancelButton: false,
              showClose: false,
            }).then(() => {
              opertaor.getFatherPage().calcPremium()
            }).catch(() => {
              opertaor.getFatherPage().calcPremium()
            })
            return;
          }
        } else {
          ElMessage.error(calcres.msg)
        }
      }
    }
    opertaor.getTableRefByKey("base")?.setValue("Base.nPrm", nInsuranceFee)
    if(opertaor.getTableRefByKey("cvrg")?.updateTitle) {
      opertaor.getTableRefByKey("cvrg")?.updateTitle()
    }
    nextTick(() => {
      opertaor.getFatherPage().afterCalcPremium()
    })
  }
  // 一般批改 条款中的保费手动修改后 承保基本信息中的总保费也需要同步
  if(((pageparam.pageType === "TEMPORARY_DEPOSIT" && pageparam.cTransMrk !=='1') || pageparam.pageType === 'EDR_APP_NEW_SCENE') && pageparam.cEdrType === '1') {
    // TermRisktgt
    const cvrgData = opertaor.getTableRefByKey("cvrg")?.getFromValue();
    let nInsuranceFee:any = 0;
    cvrgData.forEach((item:any) => {
      if(Array.isArray(item['Term.riskList']) && item['Term.riskList']?.length > 0) {
        if(item['Term.riskList'].filter((item:any) => item['TermRisktgt.nItemRate'])?.length > 0) {
          const totalFee = item['Term.riskList'].reduce((sum, num) => new Decimal(sum).add(new Decimal(num['TermRisktgt.nTotalInsuranceFee'] || 0)), 0)
          item['Term.nInsuranceFee'] = totalFee > 0 ? totalFee : item['Term.nInsuranceFee']
          if(term.value?.cRdrTyp === '0') {
            if(termdata.value['Term.cPlanNo'] === item['Term.cPlanNo']) {
							termdata.value['Term.nInsuranceFee'] = item['Term.nInsuranceFee']
            }
					} else if(termRef.value?.setValue) {
            termRef.value.setValue('Term.nInsuranceFee', item['Term.nInsuranceFee'])
          }
        }
      }
      nInsuranceFee = new Decimal(nInsuranceFee).add(new Decimal(item['Term.nInsuranceFee'] || 0)).toNumber()
    })
    let nPrm = opertaor.getTableRefByKey("base")?.getValue("Base.nPrm")
    const nAmt = opertaor.getTableRefByKey("base")?.getValue("Base.nAmt")
    const edrbase = opertaor.getFatherPage().getEdrbaseValue();
    const nBefEdrPrm = edrbase['EdrBase.nBefEdrPrm']?.replaceAll(',','');
    if(['2','4'].includes(plyBase?.['Base.cCiMrk'])) {
      const qryTerminationData:any = await qryTerminationDataList({ cAppNo: pageparam.cAppNo, cOperType: 'EdrPrm' })
      if(qryTerminationData?.code == 200 && qryTerminationData.data?.length > 0) {
        if(qryTerminationData.data[0]?.cAppTyp === 'on') {
          qryTerminationStatus = true;
        }
      }
      // 如果打开数据开关，则不需要判断修改后的总保费是否超出阈值，否则需要判断
      if(qryTerminationStatus === false) {
        const nPrmRange:any = await getPremiumAdjustmentRange();
        // 调用保费计算接口获取最新保费计算后的保费数据
        const calcres = await opertaor.getFatherPage().calcEdrFunc();
        if(calcres && calcres.code === 200) {
          const newOp: any = opertaor.convertData(calcres);
          nPrm = newOp.base["Base.nPrm"];
          const newAmt = newOp.base["Base.nAmt"];
          if(newAmt != nAmt) {
            opertaor.getTableRefByKey("base")?.setValue("Base.nAmt", newAmt)
          }

          let minPrm:any = 0;
          let maxPrm:any = 0;
          if(nPrmRange.code == 200 && nPrmRange.data?.upperLimit && nPrmRange.data?.lowerLimit) {
            maxPrm = new Decimal(nPrm).add(new Decimal(nPrmRange.data?.upperLimit))
            minPrm = new Decimal(nPrm).add(new Decimal(nPrmRange.data?.lowerLimit))
          } else {
            minPrm = new Decimal(nPrm).sub(new Decimal(10))
            maxPrm = new Decimal(nPrm).add(new Decimal(10))
          }
          if(new Decimal(nInsuranceFee).lt(minPrm) || new Decimal(nInsuranceFee).gt(maxPrm)) {
            ElMessageBox.confirm(`本次手动调整金额（¥${nInsuranceFee}）已超出预设阈值范围（¥${minPrm} - ¥${maxPrm}）。根据系统规则，需履行审批程序。请您发起OA流程，完成合规授权后生效。`, {
              confirmButtonText: "确定",
              type: "warning",
            }).then(() => {
              opertaor.getFatherPage().calcPremiumEdr()
            }).catch(() => {
              opertaor.getFatherPage().calcPremiumEdr()
            })
            return;
          }
        } else {
          ElMessage.error(calcres.msg)
        }
      }
    }
    opertaor.getTableRefByKey("base")?.setValue("Base.nPrm", nInsuranceFee)
    opertaor.getFatherPage().setEdrValue("EdrBase.nPrm", nInsuranceFee)
    opertaor.getFatherPage().setEdrValue("EdrBase.nPrmVar", new Decimal(nInsuranceFee).sub(new Decimal(nBefEdrPrm)))
    if(opertaor.getTableRefByKey("cvrg")?.updateTitle) {
      opertaor.getTableRefByKey("cvrg")?.updateTitle()
    }
    nextTick(() => {
      opertaor.getFatherPage().afterCalcEdrPremium()
    })
  }
}

defineExpose({
  dataFlash,
  dataInit,
  setDisabledAll,
  setCancel,
  validate,
});
</script>
<style lang="scss" scoped>
@import "src/styles/custom-index";

.cvrg-info {
  box-shadow: none;
  --el-card-border-color: none;
  :deep(.el-card__header) {
    padding: 5px 10px;
  }
  :deep(.el-card__body) {
    padding: 10px 20px;
  }
}
.table-title {
  background: var(--cvrg-group-header-bg-color);
  th {
    text-align: center;
  }
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
  position: relative;
}
.custom-indent::before {
  content: "-";
  position: absolute;
  left: 10px;
}

.custom-left {
  text-align: left;
}
table,
th,
td {
  border: 1px solid var(--el-border-color-lighter); /* 设置边框样式 */
  padding: 2px;
  text-align: left;
  font-size: 12px;
  font-weight: 450;
  color: var(--el-text-color)
}
::v-deep .el-form-item {
  margin-bottom: 0px !important; /* 使内容显示更近紧促 */
}
.table tr:hover {
  background-color: #f5f5f5;
  cursor: pointer;
}

.selected {
  background-color: var(--cvrg-select-row-bg-color) !important;
}
:deep(.el-input__inner) {
  text-align: right!important;
}

.cvrg-hearder {
  border-bottom: var(--rt-border);
  padding-bottom: 3px;
}
.cvrg-body__ {
  margin-top: 5px;
  .body-group-info {
    margin-top: 5px;
    border: 1px var(--el-border-color-lighter) solid;
    padding: 3px;
    .group-header {
      margin-bottom: 3px;
      background-color: var( --cvrg-sub-header-bg-color);
      //padding: 2px
      padding: 5px 10px;
    }
  }
}

.crvg_form__ {
  margin-top: 3px;
}

.isDutyfree {
  display: flex;
  align-items: center;
  margin-left: 20px;
  img {
    width: 18px;
  }
}

:deep(.item .el-badge__content.is-fixed) {
  top: 10px;
}
</style>
