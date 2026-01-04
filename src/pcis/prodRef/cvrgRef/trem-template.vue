<template>
  <div>
    <el-form ref="templateRef" :model="termdata" :inline-message="true">
      <el-card class="cvrg-info">
        <template #header v-if="effectiveShowConf.showHeader">
          <div class="cvrg-hearder">
            <el-row justify="start">
              <el-col :span="16">
                <div style="display: flex; align-items: center;">
                  <a style="margin-right: 5px" @click="showData = !showData">
                    <el-icon v-if="!showData" color="var(--el-text-color)"><ArrowUpBold /></el-icon>
                    <el-icon v-if="showData" color="var(--el-text-color)"><ArrowDownBold /></el-icon>
                  </a>
                  <!-- <el-tag :type="term.cRdrTyp === '0' ? 'danger' : 'success'">{{
                    term.cRdrTyp === "0" ? "主" : "附加"
                  }}</el-tag> -->
                  <div :class="['cvrg-hearder-main-title',term.cRdrTyp === '0' ? 'zhu' : 'fu']">
                    <img :src="term.cRdrTyp === '0' ? zhuImageUrl : fuImageUrl" alt="" srcset="">
                    <el-text class="mx-1" truncated @click="checkIfTruncated($event, term.cNmeCn)">
                      {{ term.cNmeCn }}
                    </el-text>
                  </div>
                  <!-- 增加应税、免税标识 -->
                  <template v-if="term.isDutyfree">
                    <span class="isDutyfree">
                      <img :src="term.isDutyfree === '0' ? yingImageUrl : term.isDutyfree === '1' ? mianImageUrl : ''" alt="" srcset="">
                    </span>
                  </template>
                  <template v-if="termdata['Term.cCancelMrk'] === '1'">
                    <el-badge value="退" class="item">
                      <el-tag type="warning">{{ term.cNmeCn }}</el-tag>
                    </el-badge>
                  </template>
                  <template v-else>
                    <el-tooltip content="预览条款" placement="top">
                      <el-button
                        type="text"
                        @click="previewTerm"
                        style="margin-left: 3px"
                      ><rt-icon :item="{ icon: 'View' }" />
                    </el-button>
                    </el-tooltip>
                  </template>
                </div>
              </el-col>
              <el-col :span="5">
                <template v-for="(item, k) in termFactormap" :key="k">
                  <el-row v-if="item.cPorpShowtitle === '1'" align="center" justify="start">
                    <el-form-item
                        :label="`${item.title}:`"
                        class="show_title"
                        :prop="item.prop"
                        :rules="isrequired(item) ? getRequired() : undefined"
                    >
                      <from-item
                          v-model="termdata[item.prop]"
                          @update:modelValue="termUpdate()"
                          :item="item"
                      />
                    </el-form-item>
                  </el-row>
                </template>
              </el-col>
              <el-col :span="3" justify="end">
                <rtButton
                    v-if="!btnItem.addrisk.hidden && riskShowTyp === 'grid'"
                    @click="
                  () => {
                    addriskView();
                  }
                "
                    :item="btnItem.addrisk"
                />
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
          <template v-if ="termFactormap.length && effectiveShowConf.showTerm">
            <template v-if="termTitleConf.cFactorTabType === 'grid'">
              <div class="table_overflow_x">
                <el-row>
                  <el-col :span="17">
                    <div class="showData_left__">
                      <table>
                        <thead>
                        <tr class="table-title">
                          <th width="250" style="max-width: 10%;">{{ termTitleConf.cFactorTabTitle }}</th>
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
                                  @update:modelValue="termUpdate()"
                                  :item="item"
                                />
                              </el-form-item>
                            </td>
                          </tr>
                        </template>
                        </tbody>
                      </table>
                    </div>
                  </el-col>
                  <el-col :span="7">
                    <div class="showData_right__">
                    </div>
                  </el-col>
                </el-row>
              </div>
            </template>
            <template v-else-if="termTitleConf.cFactorTabType === 'table'">
              <div class="table_overflow_x">
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
                            @update:modelValue="termUpdate()"
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
                                    @update:modelValue="termUpdate()"
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
              </div>
            </template>
            <template v-else>
              <app-free-edit
                :freeEditConfig="formconfig1"
                ref="termRef"
                @updateDatas="termUpdate()"
              />
            </template>
          </template>
          <template v-if="riskShowTyp === 'grid'">
            <app-grid-edit :gridEditConfig="riskGridConfig" ref="riskTableRef" @updateDatas="termUpdate()"/>
          </template>
            <template v-if="riskShowTyp !== 'grid'"> 
              <template v-for="(ginfo, gk) in groupInfo" :key="gk">
              <div style="margin-top: 10px; border: 1px var(--el-border-color-lighter) solid; padding: 3px;">
                <el-row style="margin-bottom: 3px; background-color: var( --cvrg-sub-header-bg-color); padding: 2px">
                  <el-col :span="22">
                    <a
                      style="margin-right: 5px;font-size: 12px;"
                      @click="ginfo.hidden = !ginfo.hidden"
                    >
                      <el-icon v-if="ginfo.hidden" size="11"><ArrowUpBold /></el-icon>
                      <el-icon v-if="!ginfo.hidden" size="11"><ArrowDownBold /></el-icon>
                    </a>
                    <span style="font-size: 13px; font-weight: 450;">
                      {{ ginfo.cGroupTitle }}
                    </span>
                  </el-col>
                </el-row>
                <el-row v-if="!ginfo.hidden">
                  <div class="table_overflow_x">
                    <table style="width: 100%">
                      <thead>
                        <tr class="table-title">
                          <th
                            v-for="col in getColinfo(ginfo.cGroupId)"
                            :key="col.cColId"
                            :width="col.cColWidth ? col.cColWidth : null"
                            :style="{'min-width': col.cColTitle === '免赔方式' ? '95px' : col.cColTitle === '限额值' ? '130px' : col.cColTitle === '分项费率' ? '112px' : col.cColTitle === '免赔率' ? '105px' : ''}"
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
                                            @update:modelValue="riskUpdate(riskList[riskdata.rowConfig[colinfo.cColId][n - 1].cRiskNo])"
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
                                          @update:modelValue="termUpdate()"
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
                  </div>
                </el-row>
              </div>
            </template>
          </template>
        </div>
      </el-card>
    </el-form>
    <comDialog ref="dialog"></comDialog>
  </div>
