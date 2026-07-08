<template>
  <el-dialog :title="props.type == 'add' ? '新增权限菜单信息' : '修改权限菜单信息'" v-model="dialogVisible" width="90%" class="system-dialog-scroll">
    <div>
      <app-free-edit v-model:freeEditConfig="formconfig1" ref="freeEditRef" />
      <div style="margin-top: 20px" :style="{ textAlign: 'right' }">
        <rt-button :item="{
          type: 'primary',
          label: '保存',
          func: () => {
            save();
          },
        }" />
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { SysOpMgrService } from '@/views/sys-right-basic/service/sys-op-mgr.service'
import { useValidator } from "@/typings/useValidator";
import { yesOrNo, size, inputtype, typeMap, dateType } from "@/utils/utilKey";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { ref, defineProps, defineEmits, onMounted } from "vue";
import { createFreeButtonBase } from "@/shared/button-config";

import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";

import { useUserStore } from "@/store/modules/user";
const userStore = useUserStore();
const user = ref<any>(userStore.user);
const { getRules } = useValidator();
const emits = defineEmits(["ok", "cancel"]);
const sysOpMgrService = new SysOpMgrService()
const dialogVisible = ref(true);
const freeEditRef = ref<AppFreeEditMethod | null>(null);
const props = defineProps({
  COpCde: {
    type: String,
    required: true
  },
  COperateTyp: {
    type: String,
    required: true
  }
});
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    // fromUi: {
    //   cols: 2
    // },
    fromSchema: [
      {
        prop: "cOpCde",
        inputtype: "rtinput",
        title: "菜单代码",
        rules: [getRules("required", {}), getRules("signlessInt", {})]
      },
      {
        prop: "cParentCde",
        inputtype: "rtselect",
        typeCode: "SYS_OP_LIST_CACHE",
        title: "父级权限菜单",
        disabled: true,
      },
      {
        prop: "cOpCnm",
        inputtype: "rtinput",
        title: "菜单名称",
        rules: [getRules("required", {})]
      },
      {
        prop: "nOpOrder",
        inputtype: "rtinput",
        title: "菜单排列顺序",
        rules: [getRules("required", {}), getRules("signlessInt", {})]
      },
      {
        prop: "cOpImg",
        inputtype: "rtinput",
        title: "菜单图标"
      },
      {
        prop: "cOpType",
        inputtype: "rtselect",
        typeCode: "WEB_SYS_STA_DICT",
        params: { 'cParCde': 'op_typ' },
        title: "菜单类型",
        defaultValue: '0',
        func: (val) => {
          COpTypeChange(val)
        },
      },
      {
        prop: "cOpAct",
        inputtype: "rtinput",
        title: "菜单路由"
      }
      // {
      //   inputtype: "rtinput",
      //   type: 'hidden',
      //   defaultValue: 'PCIS'
      // },
    ]
  })
);

const COpTypeChange = (val) => {
  freeEditRef.value?.setValue('CTarget', '');
  freeEditRef.value?.setValue('COpAct', '');
  freeEditRef.value?.setValue('COpMemo', '');
  // 移除最后一个表单项
  formconfig1.fromSchema.pop();

  // 根据 val 添加新的表单项
  if (val === '0') {
    formconfig1.fromSchema.push({
      prop: "COpAct",
      inputtype: "rtinput",
      title: "菜单路由"
    });
  } else if (val === '1') {
    formconfig1.fromSchema.push({
      prop: "CTarget",
      inputtype: "rtinput",
      title: "菜单目标窗口"
    });
  } else if (val === '2') {
    formconfig1.fromSchema.push({
      prop: "COpMemo",
      inputtype: "rtinput",
      title: "菜单按钮权限"
    });
  }
}

const initParam = (data: any) => {
  if (data) {
    for (const k in data) {
      if (k) {
        // 将属性名 k 的首字母转换为大写，其余部分保持不变，形成新的属性名，并取原来的值
        data[`${k.charAt(0).toUpperCase()}${k.substring(1)}`] = data[k];
        //移除原来的
        data[k] = undefined;
      }
    }
    freeEditRef.value?.setFormValue(data);
  }
}
onMounted(() => {
  if (props.COperateTyp === "update" && props.COpCde) { //编辑
    nextTick(() => {
      let item = freeEditRef.value.getFromSchemaItem('COpCde')
      item.disabled = true
      const param = {
        COpCde: props.COpCde
      };
      sysOpMgrService.loadSysOpInfo(param).then((res: any) => {
        if (null != res && null != res['code']) {
          if (res['code'] === 200) {
            const data = res.data?.data ? res.data?.data[0] : [];
            initParam(data);
          } else {
            ElMessage.error(res['message']);
          }
        }
      });
    })
  } else { //新增
    nextTick(() => {
      freeEditRef.value?.setValue('cOpType', '0')
    })
    nextTick(() => {
      freeEditRef.value?.setValue('CParentCde', props.COpCde)
    })
  }
});

/** 保存 */
function save() {
  freeEditRef.value?.validate().then((isValid) => {
    if (isValid) {
      let s = freeEditRef.value?.getFromValue(); //获取表单数据
      const param = Object.assign({}, s, {
        CCrtCde: user.opCde,
        CUpdCde: user.opCde,
        COperateTyp: props.COperateTyp
      })
      if(param.Children) {
        delete param.Children
      }
      sysOpMgrService.saveSysOpInfo(param).then((res) => {
        const { code, data, msg } = res;
        if (200 === code) {
          emits("ok", {});
          ElMessage.success(data.message);
          dialogVisible.value = false;
        } else {
          ElMessage.error(msg);
        }
      })
        .finally(() => { });
    } else {
      ElMessage.error("请填写必填项");
    }
  });
}

</script>

<style scoped>
.system-dialog-scroll :deep(.el-dialog__body) {
  max-height: 400px;
  overflow: auto;
}
</style>
