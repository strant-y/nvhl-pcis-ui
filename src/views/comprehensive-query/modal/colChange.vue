<template>
  <el-dialog v-model="dialogVisible" width="90%" title="变更列">
    <div>
      <app-free-edit
        v-model:freeEditConfig="formconfig1"
        ref="freeEditRef"
      />
      <div style="margin-top: 20px" :style="{ textAlign: 'right' }">
        <rt-button
          :item="{
            type: 'primary',
            label: '保存',
            func: () => {
              save();
            },
          }"
        />
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { useValidator } from "@/typings/useValidator";
import { yesOrNo, size, inputtype, typeMap, dateType } from "@/utils/utilKey";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { ref, defineProps, defineEmits, onMounted } from "vue";
import { createFreeButtonBase } from "@/shared/button-config";
import { CustomUserList } from "@/api/query";
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import {
  AppTableConfig,
  createTableEditConfig,
  MyTableMethod,
} from "@/shared/app-table-config";

const props = defineProps({
  data: Array,  // 接收数组
  type: String,
  userSaved: {
    type: Boolean,
    default: false,
  }
});
const { getRules } = useValidator();
const emits = defineEmits(["ok", "cancel"]);

const dialogVisible = ref(true);
const dzmodal = useDzModal();

const freeEditRef = ref<AppFreeEditMethod | null>(null);

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    fromSchema: props.data || [],
    showSuperior: true,
    superFromSchema: [],
  })
);
onMounted(async () => {
  if (props.type === "edit" && props.data) {
      setTimeout(() => {
          const values = props.data[0].loadData
                .filter((item: any) => item.checked)
                .map((item: any) => item.value);

            freeEditRef.value?.setFormValue({ bsType: values });
      }, 50);
  }
});

/** 保存 */
function save() {
  const formData = freeEditRef.value?.getFromValue();
  freeEditRef.value?.validate().then((isValid) => {
    if (isValid) {
        const formData = freeEditRef.value?.getFromValue();
        console.log('formData.bsType', formData.bsType);
        emits("ok", { 
            type: "ok", 
            body: formData.bsType 
        });
        dialogVisible.value = false;
    }
  });
}
</script>


     
        