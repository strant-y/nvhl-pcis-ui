<template>
  <el-dialog v-model="dialogVisible" title="子集编辑" width="50%">
    <div>
      <div style="text-align: center">
        <el-transfer
          v-model="leftValue"
          style="text-align: left; display: inline-block"
          filterable
          :right-default-checked="factorSubList"
          :render-content="renderFunc"
          :titles="['要素列表', '已添加要素']"
          :button-texts="['移除', '添加']"
          :format="{
            noChecked: '${total}',
            hasChecked: '${checked}/${total}',
          }"
          :data="factorList"
          @change="handleChange"
        >
          <!-- <template #left-footer>
                        <el-button class="transfer-footer" size="small">Operation</el-button>
                    </template>
                    <template #right-footer>
                        <el-button class="transfer-footer" size="small">Operation</el-button>
                    </template> -->
        </el-transfer>
      </div>
      <div
        style="
          width: 98.5%;
          height: 40px;
          display: flex;
          justify-content: end;
          margin-top: 20px;
        "
      >
        <el-button type="primary">确认</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { VNode, VNodeProps } from "vue";
import { getFactorList } from "@/api/prod";

interface Option {
  key: number;
  label: string;
  disabled: boolean;
}

const factorList = ref();
const factorSubList = ref();

onBeforeMount(() => {
  getFactorList({ pageNum: 1, pageSize: 1000 })
    .then((res) => {
      const { code, data, msg } = res;
      if (200 === code) {
        if (data.data) {
          factorList.value = data.data.map((item: any) => {
            return {
              key: item.cPkId,
              cPkId: item.cPkId,
              label: item.cFactorTitle + "(" + item.cFactorProp + ")",
              disabled: false,
            };
          });
        }
      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => {});
});

const dialogVisible = ref(true);
const leftValue = ref([1]);

const renderFunc = (
  h: (type: string, props: VNodeProps | null, children?: string) => VNode,
  option: Option
) => {
  return h("span", null, option.label);
};
const handleChange = (
  value: number[] | string[],
  direction: "left" | "right",
  movedKeys: string[] | number[]
) => {
  console.log(value, direction, movedKeys);
};
</script>

<style>
.transfer-footer {
  margin-left: 15px;
  padding: 6px 5px;
}
</style>