</template>

<script setup lang="ts">
import { getTRFactorJson,getPrdTermInfo,viewPdfProposal, viewPdfProposalPost } from "@/api/prod";
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
import { deductibleTemple,deductibleKey, fillTemplate } from "./titleTemple";
import {CommonConstants} from "@/constants/CommonConstants";
import { ITEM_RENDER_EVT } from "element-plus/es/components/virtual-list/src/defaults";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";
import Decimal from "decimal.js";
import {checkIfTruncated} from "@/utils/common";
import { AppGridEditMethod, createAppGridEditConfig } from "@/shared/app-grid-edit-config";
import { createFreeButtonBase } from "@/shared/button-config";
import { DialogMethod } from "@/common/dzmodel/ComDialogConf";

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
  addrSeqArray: {
    type: Array,
    default: () => []
  }
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
const dialog = ref<DialogMethod | null>(null);

const termdata = ref<{ [key: string]: any }>({});
const riskList = ref<{ [key: string]: any }>({});
const riskShowTyp = ref<string>('table');
const riskGridConfig = ref(createAppGridEditConfig({
  editFlag: true,
}));

// 存储risk配置原始配置信息,用于批改显示
const riskExConfig = ref({
  'default':createAppGridEditConfig({
      editFlag: true,
    })
});

const riskTableRef = ref<AppGridEditMethod | null>(null);
const risksList = ref([]);

const pageInit = ref(false);
const btnItem = ref<{ [key: string]: { [key: string]: any } }>({
  delete: {
    label: "删除",
    size: "small",
  },
  addrisk: {
    label: "增加责任",
    size: "small",
    type: "warning"
  },
});

