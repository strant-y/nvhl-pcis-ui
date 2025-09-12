<template>
  <div>
    <table style="width: 100%">
      <thead>
        <tr class="table-title">
          <th style="width: 80px">序号</th>
          <th v-for="(item, k) in formcof" :key="k" :style="{width: item.width?item.width+'px':null}">
            {{ item.title + (k === 'nMainRate' ? item.suffix : '') }}
          </th>
          <th style="width: 100px">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, k) in props.planData" :key="k">
          <td>
            {{ k + 1 }}
          </td>
          <td v-for="(it, kk) in formcof" :key="kk">
            <template v-if = "it['inputtype'] === 'rttag'">
              <el-badge value="退" class="term_badge" :hidden="item['Term.cCancelMrk'] !== '1'" >
                <from-item
                v-model="item['Term.'+kk]"
                :item="getterm(it,item)"
              />
              </el-badge>
            </template>
            <template v-else>
              <from-item
                v-model="item['Term.'+kk]"
                :item="getterm(it,item)"
              />
            </template>
            
          </td>
          <td>
            <rtButton
              v-if="checkShowBtn(item)"
              @click="
                () => {
                  emit('delete', item);
                }
              "
              :item="btnConf.delete"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { terConfig } from "@/store/modules/term-config";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";

const emit = defineEmits(["update:modelValue", "delete"]);
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const opertaor = dataOpertaor(idxParam.opertaorProps);
const param = opertaor.getParam();
const terconfig = terConfig();

const props = defineProps({
  planData: {
    type: Object,
    required: true,
  },
  disabledFlag: {
    type: Boolean,
    default: false,
  },
});

onMounted(() => {});

const btnConf = ref<{ [key: string]: { [key: string]: any } }>({
  delete: {
    label: "删除",
  },
});

const formcof = ref<{ [key: string]: { [key: string]: any } }>({
  cClauseCode: {
    inputtype: "rttag",
    typeCode: "TermCodeTag",
    title:'附加条款名称',
  },
  cRemarkInfo: {
    inputtype: "rtinput",
    title:'备注',
  },
});

function setDisabledAll() {
  Object.keys(formcof.value).forEach((k: any) => {
    formcof.value[k].disabled = true;
  });
  Object.keys(btnConf.value).forEach((k: any) => {
    btnConf.value[k].hidden = true;
  });
}

function checkShowBtn( data: any ){ 
  let r = true;
  Object.keys(btnConf.value).forEach((k: any) => {
    r = r && !btnConf.value[k].hidden;
  });
  if(param.cEdrType && !data['Term.cRowId']){
    r = true;
  }
  return r;
};

function changeBtn() { 
  // Object.keys(formcof.value).forEach((k: any) => {
  //   formcof.value[k].disabled = props.disabledFlag || formcof.value[k].disabled;
  // });
  
  if(param.cRsnCde !== '11'){
    Object.keys(btnConf.value).forEach((k: any) => {
      btnConf.value[k].hidden = props.disabledFlag;
    });
  }
}

function getterm(it: any,termdata: any){
  if(param.cEdrType && !termdata['Term.cRowId'] && opertaor.isEditScene()){
    it.disabled = false || it.disabled ;
  }else{
    it.disabled = props.disabledFlag || it.disabled;
  }
  return it;
}
function setCancel(){
  props.planData['Term.cCancelMrk'] = '1';
}
watch(() => props.disabledFlag, (val) => { 
  changeBtn();
});

onMounted(() => { 
  changeBtn();
});

function dataInit() {}
function dataFlash() {}


defineExpose({
  dataInit,
  dataFlash,
  setDisabledAll,
  setCancel
});
</script>
<style lang="scss" scoped>
table {
  border-collapse: collapse; /* 合并边框 */
  width: 100%;
}
.show_title {
  margin-bottom: 0px;
}
table,
th,
td {
  border: 1px solid #f5f5f5; /* 设置边框样式 */
  padding: 2px;
  text-align: left;
}
::v-deep .term_badge .el-badge__content{
  top: 5px !important;
}
</style>
