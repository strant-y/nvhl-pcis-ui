<template>
  <div class="app-container">
    <el-dialog v-model="dialogVisible" width="90%" :title="props.title">
      <div>
        <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
        <app-table :tableConfig="tableconfig" v-model:pageresult="pageresult" ref="tableRef"
          @page-change="handleQuery(false)" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { useValidator } from "@/typings/useValidator";
import { createFreeButtonBase } from "@/shared/button-config";
import { ref, defineProps, defineEmits, onMounted, computed } from "vue";
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
import { SysOrgEmpMgrService } from '@/views/sys-right-basic/service/sys-org-emp-mgr.service';

const props = defineProps({
  data: Object,
  type: String,
  title: String,
  cDptCde: String, //机构代码
  cEmpCde: String, //员工代码
});
const { getRules } = useValidator();
const emits = defineEmits(["ok", "cancel"]);
const dialogVisible = ref(true);
const sysOrgEmpMgrService = new SysOrgEmpMgrService();

const freeEditRef = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<MyTableMethod | null>(null);

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "",
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "查询",
        func: async () => {
          handleQuery();
        },
      }),
      createFreeButtonBase({
        label: "重置",
        func: () => {
          freeEditRef.value?.resetFields()
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cDptCde",
        inputtype: "rtinput",
        title: "机构代码",
        disabled: true,
        rules: [getRules("required", {})]
      },
      {
        prop: "cLoadSub",
        inputtype: "rtcheckbox",
        title: "是否包含下级",
        defaultValue: 0,
        keymap: {
          y: 1,
          n: 0,
        },
      },
      {
        prop: "cEmpCde",
        inputtype: "rtinput",
        title: "员工代码"
      },
      {
        prop: "cEmpCnm",
        inputtype: "rtinput",
        title: "员工名称"
      },
      {
        prop: "cIsValid",
        inputtype: "rtselect",
        title: "是否在职",
        loadData: [{ value: '0', label: '否' }, { value: '1', label: '是' }],
      }
    ],
  })
);

const pageresult = reactive<Pageresult>({
  result: "",
  /** 数据列表 */
  list: [],
  /** 总数 */
  total: 0,
});
const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    editFlag: true,
    editList: ["cIsValid"],
    //showSelection:true,
    titleBtns: [
      createFreeButtonBase({
        id: "score",
        label: "新增",
        type: "success",
        func: function () {

        },
      }),
    ],
    fromSchema: [
      {
        prop: "cEmpCde",
        inputtype: "rtinput",
        title: "员工代码"
      },
      {
        prop: "cEmpCnm",
        inputtype: "rtinput",
        title: "员工名称",
      },
      {
        prop: "cDptDispCde",
        inputtype: "rtinput",
        title: "机构显示代码",
      },
      {
        prop: "cDptCnm",
        inputtype: "rtinput",
        title: "机构名称",
      },
      {
        prop: "cSex",
        inputtype: "rtinput",
        title: "性别",
        formatter: (val: string) => {
          const cSex = [{ value: '1', label: '男' }, { value: '2', label: '女' }]
          const result = cSex.find(item => item.value === val);
          return result ? result.label : val;
        }
      },
      {
        prop: "tEntTm",
        inputtype: "rtinput",
        title: "入司时间",
      },
    ],
  })
);

onMounted(async () => {
  if (props.type === "update" || props.type === "view") {
    // 获取IE员工详情
    const paramss = {
      CEmpCde: props.cEmpCde
    };
    const getEmpDatas = sysOrgEmpMgrService.loadOrgEmpInfo(paramss);
    getEmpDatas.then((res: any) => {
      if (null != res && null != res['code']) {
        if (res['code'] === 200) {
          const usermsg = res['data'];
          nextTick(() => {
            freeEditRef.value?.setFormValue(usermsg);
          })
        }
      }
    });
  }
});

/** 保存 */
function save() {
  freeEditRef.value?.validate().then((isValid: any) => {
    if (isValid) {
      //const formParam = getFrom();
      let s = freeEditRef.value?.getFromValue();
      const param = Object.assign({ type: props.type, cIsValid: '1', isie: "1" }, s);
      sysOrgEmpMgrService.saveOrgEmpInfo(param)
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
        .finally(() => { });
    } else {
      ElMessage.error("请填写必填项");
    }
  });
}

/** 查询 */
function handleQuery(flag?: boolean) {
  freeEditRef.value?.validate().then((isValid: any) => {
    if (!isValid) {
      return false;
    } else {
      const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
      const s = freeEditRef.value?.getFromValue(); //获取表单数据
			const param = Object.assign(s, r);
			param.isie = "1"
      sysOrgEmpMgrService.qryOrgEmpList(param)
      .then((res) => {
        const { code, data, msg } = res;
        if (200 === code) {
          pageresult.list = [];
          pageresult.list = data.result;
          pageresult.total = data.total;
        } else {
          ElMessage.error(msg);
        }
      })
      .finally(() => { });
    }
  });

}

</script>

<style scoped></style>