const {selectedRow} = storeToRefs(terconfig);
const zhuImageUrl = ref(new URL(`../../../assets/img/zhu.png`, import.meta.url).href);
const fuImageUrl = ref(new URL(`../../../assets/img/fu.png`, import.meta.url).href);
const yingImageUrl = ref(new URL(`../../../assets/img/ying.png`, import.meta.url).href);
const mianImageUrl = ref(new URL(`../../../assets/img/mian.png`, import.meta.url).href);

function termUpdate(){
  termDeductibleNote();
  update();
}

function riskUpdate(risk: any){
  riskDeductibleNote(risk);
  update();
}

function termDeductibleNote(){
  const termData = getDatas();
  const termNo = termData['Term.cClauseCode'];
  const k = deductibleKey.value[termNo]?deductibleKey.value[termNo]:deductibleKey.value['defterm'];

  const amt = termFactormap.value.filter(item=>item['prop']==k['amt']);
  const rate = termFactormap.value.filter(item=>item['prop']==k['rate']);
  const deduct = termFactormap.value.filter(item=>item['prop']==k['deduct']);

  if(amt && amt.length > 0 
      && rate && rate.length > 0
      && deduct && deduct.length > 0
  ){  // 当以上3项均存在时,则触发自动设置说明的方法
    const amt_d = termData[k['amt']];
    const rate_d = termData[k['rate']];
    const temk = (amt_d !== null && amt_d !== undefined ? '1':'0') + '' + (rate_d !== null && rate_d !== undefined ? '1':'0') ;
    const strt = deductibleTemple.value[temk];
    if(strt){
      const filledString = fillTemplate(strt, {
        amount: amt_d,
        rate: rate_d,
      });
      setData({
        propkey:k['deduct'],
      },filledString);
    }
    
  }
}

function riskDeductibleNote(risk: any) {
  const r = risk['TermRisktgt.cLiabCode'];
  const k = deductibleKey.value[r]?deductibleKey.value[r]:deductibleKey.value['defrisk'];
  const riskdata = getRiskFactors(r);
  const amt = riskdata.filter((item: any) => item['factorObj']['prop'] === k['amt']);
  const rate = riskdata.filter((item: any) => item['factorObj']['prop'] === k['rate']);
  const deduct = riskdata.filter((item: any) => item['factorObj']['prop'] === k['deduct']);
  if(amt && amt.length > 0 
      && rate && rate.length > 0
      && deduct && deduct.length > 0
  ){  // 当以上3项均存在时,则触发自动设置说明的方法
    const amt_d = risk[k['amt']];
    const rate_d = risk[k['rate']];
    const temk = (amt_d !== null && amt_d !== undefined ? '1':'0') + '' + (rate_d !== null && rate_d !== undefined ? '1':'0') ;
    const strt = deductibleTemple.value[temk];
    if(strt){
      const filledString = fillTemplate(strt, {
        amount: amt_d,
        rate: rate_d,
      });
      setData({
        propkey:k['deduct'],
        riskNo:r,
      },filledString);
    }
  }
}
function getRiskFactors(riskNo: any) { 
  const col = [];
  collist.value.forEach((item: any) => { 
    if(item.cRiskNo === riskNo){
      let riskd = JSON.parse(JSON.stringify(item));
      riskd.factorObj = factormap.value[riskd.cFactorId];
      col.push(riskd);
    }
   });
   return col;
}

