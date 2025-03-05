<!-- 自定义录单 -->
<template>
  <div class="searchbar el-card app-container">
    <!-- <div class="el-card__header">
      <span class="el-card__header__title">{{ title }}</span>
    </div> -->
    <div v-if="step == '0'">
      <el-form
        ref="freeEditRef"
        :model="formconfig1"
        label-width="180px"
        :inline="true"
      >
        <h4 style="margin: 10px 20px">投保向导</h4>
        <el-form-item
          label="归属机构"
          prop="companyId"
          style="width: 800px"
          :rules="[getRules('required', {})]"
        >
          <dept v-model="formconfig1.companyId" />
        </el-form-item>

        <h4 style="margin: 10px 20px">投保信息</h4>
        <el-form-item
          label="投保标识"
          prop="b"
          :rules="[getRules('required', {})]"
        >
          <el-radio-group v-model="formconfig1.b">
            <el-radio value="0">新保</el-radio>
            <el-radio value="1">续保</el-radio>
          </el-radio-group>
          <!-- <el-input v-if="formconfig1.b=='1'" 
            style="width: 300px;margin-left: 20px;" 
            placeholder="请输入续保保单号" 
            v-model="formconfig1.d">
          </el-input> -->
        </el-form-item>
        <el-form-item
          v-if="formconfig1.b == '1'"
          label=""
          prop="d"
          :rules="[getRules('required', {})]"
        >
          <el-input
            style="width: 300px"
            placeholder="请输入续保保单号"
            v-model="formconfig1.d"
          >
          </el-input>
        </el-form-item>

        <h4 style="margin: 10px 20px">选择条款</h4>
        <el-form-item
          label="团个属性"
          prop="c"
          :rules="[getRules('required', {})]"
        >
          <el-radio-group v-model="formconfig1.c">
            <el-radio value="0">个单</el-radio>
            <el-radio value="1">团单</el-radio>
          </el-radio-group>
        </el-form-item>

        <h4 style="margin: 10px 20px">常用条款</h4>
        <el-row>
          <el-col :span="24">
            <div>
              <VueDraggable
                class="eachCon"
                v-model="list"
                :animation="150"
                @update="updateOptionAll"
              >
                <el-card
                  v-for="(item, index) in list"
                  :key="index"
                  :class="item.checked ? 'checked eachItems' : 'eachItems'"
                  shadow="hover"
                  @click="handleClick(item, index)"
                >
                  <p class="titles">
                    <el-icon size="20" style="vertical-align: middle"
                      ><Fold
                    /></el-icon>
                    <span :title="item.title" class="text-ellipsis">
                      {{ item.title }}
                    </span>
                    <el-icon :size="25" style="color: rgb(250, 219, 20)"
                      ><StarFilled
                    /></el-icon>
                  </p>
                  <p class="txt">{{ item.code }} - {{ item.value }}</p>
                </el-card>
              </VueDraggable>
            </div>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="条款名称"
              prop="e"
              :rules="[getRules('required', {})]"
            >
              <el-select
                style="width: 600px"
                v-model="formconfig1.e"
                placeholder="请选择"
                @change="handleChange"
                @clear="handleClear"
                clearable
              >
                <el-option
                  v-for="item in options"
                  :label="item.value"
                  :value="item.code"
                />
              </el-select>
              <el-button
                @click="showModal"
                icon="Search"
                type="primary"
              ></el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <div v-if="step == '1'">内容</div>
    <div style="margin-top: 20px" :style="{ textAlign: 'right' }">
      <rt-button
        :item="{
          type: 'primary',
          label: '取消',
          func: () => {
            dialogVisible = false;
          },
        }"
      />

      <rt-button
        :item="{
          type: 'primary',
          label: step == '0' ? '下一步' : '上一步',
          func: () => {
            if (step == '0') {
              next();
            } else {
              step = '0';
            }
          },
        }"
      />

      <rt-button
        v-if="step == '1'"
        :item="{
          type: 'primary',
          label: '确定',
          func: () => {},
        }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { VueDraggable } from "vue-draggable-plus";
import request from "@/utils/request";
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();

import { ref } from "vue";
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";

const freeEditRef = ref<AppFreeEditMethod | null>(null);
import { createFreeButtonBase } from "@/shared/button-config";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { b, i } from "vite/dist/node/types.d-jgA8ss1A";
import { getListByCode } from "@/api/code-list-service";
import { CustomRecordingService } from "./custom-recording.service";
const customRecordingService = new CustomRecordingService();
const dialogVisible = ref(true);
const step = ref("");
const dzmodal = useDzModal();
const tableRef = ref<AppTableMethod | null>(null);
const title = ref("自定义录单");
// 条款名称列表
const options = ref<any>([]);
// 常用条款列表
const list = ref<any>([]);
// 条款树
const nodes = ref<Array<any>>([]);
const defaultProps = {
  children: "children",
  label: "label",
  isLeaf: "leaf",
};
const datas = ref<string>("");
const departmentTree = defineAsyncComponent(
  () => import("@/components/common/DepartmentTree.vue")
);
const kindEdit = defineAsyncComponent(() => import("./kindEdit.vue"));
const formconfig1 = ref({
  companyId: "",
  b: "0",
  c: "0",
  d: "",
  e: "",
});

