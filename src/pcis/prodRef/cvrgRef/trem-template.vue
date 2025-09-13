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
                    <el-icon v-if="!showData"><ArrowUpBold /></el-icon>
                    <el-icon v-if="showData"><ArrowDownBold /></el-icon>
                  </a>

                  <!-- <el-tag :type="term.cRdrTyp === '0' ? 'danger' : 'success'">{{
                    term.cRdrTyp === "0" ? "主" : "附加"
                  }}</el-tag> -->
                  <div :class="['cvrg-hearder-main-title',term.cRdrTyp === '0' ? 'zhu' : 'fu']">
                    <img :src="term.cRdrTyp === '0' ? '/src/assets/img/zhu.png' : '/src/assets/img/fu.png'" alt="" srcset="">
                    <span>{{ term.cNmeCn }}</span>
                  </div>
                  <template v-if="termdata['Term.cCancelMrk'] === '1'">
                    <!-- <el-badge value="退" class="item">
                      <el-tag type="warning">{{ term.cNmeCn }}</el-tag>
                    </el-badge> -->
                  </template>
                  <template v-else>
                    <!-- <el-tag type="warning"  style="margin-right: 8px;">{{ term.cNmeCn }}</el-tag> -->
                    <el-tooltip content="下载条款" placement="top">
                      <el-button
                        type="text"
                        @click="downloadTerm"
                        style="margin-right: 5px"
                        size="small"
                      ><rt-icon :item="{ icon: 'term' }" />
                    </el-button>
                    </el-tooltip>
                    <el-tooltip content="预览条款" placement="top">
                      <el-button
                        type="text"
                        @click="previewTerm"
                        style="margin-right: 5px"
                        size="small"
                      ><rt-icon :item="{ icon: 'View' }" />
                    </el-button>
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

        <div v-show="showData">
          <template v-if ="termFactormap.length && effectiveShowConf.showTerm">
            <template v-if="termTitleConf.cFactorTabType === 'grid'">
              <table style="width: 50%;margin-left: 100px;">
                <thead>
                  <tr class="table-title">
                    <th width="300">{{ termTitleConf.cFactorTabTitle }}</th>
                    <th>{{ termTitleConf.cFactorTabValue }}</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-for="(item, k) in termFactormap" :key="k">
                    <tr v-if="item.cPorpShowtitle !== '1'">
                      <td
                      :class="{
                          'custom-indent':item.cPropIndent === '1',
                      }" class="text-indent">
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
              <app-free-edit
                :freeEditConfig="formconfig1"
                ref="termRef"
                @updateDatas="update"
              />
            </template>
          </template>
          <template v-for="(ginfo, gk) in groupInfo" :key="gk">
            <el-row>
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
          </template>
        </div>
      </el-card>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { getTRFactorJson,getPrdTermInfo } from "@/api/prod";
