<template>
  <myCard :cardConfig="cardconfig">
    <div
        class="_group_item"
        v-for="(k, i) in pageInfo"
        :key="i"
        :id="k.id"
    >
      <component
          v-show="!pageView.hiddenCompKeys.includes(k.pageKey)"
          :ref="(res: any) => {
            structure.setCompRef(`group-${k.cProdNo}`, res)
            if(k.pageKey === 'dist') {

            }
            if(k.cProdNo === '000000' && k.cProdList) {
              k.cProdList.forEach((prodNo: string) => structure.setCompRef(`group-${prodNo}`, res))
            }
            if(res && res.addProvide){

            }
          }"
          :is="k.customKey ? k.customKey : k.pageType === 'custom' ? k.pageCode : k.pageKey + '-ref'"
          :pageSchema="k.pageSchema"
          :compKey="k.pageCode"
          :group-id="`group-${k.cProdNo === '000000' ? k.cProdList[0] : k.cProdNo}`"
      />

    </div>
  </myCard>
</template>

<script setup lang="ts">
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { useRoute } from "vue-router";
import {  creatCardConfig } from "@/shared/mytemplate/card-config";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";
import {ref} from "vue";
import {CompositePageView, CustomStructure} from "@/views/pcis/support/composite.types";

const props = defineProps({
  pageSchemaList: {
    type: [Array],
    required: true,
  },
  compKey: {
    type: String
  },
});

const route = useRoute();
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const opertaor = dataOpertaor(idxParam.opertaorProps);
const pageView = inject("pageView", ref(new CompositePageView()));
const cardconfig = ref(creatCardConfig({
  title: '免赔说明'
}));
const structure = new CustomStructure()
const pageInfo = computed(() => structure.groupBuild(props.compKey, props.pageSchemaList))

onMounted(() => {
  console.log('免赔说明-pageInfo', pageInfo)
})

function getCopyList() {
  const resultList: any[] = []

  const getAppNo = (prodNo: string) => {
    const o = pageView.value.getDataOpertaorByProdNo(prodNo);
    return o?.getDataAll()['plyBase']['Base.cAppNo']
  }
  const getSchemaByProdNo = (prodNo: string) => {
    return props.pageSchemaList.find((f: any) => f.cProdNo === prodNo)
  }
  pageInfo.value?.forEach((page: any) => {
    if(page.cProdNo === '000000') {
      const oProdNo: string = page.cProdList[0]
      const oSchema: any = getSchemaByProdNo(oProdNo)
      const copy: any = {
        cProdNo: oProdNo,
        componentKey: oSchema.pageCode,
        componentTable: oSchema.pageTable,
        cAppNo: getAppNo(oProdNo),
        copyList: page.cProdList
            .filter((f: any, idx: number) => idx > 0)
            .map((iProdNo: string) => {
              const iSchema: any = getSchemaByProdNo(iProdNo)
              return {
                cProdNo: iProdNo,
                componentKey: iSchema.pageCode,
                componentTable: iSchema.pageTable,
                cAppNo: getAppNo(iProdNo),
              }
            })
      }
      resultList.push(copy)
    }
  })
  return resultList;
}



function getFromValue(groupId: string) {
  return structure.getCompRef(groupId).getFromValue();
}
function setFormValue(value: any, groupId: string) {
  structure.getCompRef(groupId).setFormValue(value);
}

function getFormConfig(groupId: string) {
  return pageInfo.value?.find(p => groupId.includes(p.cProdNo));
}

function setDisabledAll(isDisabled: boolean, groupId: string) {
  structure.componentRefMap.entries().forEach(([key, ref]) => {
    ref.setDisabledAll();
  })
}
defineExpose({
  getCopyList,
  getFromValue,
  setFormValue,
  getFormConfig,
  setDisabledAll,
});
</script>

<style scoped></style>
