<template>
  <el-dialog v-model="dialogVisible" width="90%" :title="title" class="system-dialog-scroll">
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
import { inputtype } from "@/utils/utilKey";
import { ref, defineProps, defineEmits, onMounted } from "vue";
import { SysRolechatsMgrService } from '../service/sys-rolechats-mgr.service';

import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
const sysRolechatsMgrService = new SysRolechatsMgrService();
import { useUserStore } from "@/store/modules/user";
const props = defineProps({
  data: Object,
  type: String,
});
const { getRules } = useValidator();
const emits = defineEmits(["ok", "cancel"]);
const userStore = useUserStore();
const dialogVisible = ref(true);
const title = ref('');
const cChartsCde = ref('');
const freeEditRef = ref<AppFreeEditMethod | null>(null);
const user = reactive(userStore.user);

const schemaMap = reactive<Record<string, any>>({
  rtinputgroup: [],
});

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: '',
    fromSchema: [
      {
        prop: "cOpgrpCde",
        inputtype: "rtselect",
        typeCode: "ROLE_LIST",
        title: "角色代码",
        rules: [getRules("required", {
          trigger: 'change'
        })]
      },
      {
        prop: "cCharts",
        inputtype: "rtselect",
        title: "图表代码",
        rules: [getRules("required", {
          trigger: 'change'
        })],
        typeCode: "CHATS_LIST",
        func: (val)=>{
          if(val) {
            const arr = val.split('-');
            freeEditRef.value?.setValue('cType', arr[0])  
            freeEditRef.value?.setValue('cName', arr[1])  
            freeEditRef.value?.setValue('cCode', arr[2])  
            //freeEditRef.value?.setValue('cChartsCde', arr[3])   
            cChartsCde.value = arr[3]
          }
        }
      },
      {
        prop: "cType",
        inputtype: "rtinput",
        title: "图表类型",
        disabled: true
      },
      {
        prop: 'cName',
        title: '图表名称',
        inputtype: "rtinput",
        disabled: true
      },
      {
        prop: 'cCode',
        title: '参数代码',
        inputtype: "rtinput",
        disabled: true
      },
      // {
      //   prop: 'cChartsCde',
      //   inputtype: "rtinput",
      //   type: hidden
      // }
    ]
  })
);

onMounted(async () => {
  if (props.type === "update" && props.data) {
    title.value = '角色图表配置修改'
    nextTick(() => {
      freeEditRef.value?.setFormValue(props.data);
      const cChartsValue = `${props.data.cType}-${props.data.cName}-${props.data.cCode}-${props.data.cChartsCde}`
      freeEditRef.value?.setValue('cCharts', cChartsValue)  
    }, 50);
  }else if (props.type === "add") {
    title.value = '新增'
  }
});

// 绑定方法
const method = {
  func1: () => {
    console.log(getRules);
  },
};
/** 保存 */
function save() {
  freeEditRef.value?.validate().then((isValid) => {
    if (isValid) {
      const formParam = getFrom();
      const param = Object.assign(formParam,
      {
        cChartsCde: cChartsCde.value,
        type: props.type
      },
        {
          cCrtCde: user.opCde,
          cUpdCde: user.opCde          
        }
      );
      sysRolechatsMgrService.saveRoleChatsInfo(param)
        .then((res) => {
          const { code, data, msg } = res;
          if (200 === code) {
            emits("ok", {});
            ElMessage.success("保存成功");
            dialogVisible.value = false;
          } else {
            ElMessage.error(msg);
          }
        })
        .finally(() => {});
    } else {
      ElMessage.error("请填写必填项");
    }
  });
}

/* 获取全量表单数据 */
function getFrom() {
  let s = freeEditRef.value?.getFromValue(); //获取表单数据
  if (s) {
    const param = Object.assign(s);
    if (props.type === "update") {
      param["cPkId"] = props.data.cPkId;
    } else {
      param["cPkId"] = '';
    }
    return param;
  }
}
</script>

<style scoped>
.system-dialog-scroll :deep(.el-dialog__body) {
  max-height: 400px;
  overflow: auto;
}
</style>
