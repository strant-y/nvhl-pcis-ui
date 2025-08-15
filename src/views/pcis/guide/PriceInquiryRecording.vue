<!-- 询价录单 -->
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
          id="dptCde"
          v-if="isZGS"
          label="分公司"
          prop="dptCde"
          style="width: 400px"
          :rules="[getRules('required', {})]"
        >
            <el-select-v2
                v-model="formconfig1.dptCde"
                :options="dptCdeList"
                placeholder="分公司"
                size="large"
                filterable
                @change="getCDptCdeList"
            />
        </el-form-item>
        <el-form-item
          id="cDptCde"
          label="承保机构"
          prop="cDptCde"
          style="width: 650px"
          :rules="[getRules('required', {})]"
        >
            <el-select-v2
                v-model="formconfig1.cDptCde"
                :options="cDptCdeList"
                placeholder="承保机构"
                size="large"
                style="width: 500px"
                :loading="cDptCdeLoading"
                filterable
                clearable
                @change="selectedItem"
            />
        </el-form-item>

        <el-tooltip placement="top">
          <template #content>
            可用鼠标左键，按住常用条款卡片<br />自由拖动常用条款排序<br />
          </template>
          <h4
            style="margin: 10px 20px; width: 200px"
            v-if="formconfig1.cRenewMrk !== '1'"
          >
            常用条款
            <el-icon size="20" style="vertical-align: middle; color: red"
              ><InfoFilled
            /></el-icon>
          </h4>
        </el-tooltip>
        <el-row v-if="formconfig1.cRenewMrk !== '1'">
          <el-col :span="24">
            <div>
              <VueDraggable
                class="eachCon"
                v-model="termList"
                :animation="150"
                @update="updateOptionAll"
              >
                <el-card
                  v-for="(item, index) in termList"
                  :key="index"
                  :class="item.checked ? 'checked eachItems' : 'eachItems'"
                  shadow="hover"
                  @click="handleClick(item, index)"
                >
                  <p class="titles">
                    <el-icon size="20" style="vertical-align: middle"
                      ><Fold
                    /></el-icon>
                    <span :title="item.prodCnm" class="">
                      {{ item.prodCnm }}
                    </span>
                    <el-icon
                      :size="25"
                      style="color: rgb(250, 219, 20)"
                      @click.stop="handleStarClick(item)"
                      ><StarFilled
                    /></el-icon>
                  </p>
                  <p class="txt">{{ item.termNo }} - {{ item.termCnm }}</p>
                </el-card>
              </VueDraggable>
            </div>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="条款名称"
              prop="cTermNme"
              :rules="[getRules('required', {})]"
            >
              <el-select
                style="width: 500px"
                v-model="formconfig1.cTermNme"
                placeholder="请选择"
                @change="handleChange"
                @clear="handleClear"
                clearable
                :disabled="true"
              >
                <el-option
                  v-for="item in options"
                  :label="item.cNmeCn"
                  :value="item.cTermNo"
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
import {
  getProdEnableList,
  qryUserCommonTerm,
  unUserUnUntionTerm,
  getPolicy,
} from "./custom-recording.service";
const freeEditRef = ref<AppFreeEditMethod | null>(null);
import { createFreeButtonBase } from "@/shared/button-config";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { getListByCode } from "@/api/code-list-service";
import {useUserStore} from "@/store";
import { listChrDepts } from "@/api/dept";
import {scrollByDomId} from "@/utils/common";

