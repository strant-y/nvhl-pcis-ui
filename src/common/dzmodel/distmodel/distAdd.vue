<template>
  <div>
    <app-free-edit v-model:freeEditConfig="formconfig1" ref="freeEditRef" />
  </div>
</template>

<script setup lang="ts">
import { v4 as uuidv4 } from "uuid";
import {
  AppTableConfig,
  createTableEditConfig,
  MyTableMethod,
} from "@/shared/app-table-config";
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
  createFromUiConfig,
} from "@/shared/app-free-edit-config";
import { useRoute } from "vue-router";
const route = useRoute();
import { createFreeButtonBase } from "@/shared/button-config";
import { useValidator } from "@/typings/useValidator";
import { saveDist } from "@/api/prod";
import { dataOpertaor } from "@/store/modules/data-opertaor";
const opertaor = dataOpertaor();
const param = ref({});
const freeEditRef = ref<AppFreeEditMethod | null>(null);
const { getRules } = useValidator();
const tableRef = ref<MyTableMethod | null>(null);
const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
  method: {
    type: Object,
    default: () => ({}),
  },
});
const dataParams = ref({});
const appNo = ref("");
function getuuid() {
  return uuidv4().replace(/-/g, "");
}
const emits = defineEmits(["handleClose"]);

const formconfig1 = ref<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "新增信息",
    fromSchema: [],
    fromUi: createFromUiConfig({
      cols: 2,
    }),
    titleBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "确定",
        func: () => {
          freeEditRef.value?.validate().then(() => {
            const s = freeEditRef.value?.getFromValue();
            const processedData = Object.keys(s).reduce(
              (acc, key) => {
                const newKey = key.replace(/^Dist\./, "");
                acc[newKey] = s[key];
                return acc;
              },
              {} as Record<string, any>
            );
            const params = Object.assign(
              {
                cProdNo: route.params.cProdNo,
                // cComponentCode: "AddressDist040001",
                cComponentTable: "AddressDist",
                cAppNo: appNo.value,
              },
              { dist: processedData }
            );
            saveDist(params).then((res) => {
              if (res.code === 200) {
                ElMessage.success(res.msg);
                emits("handleClose");
              } else {
                ElMessage.error(res.msg);
              }
            });
            // props.method.addRow(freeEditRef.value?.getFromValue());
            emits("handleClose");
          });
        },
      }),
      createFreeButtonBase({
        label: "取消",
        func: () => {
          emits("handleClose");
        },
      }),
    ],
  })
);

onMounted(() => {
  dataParams.value = opertaor.getDataAll();
  appNo.value = dataParams.value.plyBase["Base.cAppNo"];
  formconfig1.value.fromSchema = props.data.fromSchema;
  formconfig1.value.title = props.data.title;
});
</script>

<style scoped></style>
