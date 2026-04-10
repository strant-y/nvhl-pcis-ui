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
            const pageK =
              k.pageKey === 'dist' || k.pageKey === 'distSummary'
                ? k.pageCode
                : k.pageKey;
            // opertaor.addTableRef(pageK, res);
            if(res && res.addProvide){
              // res.addProvide('domId',  k.id);
            }
          }"
          :is="k.pageType === 'custom' ? k.pageCode : k.pageKey + '-ref'"
          :pageSchema="k.pageSchema"
          :compKey="k.pageCode"
      />

    </div>
  </myCard>
</template>

<script setup lang="ts">
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { useRoute } from "vue-router";
import { DialogMethod } from "@/common/dzmodel/ComDialogConf";
import {  creatCardConfig } from "@/shared/mytemplate/card-config";
import { useDzModal } from "@/common/dzmodel/DzModalService";
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
  }
});
const groupId = {value: undefined} // 当前groupId 不能用ref
const pageView = inject("pageView", ref(new CompositePageView()));
const cardconfig = ref(creatCardConfig({
  title: '免赔说明'
}));
const structure = new CustomStructure()
const pageInfo = computed(() => structure.groupBuild(props.compKey, props.pageSchemaList))

onMounted(() => {
  console.log('pageInfo', pageInfo)
})

const setGroupId = (id: string) => {
  groupId.value = id
}
defineExpose({
  setGroupId
});
</script>

<style scoped></style>