function update() {
  emit("update:modelValue", getDatas());
}
function getDatas(){
  let newData;
  if( termTitleConf.value.cFactorTabType === "table" ||  termTitleConf.value.cFactorTabType === 'grid' ){
    newData = termdata.value;
  } else {
    newData = termRef.value?.getFromValue();
  }
  if( !newData ){
    newData = termdata.value;
  }
  if( extermConf.value && extermConf.value.length > 0 ){
    extermConf.value.forEach((v: any) => {
      newData[v.prop] = termdata.value[v.prop];
    });
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
  if(riskShowTyp.value === 'grid'){
    const r = riskTableRef.value?.getTableValue();
    newData.riskList = r;
  }
  return newData;
}
function addriskView(){
  const param = opertaor.getParam();
  dialog.value?.open(
    "addriskView",
    {
      type: "show",
      data: {
        cTermNo: props.modelValue["Term.cClauseCode"],
      },
    },
    {
      isOk: (selectdata: any) => {
        riskTableRef.value?.addRowByData(
          {
            "TermRisktgt.cLiabCode":selectdata
          }
        );
      },
    },
    { title: "增加责任", width: 50 }
  );
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
        };
        clearInterval(interval);
      }, 1000)
    }
    if(riskShowTyp.value === 'grid'){
      riskTableRef.value?.setFormValue(newData.riskList);
    }
    // 041010 非营运客运承运人责任险 标的信息 投保座位总数的值取所有险别信息中的投保座位数（座）的和
    if(pageparam.cProdNo === "041010") {
      const cvrgData = opertaor.getTableRefByKey("cvrg")?.getFromValue();
      let num = 0;
      cvrgData?.forEach((item:any) => {
        num += Number(item['Term.nSeatCount'] || 0)
      })
      opertaor.getTableRefByKey("tgt")?.setValue("Tgt.nSeatCapacity", num)
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
onMounted(async () => {
  initData(props.modelValue);
  dataInit(true);
});

// watch(() => props.modelValue, (newv,oldv)=>{
//   initData(newv);
//   dataInit();
// });

function dataFlash(){
  initData(props.modelValue);
  dataInit();
}

function dataInit(initFlag : boolean = false) {
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
    setTermConf(d,initFlag);
  } else {
    getTRFactorJson(param).then((res: any) => {
      const { code, data, msg } = res;
      if (200 === code) {
        terconfig.addConfig(queryKey, JSON.stringify(data.data));
        setTermConf(data.data,initFlag);
      } else {
        ElMessage.error(msg);
      }
    });
  }
  // 0421070701保险经纪人职业责任保险条款-标的信息-执业许可证号设置非必填
  if (termdata.value['Term.cUniqueTermNo'] === '00425000144') {
    const tgt = opertaor.getTableRefByKey("tgt");
    tgt?.setFormItem("Tgt.cPracticingLicense", {
      rules: []
    });
  }
}