const router = useRouter();
const dialogVisible = ref(true);
const step = ref("");
const dzmodal = useDzModal();
const tableRef = ref<AppTableMethod | null>(null);
const title = ref("自定义录单");
// 条款名称列表
const options = ref<any>([]);
// 常用条款列表
const termList = ref<any>([]);
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
const termDialog = defineAsyncComponent(() => import("./termDialog.vue"));
const formconfig1 = ref({
  cDptCde: "",
  cDptCnm: "",
  cRenewMrk: "0",
  cGrpMrk: "0",
  // cNmeCn: "",
  cTermNme: "",
  cTermNo: "",
  cProdNo: "",
  cProdNme: "",
  cPlyNo: "",
  cRecordType: 1,
  cIsPlan:'0',
});
const selectTreeItem = ref({});
const labelNm = ref("条款")
// 条款下拉数据
function loadOptions(type:number = 1) {// 条款 1 方案 2
  const param = { pageNo: 1, pageSize: 999, CEnableFlag: "1", level: 2, type };
  getProdEnableList(param).then((res:any) => {
    if (res.code === 200) {
      options.value = res.data.result;
    } else {
      ElMessage.error(res.msg);
    }
  });
}

const userStore = useUserStore();

const dptCdeList = ref<any[]>([]);
const cDptCdeList = ref<any[]>([]);

const isZGS = computed(()=>'0200000000000' === userStore.user.companyId);

// 查询分公司机构
const getDptCdeList = ()=> {
    if(isZGS.value) {
        listChrDepts({cDptCde: userStore.user.companyId, cDptCls: '1'}).then(({data, code}) => {
            if (code === 200) {
                dptCdeList.value = data.map((item) => ({
                    value: item.cDptCde,
                    label: item.cDptCnm,
                }));
            }
        }).catch(err => console.error(err));
    }
    dptCdeList.value?.push({
        label: userStore.user.companyCnm,
        value: userStore.user.companyId,
    });
};

// 查询出单机构
const cDptCdeLoading = ref(false);
const getCDptCdeList = (data: any)=> {
    cDptCdeLoading.value = true;
    listChrDepts({cDptRelCde: data,cSignDptMrk: '1',cDptCls: '2'}).then(({data, code}) => {
        if (code === 200) {
            cDptCdeList.value = data.map((item) => ({
                value: item.cDptCde,
                label: item.cDptCnm,
            }));
        }
        cDptCdeLoading.value = false;
    }).catch(err => console.error(err));
};

onMounted(async () => {
  handleQuery();
  loadOptions();
  nextTick(() => {
    step.value = "0";

      if(isZGS.value) {
          getDptCdeList();
      }else {
          getCDptCdeList(userStore.user.companyId);
      }
  });
});

// 绑定方法
const method = {};

//当前选中的机构item
function selectedItem(value) {
    const item = cDptCdeList.value.filter(f => f.value === value)[0];
    selectTreeItem.value = item;
    formconfig1.value.cDptCnm = item?.label;
    formconfig1.value.cDptCde = item?.value;
}

