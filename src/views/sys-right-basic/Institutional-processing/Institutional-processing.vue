<!-- 机构批处理 -->
<template>
  <div class="app-container">
    <el-card title="机构批处理" class="table-container">
      <template #header>
        <div class="card-header">
          <span>机构批处理</span>
        </div>
      </template>
      <el-form ref="freeEditRef1" :model="formconfig1" :inline="true">
      <el-row>
        <el-col :span="24">
          <el-form-item prop="companyId" label="归属机构">
            <el-input v-model="formconfig1.companyId" readonly >
              <template #append>
                <el-button @click="handleSearch" icon="Search" />
              </template>
            </el-input>
          </el-form-item>
          <el-form-item
            label="是否包含下级"
            prop="subordinate"
          >
            <el-radio-group
              v-model="formconfig1.subordinate"
            >
              <el-radio :value="'1'">是</el-radio>
              <el-radio :value="'0'">否</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item prop="companyId" label="已选机构">
            <el-tag style="cursor: pointer;margin: 0 10px 10px;"
              v-for="(item, index) in list" :key="index" 
              :closable="true" size="large" type="success"
              @click="handleClick(item, index)"
              @close="handleRemove(item, index)"
            >
              {{ item.name}}
            </el-tag>
          </el-form-item>
        </el-col>
      </el-row>
      </el-form>
    </el-card>

    <app-free-edit :freeEditConfig="formconfig2" ref="freeEditRef2" />
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from "@/store";
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();

import { ref } from "vue";
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";

// const freeEditRef1 = ref<AppFreeEditMethod | null>(null);
const freeEditRef2 = ref<AppFreeEditMethod | null>(null);
import { createFreeButtonBase } from "@/shared/button-config";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { useDzModal } from "@/common/dzmodel/DzModalService";
const userStore = useUserStore();
const user = ref(userStore.user) || ref({ companyId:'', opCde:'' })
const dzmodal = useDzModal();
const kindEdit = defineAsyncComponent(() => import("./kindEdit.vue"));
const tableRef = ref<AppTableMethod | null>(null);
const removeIds = ref([]); // 删除用户ID集合 用于批量删除
const formconfig1 = ref<any>({
  subordinate: "1",
  // companyId: user.companyId,
  companyId: '',
});
const freeEditRef1 = ref(ElForm); // 查询表单
// 已选机构
const list = ref<any>([]);

const formconfig2 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    title: "修改项",
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "保存更改",
        func: async () => {
          
        },
      }),
      createFreeButtonBase({
        label: "批量修改模板下载",
        func: () => {
          
        },
      }),
      createFreeButtonBase({
        label: "批量修改导入",
        func: () => {
          
        },
      }),
      createFreeButtonBase({
        label: "批量新增模板下载",
        func: () => {
          
        },
      }),
      createFreeButtonBase({
        label: "批量新增导入",
        func: () => {
          
        },
      }),
    ],
    fromSchema: [
      {
        prop: "cKindNo1",
        inputtype: "rtinput",
        title: "机构名称",
        clearable: true,
      },
      {
        prop: "cKindNo2",
        inputtype: "rtinput",
        title: "机构简称",
        clearable: true,
      },
      {
        prop: "cKindNo3",
        inputtype: "rtinput",
        title: "机构名称内部简称",
        clearable: true,
      },
      {
        prop: "cKindNo4",
        inputtype: "rtinput",
        title: "机构打印名称",
        clearable: true,
      },
      {
        prop: "cKindNo5",
        inputtype: "rtinput",
        title: "机构打印地址",
        clearable: true,
      },
      {
        prop: "cKindNo6",
        inputtype: "rtinput",
        title: "联系人电话",
        maxlength: 11,
        clearable: true,
      },
      {
        prop: "cKindNo7",
        inputtype: "rtinput",
        title: "报案咨询电话",
        maxlength: 11,
        clearable: true,
      },
      {
        prop: "cKindNo8",
        inputtype: "rtinput",
        title: "业务咨询电话",
        maxlength: 11,
        clearable: true,
      },
      {
        prop: "cKindNo9",
        inputtype: "rtinput",
        title: "报案地址",
        clearable: true,
      },
      {
        prop: "cKindNo10",
        inputtype: "rtinput",
        title: "邮编",
        clearable: true,
      },
      {
        prop: "cKindNo11",
        inputtype: "rtselect",
        title: "团队类型",
        loadData :[
          { label:'综合销售团队',value:'1' },
          { label:'中介机构及团客销售团队',value:'2' },
          { label:'车商销售团队',value:'3' },
          { label:'非车险销售团队',value:'4' },
          { label:'银保销售团队',value:'5' },
          { label:'个人代理销售团队',value:'6' },
          { label:'电销团队',value:'7' },
          { label:'续保团队',value:'8' },
          { label:'直属销售团队',value:'9' },
          { label:'网销销售团队',value:'10' },
          { label:'农险销售团队',value:'11' },
          { label:'分公司自主网约车团队',value:'12' },
        ]
      },
      {
        prop: "cKindNo12",
        inputtype: "rtselect",
        title: "承保出单机构标志",
        loadData :[
          { label:'是',value:1 },
          { label:'否',value:0 },
        ]
      },
      {
        prop: "cKindNo13",
        inputtype: "rtselect",
        title: "是否有效",
        loadData :[
          { label:'是',value:1 },
          { label:'否',value:0 },
        ]
      },
    ],
  })
);

onMounted(async () => {
  list.value = [
    { 
      name: "条款1", value: "1",
      cKindNo1:'机构名称1',cKindNo2:'机构名称2',cKindNo3:'机构名称3',
      cKindNo4:'机构打印名称',cKindNo5:'机构打印地址',cKindNo6:18612545445,
      cKindNo7:18612545445,cKindNo8:18612545445,cKindNo9:'报案地址',
      cKindNo10:'084111',cKindNo11:'7',cKindNo12:0,
      cKindNo13:1,
    },
    { 
      name: "条款221", value: "3",
      cKindNo1:'机构名称2',cKindNo2:'机构名称4',cKindNo3:'机构名称5',
      cKindNo4:'机构打印23423名称',cKindNo5:'机构打32423印地址',cKindNo6:18612578445,
      cKindNo7:18612125445,cKindNo8:13461545445,cKindNo9:'34243',
      cKindNo10:'084111',cKindNo11:'1',cKindNo12:1,
      cKindNo13:0,
    },
  ];
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
    // const r = freeEditRef.value?.getFromValue();
    // if (r["name"]) {
    //   callback();
    // } else {
    //   callback("姓名");
    // }
  },
};

// 目标机构 弹框
function handleSearch() {
  dzmodal
    .open(kindEdit, { type: "Issuer", data: {} })
    .then((res) => {
      if (res.type === "ok") {
        
      }
    });
}

// 选中
function handleClick(item: any) {
  freeEditRef2.value?.setFormValue({});
  nextTick(() => {
    freeEditRef2.value?.setFormValue(item);
  })
}

// 删除
function handleRemove(item: any, index: any) {
  list.value.splice(index, 1);
  console.log('handleRemove')
}

</script>

<style scoped></style>