// 是否需要数据初始化渲染
function setTermConf(d: any,initFlag: boolean){
  collist.value = getUseData(d.collist);
  factormap.value = d.factormap;
  colInfo.value = d.colInfo;
  groupInfo.value = d.groupInfo;
  term.value = d.term;
  termFactormap.value = getUseData(d.termFactormap);

  if (d.riskConf?.CCnm) { // 获取条择标，显示样式
    riskShowTyp.value = d.riskConf.CCnm;
  }
  if(riskShowTyp.value === 'grid'){
    const riskFactormap = getUseData(d.riskFactormap);
    if(riskFactormap && riskFactormap.length > 0){
      riskFactormap.forEach((riskfactor: any)=>{
        if(isrequired(riskfactor)){ 
          riskfactor['rules'] = [getRequired()]
        }
        if(isdisabled(riskfactor)){
          riskfactor['disabled'] = true;
        }
        if(riskfactor.expand){
          riskGridConfig.value.showExpand = true;
        }
      })
    }
    if((pageparam.pageType === 'TEMPORARY_DEPOSIT' || pageparam.pageType === 'EDR_APP_NEW_SCENE') && pageparam.cEdrType){ // 批改场景,增加退保标识字段
      riskFactormap[riskFactormap.length] = {
        prop: "TermRisktgt.cCancelMrk",
        inputtype: "rttag",
        nullvalue: "0",
        title: "退保标识",
        loadData: [
          {
            label: "生效中",
            value: "0",
            color: "#14CCCC",
          },
          {
            label: "已退",
            value: "1",
            color: "#FF6600",
          },
        ],
      }
    }
    
    methodLink(riskFactormap);
    riskGridConfig.value.tableBtn = [
      createFreeButtonBase({
        id:"deleteRisk",
        type: "danger",
        link: true,
        icon: "DeleteFilled",
        tableClick: (r) => {
          if(r['TermRisktgt.cRowId']){
            riskTableRef.value?.setValueByRowKey("TermRisktgt.cCancelMrk", r._dataId, "1");
          }else{
            riskTableRef.value?.delRow(r._dataId);
          }
        },
      }),
    ]
    riskGridConfig.value.fromSchema = riskFactormap;
    riskGridConfig.value.getExSchema = (row : any) => {
      if(!row['TermRisktgt.cRowId']){
        return 'default';
      }
    };
    riskGridConfig.value.exfromSchemas = {
      'default': JSON.parse(JSON.stringify(riskFactormap))
    }; 
  }
  const cAddrSeq = termFactormap.value.find(item => item.prop === 'Term.cDistCodeNo');
  if (cAddrSeq) {
      cAddrSeq.loadData = JSON.parse(sessionStorage.getItem("getAddrSeqData"));
  }
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
  // 方案配置时条款信息中的保险费是可以编辑的
  if(route.name === "plan-info") {
    termFactormap.value.forEach((item:any) => {
      if(item.prop === "Term.nInsuranceFee") {
        item.disabled = false
      }
    })
  }
  methodMap.cRateMethodChange(termdata.value['Term.cRateMethod'])
  if (props.disabledFlag) {
    setDisabledAll();
  }
  initMethod();

  if(initFlag){
    nextTick(()=>{
      initData(props.modelValue);
    })
  }
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
  if (pageparam.cProdNo === "043009" && termdata.value['Term.cRdrTyp'] !== '1') {
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
  if((pageparam.pageType === 'TEMPORARY_DEPOSIT' || pageparam.pageType === 'EDR_APP_NEW_SCENE') && pageparam.cEdrType && !props.modelValue['Term.cRowId']){
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
  if(riskShowTyp.value === 'grid'){
    let delBtn = true;
    if (unbut && unbut.length > 0) {
      const t = unbut.find((un: any) => un["cEdrItem"] === "delrisk_btn");
      if (t) {
        delBtn = false;
      }
    }
    if(riskGridConfig.value.fromSchema && riskGridConfig.value.fromSchema.length > 0 ){
      riskGridConfig.value.fromSchema.forEach((risk: any) => {
        risk.disabled = true;
        riskGridConfig.value.tableBtn.forEach((btn: any) => {
          btn.hideBtns = (row: any) => {  // 如果是新增的责任,则固定显示删除按钮,如果是修改的,则根据配置隐藏删除按钮
            const isHasRow = !row['TermRisktgt.cRowId'];
            if(isHasRow){
              return false;
            }else{
              return delBtn;
            }
          };
        });
        if (undis && undis.length > 0) {
          const t = undis.find((un: any) => un["cEdrItem"] === risk["prop"]);
          if (t) {
            risk.disabled = false;
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
      if(items[i]['btnItems'] && items[i]['btnItems']["func"] && typeof items[i]['btnItems']["func"] === "string"){ // 增加后置按钮方法绑定
        items[i]['btnItems']["func"] = methodMap[items[i]['btnItems']["func"]];
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
      if(items[k]['btnItems'] && items[k]['btnItems']["func"] && typeof items[k]['btnItems']["func"] === "string"){ // 增加后置按钮方法绑定
        items[k]['btnItems']["func"] = methodMap[items[k]['btnItems']["func"]];
      }
    });
  }
}

/**
 * 
 * @param params 根据参数,对条款数据进行赋值{propkey:赋值的要数key,riskNo:条则标时,需要对应的条则标码值}
 * @param data 
 */
function setData(params: any,data:any){
  const propkey = params.propkey;
  if(propkey){
    if(propkey.startsWith("TermRisktgt")){
      if(params.riskNo){
      const riskNo = params.riskNo;
      riskList.value[riskNo][propkey] = data;
      }
      
    }else if(propkey.startsWith("Term")){ 
      termdata.value[propkey] = data;
    }
  }
}

const methodMap = {
  butTestCheck:(item: any,row: any) => {
    console.log(item);
    console.log(row);
    riskTableRef.value?.setValueByRowKey(item.prop,row._dataId,"111111");
  },
  excludeLimitChang:(val:any,row:any,item:any) => {
    if (pageparam.cProdNo === "040015") {
      termdata.value['Term.nInsuranceAmount'] = val;
    }
    update();
  },
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
  // 费率计算方式(0: 按限额 1: 按人)
  cRateMethodChange:(val:any)=> {
    // 040020-保险经纪人的条款费率计算方式:按限额，费率必填；按人，每人保费必填、在职保险经纪人人数（标的信息）必填
    if(termdata.value["Term.cUniqueTermNo"] !== "00425000144") return;
    termFactormap.value.forEach((item: any) => {
      if (item["prop"] === "Term.nRateVal") {
        if(val === "0") {
          item.cPorpRequired = true;
        } else {
          item.cPorpRequired = false;
        }
      }
      if(item["prop"] === "Term.nPersonPremium") {
        if(val === "1") {
          item.cPorpRequired = true;
        } else {
          item.cPorpRequired = false;
        }
      }
    });
    const tgt = opertaor.getTableRefByKey("tgt")
    if(val === "1") {
      tgt?.setFormItem('Tgt.nAgentNumber',{ rules: [getRules("required", {})] })
    } else {
      tgt?.setFormItem('Tgt.nAgentNumber',{ rules: [] })
    }
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
@import "src/styles/custom-index";
.cvrg-info {
  //background: #FAFAFA;
  box-shadow: none;
  border: none;
  --el-card-border-color: transparent;
  padding: 5px 20px;
  :deep(.el-card__header) {
    // background-color: #eff3f5;
    padding: 5px 10px;
    background: transparent;
  }
  :deep(.el-card__body) {
    padding: 0px 10px;
  }
  .cvrg-hearder {
    border-bottom: var(--rt-border);
    padding-bottom: 3px;

    :deep(.el-form-item) {
      .el-form-item__label {
        text-align: right;
        align-items: center;
        width: 50%;
        line-height: 12px;
        font-weight: 450 !important;
        font-size: 11px;
        color: var(--el-text-color);
      }
      .el-form-item__content {
        @extend .rt-custom-select;
      }
    }
  }
  .cvrg-hearder-main-title {
    display: flex;
    align-items: center;
    border-radius: 12px;
    padding: 2px 10px;
    max-width: 85%;
    &.zhu {
      background: linear-gradient( 180deg, rgba(58, 118, 198, .1) 0%, rgba(57, 117, 198, .1) 100%);
      color: #3A76C6;
    }
    &.fu {
      background: rgba(198, 105, 58, 0.1);
      color: var(--el-color-primary);
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
.cvrg-body__ {
  margin-top: 10px;
}
.table-title {
  th {
    text-align: center;
    background: var(--cvrg-group-header-bg-color);
    white-space: wrap;
    max-width: 150px;
    min-width: 80px;
    font-size: var(--rt-form-content-font-size);
    font-weight: 450;
    color: var(--el-text-color);
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
  padding-left: 60px; /* 空三格 */
  position: relative;
}
.custom-indent::before {
  content: "其中：";
  position: absolute;
  left: 20px;
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
  font-size: var(--rt-form-content-font-size);
  font-weight: var(--rt-form-content-font-weight);
  color: var(--el-text-color)
}
::v-deep .el-form-item {
  margin-bottom: 0px !important; /* 使内容显示更近紧促 */
}
.table tr:hover {
  background-color: var(--el-color-primary);
  cursor: pointer;
}

.selected {
  background-color: var(--cvrg-select-row-bg-color) !important;
}
:deep(.el-input__inner) {
  text-align: right!important;
}

.table_overflow_x {
  width: 100%;
  overflow-x: auto;
}

.showData_left__ {
  margin: 5px 0 0 10%;
}
.showData_right__ {
  margin: 30px 10px 10px 20px;
}

.isDutyfree {
  display: flex;
  align-items: center;
  img {
    width: 18px;
  }
}
</style>
