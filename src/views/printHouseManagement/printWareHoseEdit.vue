<template>
    <el-dialog v-model="dialogVisible" width="90%">
      <div>
        <app-free-edit
          v-model:freeEditConfig="formconfig1"
          ref="freeEditRef"
          @update-datas="fromUpdata"
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
  import { useDzModal } from "@/views/dzmodel/DzModalService";
  import { ref, defineProps } from "vue";
  import { createFreeButtonBase } from "@/shared/button-config";
  import {
    getButtonByFacKey,
    getFactorList,
    getInputGroupList,
    saveFactor,
    saveRiskInfo,
  } from "@/api/prod";
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
    data: Object,
    type: String,
  });
  const { getRules } = useValidator();
  const emits = defineEmits(["ok", "cancel"]);
  import { v4 as uuidv4 } from "uuid";
  import { max } from "lodash";
  
  const jsonArrayEdit = defineAsyncComponent(
    () => import("@/views/dzmodel/jsonArrayEdit.vue")
  );
  
  const showBtnConfig = ref(false);
  const dialogVisible = ref(true);
  const showView = ref(false);
  const dzmodal = useDzModal();
  
  const freeEditRef = ref<AppFreeEditMethod | null>(null);
  const freeLookRef = ref<AppFreeEditMethod | null>(null);
  const freeEditRefBtn = ref<AppFreeEditMethod | null>(null);
  const tableRef = ref<MyTableMethod | null>(null);
  const appTableShow = ref(false);
  
  function fromUpdata(newData: any) {
    const jsonObj = getFrom();
    if (jsonObj) {
      jsonObj.func = null;
      if (jsonObj.loadData) {
        jsonObj.loadData = JSON.parse(jsonObj.loadData);
      }
      if (jsonObj.showExBtn === "1") {
        jsonObj.showExBtn = true;
        jsonObj.btnItems = createFreeButtonBase(jsonObj.btn);
        jsonObj.btnWidth = jsonObj.btn?.btnWidth;
      } else {
        jsonObj.showExBtn = false;
      }
      if (jsonObj.required === "1") {
        jsonObj.rules = [getRules("required", {})];
      }
      if (
        jsonObj.inputtype === "rtinputgroup" ||
        jsonObj.inputtype === "rttable"
      ) {
        return;
      }
      jsonObj.func = null; // 方法去掉,不让预览触发事件
    }
  }
  const schemaMap = reactive<Record<string, any>>({
    rtinputgroup: [],
  });
  
  const formconfig1 = reactive<AppFreeEditConfig>(
    createAppFreeEditConfig({
      title: "责任配置",
      fromSchema: [
        {
          prop: "cKindNo",
          inputtype: "rtselect",
          title: "单证类型",
        },
        {
          prop: "cRiskNo",
          inputtype: "rtinput",
          title: "子订单号",
        },
        {
          prop: "cRiskNo",
          inputtype: "rtinput",
          title: "可入库份数",
        },
        {
          prop: "cRiskNo",
          inputtype: "rtinput",
          title: "起始印刷号",
        },
        {
          prop: "cRiskNo",
          inputtype: "rtinput",
          title: "终止印刷号",
        },
        {
          prop: "cRiskNo",
          inputtype: "rtinput",
          title: "份数",
        },
        {
          prop: "cRiskNo",
          inputtype: "rtinput",
          title: "申请备注",
        },
      ],
    })
  );
  onMounted(async () => {
    if (props.type === "edit") {
      const dataObj = props.data;
      setTimeout(() => {
        freeEditRef.value?.setFormValue(dataObj);
      }, 50);
      formconfig1.fromSchema?.forEach((e) => {
        if (e.prop === "cRiskNo") {
          e.disabled = true;
        }
      });
    }
  });
  
  // 绑定方法
  const method = {
    func1: () => {
      console.log(getRules);
    },
  };
  // 绑定特殊验证器
  const exRules = {
    byrtInput: (rule: any, value: any, callback: any) => {
      const r = freeEditRef.value?.getFromValue();
      if (r["name"]) {
        callback();
      } else {
        callback("姓名");
      }
    },
  };
  
  /** 保存 */
  function save() {
    freeEditRef.value?.validate().then((isValid) => {
      if (isValid) {
        const formParam = getFrom();
        const param = Object.assign({ type: props.type }, formParam);
        saveRiskInfo(param)
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
    // inputgroup 莫名其妙初始化值被改了
    if (showBtnConfig.value) {
      s["showExBtn"] = "1";
    } else {
      s["showExBtn"] = "0";
    }
    if (s) {
      const param = Object.assign(s);
      if (props.type === "edit") {
        //编辑状态下,将主键原封不动的送回后端,用于更新
        param["cPkId"] = props.data.cPkId;
      }
      if (freeEditRefBtn.value) {
        let btnjson = freeEditRefBtn.value?.getFromValue();
        btnjson.initid = uuidv4().replace(/-/g, "");
        param["btn"] = btnjson;
      }
      if (tableRef.value) {
        const tabjson = tableRef.value?.getFromValue();
        let selectList = tabjson.filter((item: any) => item.isChecked === "1");
        param["tabjson"] = selectList;
      }
      return param;
    }
  }
  </script>
  
  <style scoped></style>
  