// 下一步
function next() {
  // console.log(formconfig1.value);
  freeEditRef.value?.validate().then((isValid: boolean) => {
    if (!isValid) {
      return false;
    } else {
      const data = formconfig1.value;
      if (formconfig1.value.cRenewMrk == "1") {
        getPolicy({ cPlyNo: formconfig1.value.cPlyNo, queryTyp: "orig" }).then(
          (res: any) => {
            if (res.code == "200") {
              router.push({
                path: "/pcisapp/myPage",
                query: {
                  param: JSON.stringify({ ...data, ...{ queryTyp: "orig" } }),
                  title: "询价单录入" // 直接设置新标题
                },
             
              });
            } else {
              ElMessage.error(res.msg);
            }
          }
        );
      } else {
        router.push({
          path: "/pcisapp/myPage",
          query: {
            param: JSON.stringify({ ...data, ...{ pageType: "app", pageName: "priceInquiry" } }),
             title: "询价单录入" // 直接设置新标题
          },
      
        });
      }
      sessionStorage.setItem(
        "toMyPageData",
        JSON.stringify({
          ...data,
          ...{ pageType: "app" },
          // ...{ dptItem: selectTreeItem.value },
        })
      );
    }
    step.value = step.value == "0" ? "1" : "0";
    title.value = step.value == "0" ? "自定义录单" : "选择条款";
  }).catch((err: any) => {
    const ids = Object.keys(err);
    if(ids) {
      scrollByDomId( `#${ids[0]}`, "center")
    }
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
    termList.value.map((item: any, index: any) => {
      if (index != index) {
        item.checked = false;
      }
    });
  } else {
    termList.value.forEach((item: any, index: any) => (item.checked = false));
  }
  item.checked = !item.checked;
  formconfig1.value.cTermNme = item.checked ? item.termCnm || item.planCnm : "";
  formconfig1.value.cTermNo = item.termNo || item.planNo;
  formconfig1.value.cProdNo = item.prodNo;
  formconfig1.value.cProdNme = item.prodCnm;
}
//取消常用条款
function handleStarClick(item: any) {
  const param = {
    planNo: item.termNo,
    isPlan: "0",
    voType: "inquiry",
  }
  unUserUnUntionTerm(param).then((res:any) => {
    if (res.code == "1") {
      ElMessage.success(res.message);
      handleQuery();
    } else {
      ElMessage.error(res.msg);
    }
  });
}
function handleQuery() {
  qryUserCommonTerm({
    pageNum: 1,
    pageSize: 9999,
    userId: JSON.parse(sessionStorage.getItem("user")).opCde,
    isPLan: "0",
    voType: "inquiry",
  }).then((res: any) => {
    if (res.code == "1") {
      termList.value = res.result;
    }
  });
}
// 条款列表选中
function handleChange() {
  // 如果下拉数据不存在list中，则清除list所有选中数据
  if (
    !termList.value.some(
      (item: any) => item.termNo == formconfig1.value.cTermNo
    )
  ) {
    termList.value.forEach((item: any, index: any) => (item.checked = false));
  }
  // 如果下拉数据存在list中，则选中list中对应数据
  if (
    termList.value.some((item: any) => item.termNo == formconfig1.value.cTermNo)
  ) {
    termList.value.forEach((item: any, index: any) => {
      if (item.termNo == formconfig1.value.cTermNo) {
        item.checked = true;
      } else {
        item.checked = false;
      }
    });
  }
}
// 条款列表清除
function handleClear() {
  termList.value.forEach((item: any, index: any) => (item.checked = false));
  formconfig1.value.cTermNo = "";
}

// 条款列表拖拽后操作
function updateOptionAll(e: any) {
  console.log(termList.value);
}

// 选择条款弹框
function showModal() {
  dzmodal
    .open(termDialog, { 
      type: "Issuer",
      data: { updateQuery, type: formconfig1.value.cRecordType, voType: "inquiry", },
      termList: termList.value,
    })
    .then((res: any) => {
      if (res.type === "ok") {
        const selectedTerm = res.body;
        formconfig1.value.cTermNo = selectedTerm.data.code;
        formconfig1.value.cTermNme = selectedTerm.data.value;
        formconfig1.value.cProdNo = selectedTerm.parent.data.code;
        handleQuery();
      }
    });
}
function updateQuery() {
  handleQuery();
}

// 录单方式
function handleRecordTypeChange(val:any) {
  formconfig1.value.cTermNme = "";
  formconfig1.value.cGrpMrk = "0";
  formconfig1.value.cRenewMrk = "0";
  loadOptions();
  labelNm.value = "条款";
  formconfig1.value.cIsPlan = '0';
  handleQuery()
  formconfig1.value.cTermNme = "";
  formconfig1.value.cTermNo = "";
  formconfig1.value.cProdNo = "";
  formconfig1.value.cProdNme = "";
}
</script>

<style scoped>
.container {
  padding: 20px;
}
.searchbar.el-card .el-card__header {
  display: flex;
  justify-content: space-between;
  /* align-items: center; */
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
  align-items: stretch;
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
  border: 3px solid rgb(178, 31, 41);
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
.info-filled-custom {
  background-color: white;
  border: 1px solid red;
  border-radius: 50%;
  padding: 2px;
}
</style>
