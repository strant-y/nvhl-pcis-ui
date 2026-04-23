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
            if(k.cProdNo === '000000' && k.cProdList) {
              k.cProdList.forEach((prodNo: string) => structure.setCompRef(`group-${prodNo}`, res))
            }
          }"
          :is="k.customKey ? k.customKey : k.pageType === 'custom' ? k.pageCode : k.pageKey + '-ref'"
          :pageSchema="k.pageSchema"
          :compKey="k.pageCode"
      />
    </div>
  </myCard>
</template>

<script setup lang="ts">
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { useRoute } from "vue-router";
import {  creatCardConfig } from "@/shared/mytemplate/card-config";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";

const route = useRoute();
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const opertaor = dataOpertaor(idxParam.opertaorProps);
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
const pageView = inject("pageView", ref(new CompositePageView()));
const cardconfig = ref(creatCardConfig({
  title: '保障方案'
}));
const structure = reactive(new CustomStructure());
const pageInfo = computed(() => {
  const list = structure.groupBuild(props.compKey, props.pageSchemaList)
  list?.forEach((item: any) => {
        item.pageSchema.title = undefined
      })

  return list;
})

onMounted(() => {
  console.log('保障方案-pageInfo', pageInfo.value)
})

function getPlanNo(groupId: string) {
  const list = getFromValue(groupId)
  console.log('getPlanNo-list', groupId, list)
  // return list
  //   ?.map((i: any) => {
  //     return {
  //       label: i.cPlanNo,
  //       value: i.cPlanNo
  //     }
  //   })

  // 先写死
  return [
    {
          label: 'P1',
          value: 'P1'
    }
  ]
}

function getFromValue(groupId: string) {
  const list = structure.getCompRef(groupId).getFromValue();
  if(list && list.length > 0 && groupId) {
    return list.filter((item: any) => groupId.includes(item.cProdNo) || groupId.includes(item['PlanBase.cProdNo']))
  }
  return list
}
function setFormValue(value: any, groupId: string) {
  structure.getCompRef(groupId).setFormValue(value);
}

// function validate(groupId: string) {
//   return new Promise(async resolve => {
//     const list = getFromValue(groupId);
//     if(!list || list.length === 0) {
//       resolve(false);
//     }
//     const flag = await structure.getCompRef(groupId).validate();
//     resolve(flag);
//   })
// }

function getFormConfig(groupId: string) {
  return pageInfo.value?.find(p => groupId.includes(p.cProdNo));
}

function setDisabledAll(isDisabled: boolean, groupId: string) {
  structure.getCompRef(groupId).setDisabledAll(isDisabled);
}
defineExpose({
  getFromValue,
  setFormValue,
  getFormConfig,
  setDisabledAll,
  getPlanNo
});
</script>

<style scoped></style>