// 条款下拉数据
function loadOptions() {
  customRecordingService.getProdEnableList({}).then((res: any) => {
    if (res.code === 200) {
      options.value = res.data;
    } else {
      ElMessage.error(res.msg);
    }
  });
}

onMounted(async () => {
  loadOptions();
  list.value = [
    {
      title: "1111111111111111111111111111111111111",
      value: "货物运输险",
      code: "02",
    },
    { title: "22222222222222222222222222222", value: "保证保险", code: "05" },
    {
      title: "333333333333333333333333333333333",
      value: "保证保险",
      code: "05",
    },
    {
      title: "444444444444444444444444444444444444",
      value: "保证保险",
      code: "05",
    },
    {
      title: "55555555555555555555555555555555555555555",
      value: "保证保险",
      code: "05",
    },
  ];
  nextTick(() => {
    step.value = "0";
  });
});

// 绑定方法
const method = {
  func1: () => {
    console.log(getRules);
  },
};

// 懒加载函数
const getChildren = (node, resolve) => {
  if (node.level === 0) return resolve([]);
  // sysOperatorMgrService.getOrgDptTreeListByPid({
  //   cDptCde: node.data['id']
  // })
  // .then(result => {
  //     const dto = [];
  //     if (200 !== result['code']) {
  //       ElMessage.error(result['msg']);
  //     } else {
  //       ElMessage.success(result['msg']);
  //     }
  //     if (Array.isArray(result['data']) && result['data'].length > 0) {
  //         for (const row of result['data']) {
  //             dto.push({
  //                 id: row['id'],
  //                 name: row['id'] + '-' + row['name'],
  //                 parentId: row['parentId'],
  //                 hasChildren: true
  //             });
  //         }
  //     }
  //     resolve(dto);
  // }, error => {
  //     console.log('出错了', error);
  //     ElMessage.error('后台服务异常,请联系管理员');
  // });
};

// 下一步
function next() {
  console.log(formconfig1.value);
  freeEditRef.value?.validate().then((isValid: boolean) => {
    if (!isValid) {
      return false;
    }
    step.value = step.value == "0" ? "1" : "0";
    title.value = step.value == "0" ? "自定义录单" : "选择条款";
  });
}

// 上一步
function prev() {
  step.value = "0";
}

// 常用条款选中/反选
function handleClick(item: any, index: number) {
  // 每次只能选择一个数据,如果是选中状态,则取消选中
  if (item.checked) {
    list.value.map((item: any, index: any) => {
      if (index != index) {
        item.checked = false;
      }
    });
  } else {
    list.value.forEach((item: any, index: any) => (item.checked = false));
  }
  item.checked = !item.checked;
  formconfig1.value.e = item.checked ? item.code : "";
}

// 条款列表选中
function handleChange() {
  // 如果下拉数据不存在list中，则清除list所有选中数据
  if (!list.value.some((item: any) => item.code == formconfig1.value.e)) {
    list.value.forEach((item: any, index: any) => (item.checked = false));
  }
  // 如果下拉数据存在list中，则选中list中对应数据
  if (list.value.some((item: any) => item.code == formconfig1.value.e)) {
    list.value.forEach((item: any, index: any) => {
      if (item.code == formconfig1.value.e) {
        item.checked = true;
      } else {
        item.checked = false;
      }
    });
  }
}

// 条款列表清除
function handleClear() {
  list.value.forEach((item: any, index: any) => (item.checked = false));
  formconfig1.value.e = "";
}

// 条款列表拖拽后操作
function updateOptionAll(e: any) {
  console.log(list.value);
}

// 选择条款弹框
function showModal() {
  dzmodal.open(kindEdit, { type: "Issuer", data: {} }).then((res: any) => {
    if (res.type === "ok") {
      console.log("获取弹框的数据，或者更新接口", res.body);
    }
  });
}
</script>

<style scoped>
.container {
  padding: 20px;
}
.searchbar.el-card .el-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* padding: 10px 20px; */
  background-color: var(--el-card-header-bg-color);
  border-bottom: 1px solid #ebeef5;
}
.searchbar.el-card .el-card__header__title {
  font-size: 16px;
}

.custom-modal {
  width: 1000px;
}

.eachCon {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: start;
  padding-left: 100px;
  margin-bottom: 10px;
}
.eachItems {
  width: 30%;
  margin: 0 10px 10px;
  border: 2px solid #dcdfe6;
  cursor: pointer;
}
.checked {
  border: 2px solid rgb(143, 46, 57);
  background: rgb(255, 232, 230);
}
.el-card.eachItems >>> .el-card__body,
.el-card.eachItems_checked >>> .el-card__body {
  padding: 10px;
}
.eachCon .eachItems .titles {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.eachCon .eachItems .titles span {
  width: 85%;
  padding-left: 10px;
}
.eachCon .eachItems .txt {
  color: #838a90;
}
</style>