import {
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import { formInit } from "@/shared/from-init";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { terConfig } from "@/store/modules/term-config";
import { useValidator } from "@/typings/useValidator";
import { useRoute } from "vue-router";
import { v4 as uuidv4 } from "uuid";
import {CommonConstants} from "@/constants/CommonConstants";
import { ITEM_RENDER_EVT } from "element-plus/es/components/virtual-list/src/defaults";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";

const route = useRoute();
const templateRef = ref();
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const opertaor = dataOpertaor(idxParam.opertaorProps);
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
  rowIndex: {
    type: [Number, String],
  },
  showHeader: {
    type: Boolean,
    default: true,
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
  const newData = JSON.parse(JSON.stringify(data));
  // 缓存条款数据
  const termData = JSON.parse(JSON.stringify(data));
  termData.riskList = null;
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
条款下载
*/
function downloadTerm() {
  const clauseLink = termdata.value["Term.cClauseLink"];
  const newparam = { cTermNo: termdata.value['Term.cClauseCode'], pageNum: 1, pageSize: 10 };
  const cWebsite = getPrdTermInfo(newparam)
    .then((res) => {
      const { code, data, msg } = res;
      if (200 === code) {
        const cWebsite = data.cWebsite;
        if (!cWebsite) {
          ElMessage.warning("条款附件地址为空，请联系产品中心处理");
          return;
        }
        const link = document.createElement('a');
        link.href = cWebsite;
        link.target = '_blank'; 
        link.download = ''; 
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        ElMessage.success("开始下载条款文档");
      } else {
        ElMessage.error(msg);
      }
    })
}
/*
条款预览
*/
function previewTerm() {
  const newparam = { cTermNo: termdata.value['Term.cClauseCode'], pageNum: 1, pageSize: 10 };
  
  getPrdTermInfo(newparam).then((res) => {
    const { code, data, msg } = res;
    if (200 === code) {
      const cWebsite = data.cWebsite;
      if (!cWebsite) {
        ElMessage.warning("条款链接为空，无法预览");
        return;
      }
      // 判断文件类型并进行相应预览
      const fileExtension = getFileExtension(cWebsite).toLowerCase();
      console.log("0000000",fileExtension,cWebsite);
      if (fileExtension === 'pdf') {
        // PDF文件使用浏览器内置查看器或新窗口打开
        window.open(cWebsite, '_blank');
      } else if (['doc', 'docx'].includes(fileExtension)) {
        fetch(cWebsite, { method: 'HEAD' })
          .then(response => {
            if (response.ok) {
              // 使用微软Office Online预览Word文档
              const previewUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(cWebsite)}&embedded=true`;
              window.open(previewUrl, '_blank');
            } else {
              // 如果无法访问文件，则直接下载
              ElMessage.info("无法在线预览文档，将直接下载");
              const link = document.createElement('a');
              link.href = cWebsite;
              link.target = '_blank';
              link.download = '';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }
          })
          .catch(error => {
            // 如果出现网络错误，也直接下载
            ElMessage.info("无法在线预览文档，将直接下载");
            const link = document.createElement('a');
            link.href = cWebsite;
            link.target = '_blank';
            link.download = '';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          });
      } else {
        // 其他文件类型直接下载
        ElMessage.info("该文件类型不支持在线预览，将直接下载");
        const link = document.createElement('a');
        link.href = cWebsite;
        link.target = '_blank';
        link.download = '';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } else {
      ElMessage.error(msg);
    }
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
function previewWordDocument(url) {
  // 创建一个隐藏的iframe来测试预览服务
  const testIframe = document.createElement('iframe');
  testIframe.style.display = 'none';
  
  // 首先尝试Google Docs Viewer
  const googleDocsUrl = `https://docs.google.com/gviewer?url=${encodeURIComponent(url)}&embedded=true`;
  
  // 设置超时时间
  const timeout = setTimeout(() => {
    // 超时则使用Microsoft Office Online
    document.body.removeChild(testIframe);
    const officeOnlineUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`;
    window.open(officeOnlineUrl, '_blank');
  }, 3000);
  
  testIframe.onload = function() {
    clearTimeout(timeout);
    document.body.removeChild(testIframe);
    // Google Docs Viewer可用，使用它来预览
    window.open(googleDocsUrl, '_blank');
  };
  
  testIframe.onerror = function() {
    clearTimeout(timeout);
    document.body.removeChild(testIframe);
    // Google Docs Viewer不可用，尝试使用Microsoft Office Online
    const officeOnlineUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`;
    window.open(officeOnlineUrl, '_blank');
  };
  
  document.body.appendChild(testIframe);
  testIframe.src = googleDocsUrl;
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
    collist.value = d.collist;
    factormap.value = d.factormap;
    colInfo.value = d.colInfo;
    groupInfo.value = d.groupInfo;
    term.value = d.term;
    termFactormap.value = d.termFactormap;
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
        collist.value = data.data.collist;
        factormap.value = data.data.factormap;
        colInfo.value = data.data.colInfo;
        groupInfo.value = data.data.groupInfo;
        term.value = data.data.term;
        termFactormap.value = data.data.termFactormap;

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
}

/**
 * 条款初始化判断
 * @param item 
 */
function initTermsData(item: any) {
  if(item.prop === 'Term.cClaimInclude'){ //是否计入累计赔偿限额 默认选择否
    if(termdata.value[item.prop] === null || termdata.value[item.prop] === undefined){
      if(pageparam.cProdNo === "040003" || pageparam.cProdNo === "043002" || pageparam.cProdNo === "040002" ){
        termdata.value[item.prop] = '1';
      }else{
        termdata.value[item.prop] = '0';
      }
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
   // 040002个性化配置
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

  if(i.cPropRequired === "1" || i.cPropRequired === 1 || i.cPropRequired === true){
    return true;
  }
  if(i.cPropRequired === "0" || i.cPropRequired === 0 || i.cPropRequired === false ){
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
  }
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

defineExpose({
  dataFlash,
  dataInit,
  setDisabledAll,
  setCancel,
  validate,
});
</script>
<style lang="scss" scoped>
.cvrg-info {
  background: #FAFAFA;
  box-shadow: none;
  border: none;
  --el-card-border-color: transparent;
  padding: 10px 20px;
  :deep(.el-card__header) {
    // background-color: #eff3f5;
    padding: 5px 10px;
    background: transparent;
  }
  :deep(.el-card__body) {
    padding: 5px 10px;
  }
  .cvrg-hearder-main-title {
    display: flex;
    align-items: center;
    border-radius: 12px;
    padding: 2px 10px;
    &.zhu {
      background: linear-gradient( 180deg, rgba(58, 118, 198, .1) 0%, rgba(57, 117, 198, .1) 100%);
      color: #3A76C6;
    }
    &.fu {
      background: rgba(198, 105, 58, 0.1);
      color: #C6693A;
    }
    img {
      width: 16px;
      height: 18px;
    }
    span {
      font-size: 14px;
      line-height: 20px;
    }
  }
}
.table-title {
  // background-color: #e6e6e6;
  th {
    text-align: center;
    background: rgba(0,0,0,0.04);
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
  border: 1px solid #e2e2e2; /* 设置边框样式 */
  padding: 2px;
  text-align: left;
}
::v-deep .el-form-item {
  margin-bottom: 0px !important; /* 使内容显示更近紧促 */
}
.table tr:hover {
  background-color: #f5f5f5;
  cursor: pointer;
}

.selected {
  background-color: rgba(146, 209, 232, 0.5) !important;
}
:deep(.el-input__inner) {
  text-align: right!important;
}
</style>
