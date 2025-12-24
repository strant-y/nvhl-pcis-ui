<!-- 自定义录单 -->
<template>
  <div class="searchbar el-card app-container">
    <!-- <div class="el-card__header">
      <span class="el-card__header__title">{{ title }}</span>
    </div> -->
    <div>
      <el-form
        ref="freeEditRef"
        :model="formconfig1"
        label-width="180px"
        :inline="true"
      >
        <h4 style="margin: 0 20px">投保向导</h4>
				<el-form-item
          id="cRecordType"
          label="录单方式"
          prop="cRecordType"
          :rules="[getRules('required', {})]"
        >
          <el-radio-group v-model="formconfig1.cRecordType" @change="handleRecordTypeChange">
            <el-radio :value="1">自定义录单</el-radio>
            <el-radio :value="5">方案录单</el-radio>
            <el-radio :value="7">模板出单</el-radio>
            <el-radio :value="9">协议出单</el-radio>
            <el-radio :value="10">组合出单</el-radio>
          </el-radio-group>
        </el-form-item>
        <div>
          <el-form-item
            id="tpl"
            v-if="formconfig1.cRecordType === 7"
            label="选择模板"
            prop="tpl"
            style="width: 400px"
            :rules="[getRules('required', {})]"
          >
            <el-select-v2
              v-model="formconfig1.tpl"
              :options="tplOptions"
              placeholder="选择模板"
              size="large"
              filterable
              @change="selectedTpl"
            />
          </el-form-item>
          <el-form-item
            id="seldef"
            v-if="formconfig1.cRecordType === 7"
            label="模板描述"
            prop="seldef"
            style="width: 600px"
          >
            <div>{{ formconfig1.seldef }}</div>
          </el-form-item>
        </div>
				<div>
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
				</div>
        <template v-if="formconfig1.cRecordType == 1 || formconfig1.cRecordType == 9">
          <h4 style="margin: 0 20px">投保信息</h4>
          <el-form-item
            id="cRenewMrk"
						v-if="formconfig1.cRecordType == '1'"
            label="投保标识"
            prop="cRenewMrk"
            :rules="[getRules('required', {})]"
          >
            <el-radio-group v-model="formconfig1.cRenewMrk">
              <el-radio value="0">新保</el-radio>
              <el-radio value="1">续保</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item
            id="cPlyNo"
            v-if="formconfig1.cRenewMrk == '1'"
            label="上年保单号"
            prop="cPlyNo"
            :rules="[getRules('required', {})]"
          >
            <el-input
              style="width: 300px"
              placeholder="请输入续保保单号"
              v-model="formconfig1.cPlyNo"
            >
            </el-input>
            <rt-button
              :item="{
                type: 'primary',
                label: '查询',
                btnStyle: {'margin-left': '10px'},
                func: () => {
                  renewalQuery();
                },
              }"
            />
          </el-form-item>
					<!-- 协议出单需要展示的字段 -->
					<el-row v-if="formconfig1.cRecordType == '9'">
						<el-col :span="24">
							<el-form-item
                id="cEcAgrNo"
								label="协议号"
								prop="cEcAgrNo"
								:rules="[getRules('required', {})]"
							>
								<el-input style="width: 500px" v-model="formconfig1.cEcAgrNo" disabled />
								<el-button
									@click="getProtocolNumber"
									icon="Search"
									type="primary"
								></el-button>
							</el-form-item>
						</el-col>
					</el-row>
					<el-row v-if="formconfig1.cRecordType == '9'">
						<el-col :span="24">
							<el-form-item
                id="cProdNme"
								label="产品编码"
								prop="cProdNme"
								:rules="[getRules('required', {})]"
							>
								<el-select
									style="width: 500px"
									v-model="formconfig1.cProdNme"
									placeholder="请选择"
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
									@click="getBeToOrgan"
									icon="Search"
									type="primary"
								></el-button>
							</el-form-item>
						</el-col>
					</el-row>
					<el-row v-if="formconfig1.cRecordType == '9'">
						<el-col :span="24">
							<el-form-item
                id="cTermNme"
								label="条款代码"
								prop="cTermNme"
								:rules="[getRules('required', {})]"
							>
								<el-select
									style="width: 500px"
									v-model="formconfig1.cTermNme"
									placeholder="请选择"
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
									@click="getTermNme"
									icon="Search"
									type="primary"
								></el-button>
							</el-form-item>
						</el-col>
					</el-row>
					<el-row v-if="formconfig1.cRecordType == '9'">
						<el-col :span="24">
							<el-form-item
                id="cRiskNme"
								label="责任编码"
								prop="cRiskNme"
								:rules="[getRules('required', {})]"
							>
								<el-select
									style="width: 500px"
									v-model="formconfig1.cRiskNme"
									placeholder="请选择"
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
									@click="getRiskNo"
									icon="Search"
									type="primary"
								></el-button>
							</el-form-item>
						</el-col>
					</el-row>
					<el-row v-if="formconfig1.cRecordType == '9'">
						<el-col :span="24">
							<el-form-item
                                id="cInsuredNme"
								label="被保人"
								prop="cInsuredNme"
							>
								<el-input style="width: 500px" v-model="formconfig1.cInsuredNme" disabled />
								<el-button
									@click="getInsuredName"
									icon="Search"
									type="primary"
								></el-button>
							</el-form-item>
              <el-form-item>
                <rt-button
                  :item="{
                    type: 'primary',
                    label: '下一步',
                    func: () => {
                      next();
                    },
                  }"
                />
              </el-form-item>
						</el-col>
					</el-row>
        </template>
				<template v-if="formconfig1.cRecordType != 9">
					<h4 style="margin: 0 20px">选择{{ labelNm }}</h4>
					<el-form-item
            id="cGrpMrk"
						label="团个属性"
						prop="cGrpMrk"
						:rules="[getRules('required', {})]"
					>
						<el-radio-group v-model="formconfig1.cGrpMrk">
							<el-radio value="0">个单</el-radio>
							<el-radio value="1">团单</el-radio>
						</el-radio-group>
					</el-form-item>
          <el-form-item style="margin-left: 170px;" v-if="formconfig1.cRenewMrk == '1'">
            <rt-button
              :item="{
                type: 'primary',
                label: '下一步',
                func: () => {
                  next();
                },
              }"
            />
          </el-form-item>
				</template>
        <template v-if="formconfig1.cRecordType == '5'">
          <rt-button
            :item="{
              type: 'primary',
              label: '模板下载',
              loading: downloadTemplateLoading,
              func: () => {
                downloadTemplate();
              },
            }"
          />
          <rt-button
            :item="{
              type: 'primary',
              label: '导入方案',
              loading: importTemplateLoading,
              func: () => {
                importTemplate();
              },
            }"
          />
        </template>
				<template v-if="formconfig1.cRecordType != 9">
					<el-tooltip placement="top">
						<template #content>
							可用鼠标左键，按住常用{{ labelNm }}卡片<br />自由拖动常用{{ labelNm }}排序<br />
						</template>
						<h4
							style="margin: 0 20px; width: 200px"
							v-if="formconfig1.cRenewMrk !== '1'"
						>
							常用{{ labelNm }}
							<el-icon size="20" style="vertical-align: middle; color: red"
								><InfoFilled
							/></el-icon>
						</h4>
					</el-tooltip>
					<el-row v-if="formconfig1.cRenewMrk !== '1'">
            <el-col :span="24" v-if="formconfig1.cRecordType != 10">
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
                    <p class="txt" v-if="formconfig1.cRecordType == 1 || formconfig1.cRecordType == 7">{{ item.termNo }} - {{ item.termCnm }}</p>
                    <p class="txt" v-else>{{ item.planNo }} - {{ item.planCnm }}</p>
                  </el-card>
                </VueDraggable>
              </div>
            </el-col>
            <el-col :span="24" v-if="formconfig1.cRecordType === 10">
              <el-form-item
                  :label="`${labelNm}名称`"
                  prop="cProdList"
                  :rules="[getRules('required', {})]"
              >
                <el-select
                    style="width: 500px"
                    v-model="formconfig1.cProdList"
                    placeholder="请选择"
                    @clear="handleClear"
                    multiple
                    clearable
                    :disabled="true"
                >
                  <el-option
                      v-for="item in prodList"
                      :label="item.label"
                      :value="item.value"
                  />
                </el-select>
                <el-button
                    @click="selectProdList"
                    icon="Search"
                    type="primary"
                ></el-button>
              </el-form-item>
              <el-form-item>
                <rt-button
                  :item="{
                    type: 'primary',
                    label: '下一步',
                    func: () => {
                      next();
                    },
                  }"
                />
              </el-form-item>
            </el-col>
            <el-col :span="24" v-else>
              <el-form-item
                  :label="`${labelNm}名称`"
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
              <el-form-item>
                <rt-button
                  :item="{
                    type: 'primary',
                    label: '下一步',
                    func: () => {
                      next();
                    },
                  }"
                />
              </el-form-item>
            </el-col>
					</el-row>
				</template>

      </el-form>
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
  checkRenewalDpt,
  getAppPolicyComponent,
  getAppPolicyForRenewal,
  downloadPlanTemplate,
  importPlan,
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
import { PolicyService } from '@/views/pcis-main/service/my-page/policy.service';
import {scrollByDomId} from "@/utils/common";
import {POSITE_PAGE_TYPE_APP} from "@/views/pcis/support/composite.types";
const policyService = new PolicyService();
import { cannotCopy } from '@/utils/cannotCopyPlyNo';
import { saveAs } from "file-saver";

const router = useRouter();
const dialogVisible = ref(true);
const step = ref("");
const dzmodal = useDzModal();
const tableRef = ref<AppTableMethod | null>(null);
const title = ref("自定义录单");
// 条款名称列表
const options = ref<any>([]);
const prodList = ref<any>([]);
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
const renewalDialog = defineAsyncComponent(() => import("./renewalDialog.vue"));
const formconfig1:any = ref({
  cDptCde: "",
  cDptCnm: "",
  cRenewMrk: "0",
  cGrpMrk: "0",
  dptCde:  "",
	// cNmeCn: "",
	cRiskNme: "", // 责任名称
  cRiskNo: "", // 责任编码
  cTermNme: "", // 条款名称
  cTermNo: "", // 条款代码
  cProdNo: "", // 产品编码
  cProdNme: "", // 产品名称
  cPlyNo: "",
  cRecordType: 1,
  cIsPlan:'0',
	cEcAgrNo: '', // 协议号
	cEcAgrAppNo: '', // 协议申请单号
	cInsuredCde: '', // 被保人编码
	cInsuredNme: '', // 被保人名称
	cNeedfeeFlag: '', // 是否见费出单
  cProdList: [], // 产品编码列表
  cProdDtlList: [], // 产品明细列表
});
const selectTreeItem = ref({});
const labelNm = ref("条款")
const tplOptions = ref([])
// 条款下拉数据
function loadOptions(type:number = 1) {// 条款 1 方案 5 模板 7
  console.log('pppp',type)
	const param = {
		pageNo: 1,
		pageSize: 999,
		CEnableFlag: "1",
		level: 2,
		type,
		cOperId: JSON.parse(sessionStorage.getItem("user")).opCde,
		cDptCde: JSON.parse(sessionStorage.getItem("user")).companyId,
	};

  console.log('param ',param)
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
    if(formconfig1.value.cRecordType !== 9){
      formconfig1.value.cDptCde = "";
      formconfig1.value.cDptCnm = "";
    }
    listChrDepts({cDptRelCde: data,cSignDptMrk: '1',cDptCls: '2'}).then(({data, code}) => {
        if (code === 200) {
            cDptCdeList.value = data.map((item) => ({
                value: item.cDptCde,
                label: item.cDptCnm,
            }));
          // 清空已选择的承保机构
          // formconfig1.value.cDptCde = "";
          // formconfig1.value.cDptCnm = "";
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
function selectedItem(value: any) {
    const item = cDptCdeList.value.filter(f => f.value === value)[0];
    selectTreeItem.value = item;
    formconfig1.value.cDptCnm = item?.label;
    formconfig1.value.cDptCde = item?.value;
}

// 下一步
const handleArray = (obj:any)=>{
  // 创建一个新的对象，并移除"Base."前缀
  let newObj = {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      // 通过字符串操作去掉前缀
      let newKey = key.replace('Base.', '');
      newObj[newKey] = obj[key];
    }
  }
  return newObj
}
function next() {
  // console.log(formconfig1.value);
  freeEditRef.value?.validate().then(async (isValid: boolean) => {
    if (!isValid) {
      return false;
    } else {
      if(formconfig1.value.cRecordType === 10) {
        console.log('formconfig1.value', formconfig1.value)
        router.push({
          path: "/pcisapp/posite-page",
          query: {
            param: JSON.stringify({ ...formconfig1.value, ...{ pageType: POSITE_PAGE_TYPE_APP } }),
          },
        });
        return;
      }
      // 点击下一步前校验，如果data为true则继续，否则阻断并提示
      const queryProdDptCdeParam:any = { cDptCde:  formconfig1.value.cDptCde }
      if(formconfig1.value.cRenewMrk === "1") {
        if(formconfig1.value.cPlyNo?.length > 18) {
          ElMessage.error("历史数据的保单, 不允许续保");
          return;
        }
        if (cannotCopy(formconfig1.value.cPlyNo)) {
          ElMessage.error("该保单不允许续保");
          return;
        }
        queryProdDptCdeParam['cPlyNo'] = formconfig1.value.cPlyNo
      } else {
        queryProdDptCdeParam['cProdNo'] = formconfig1.value.cProdNo
      }
      const queryProdDptCde:any = await policyService.queryProdDptCde(queryProdDptCdeParam)
      if(queryProdDptCde.data !== true) {
        ElMessage.error(queryProdDptCde.msg)
        return
      }
      const data = formconfig1.value;
			if (formconfig1.value.cRenewMrk == "1") {
				if(Object.keys(renewalComponent.value).length == 0) {
          ElMessage.error("上年保单号请点击查询！");
          return;
        }
        getAppPolicyForRenewal({ cPlyNo: formconfig1.value.cPlyNo, components: [renewalComponent.value] }).then(
            async (res: any) => {
              if (res.code == "200") {
                //校验两个机构是否是同一个二级机构
                var same;
                await checkRenewalDpt({
                  cDptCde_ply: res.res.composition.plyBase[0]?.['Base.cDptCde'],
                  cDptCde_app: formconfig1.value.cDptCde
                }).then((response: any) => {
                  if (response.code === 200) {
                    same = response.data == 1;
                  } else {
                    ElMessage.error(response.msg);
                  }
                });
                if (!same) {
                  ElMessage.warning("续保保单的承保机构编码【" + res.res.composition.plyBase[0]?.['Base.cDptCde'] + "】与当前选择的承保机构不在同一【二级机构】下，请重新选择！");
                  return
                }
              if (res.res.composition.plyBase[0]?.['Base.cTransMrk'] === '1') {
                ElMessage.warning("该保单不允许续保，请重新选择！");
                return
              }
              router.push({
                path: "/pcisapp/myPage",
                query: {
                  param: JSON.stringify({
                    ...handleArray(res.res.composition.plyBase[0]), ...{
											pageType: "orig",
											cTermNme: res.res.composition.cvrg[0]?.["Term.cClauseCode"],
											cTermNo: res.res.composition.cvrg[0]?.["Term.cClauseName"],
											res: res,
											// renewalComponent: renewalComponent.value,
                    }
                  }),
                },
              });
            } else {
              ElMessage.error(res.msg);
            }
          }
        );
      } else if (formconfig1.value.cRecordType == 7) {// 模板出单
        router.push({
          path: "/pcisapp/myPage",
          query: {
            param: JSON.stringify({ ...data, ...{ pageType: "template", cPkId: formconfig1.value.cPkId } }),
          },
        });
      } else {
        router.push({
          path: "/pcisapp/myPage",
          query: {
            param: JSON.stringify({ ...data, ...{ pageType: "app" } }),
          },
        });
      }
      sessionStorage.setItem(
        "toMyPageData",
        JSON.stringify({
          ...data,
          ...{ pageType: formconfig1.value.cRenewMrk == "1"? "orig" : "app" },
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
  console.log("0000000",item);
  const param = formconfig1.value.cRecordType === 5 ? {
    planNo: item.planNo,
    isPlan: "1",
  } : {
    termNo: item.termNo,
    isPlan: "0",
  }
  param.voType = "app";
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
    isPLan: formconfig1.value.cRecordType === 5 ? "1" : "0",
    voType: "app",
  }).then((res: any) => {
    if (res.code == "1") {
      termList.value = res.result;
    }
  });
}
// 条款列表选中
function handleChange() {
  console.log('选中')
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
      data: { updateQuery, type: formconfig1.value.cRecordType, voType: "app", },
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


function selectProdList() {
  dzmodal.open(termDialog, {
    type: "Issuer",
    data: { updateQuery, type: formconfig1.value.cRecordType, voType: "app", },
    termList: termList.value,selectedList: formconfig1.value.cProdDtlList
  }).then((res: any) => {
    if (res.type === "ok") {
      const selectedTerm = res.body;
      console.log('res', res);
      prodList.value = selectedTerm.map((item: any) => {
        const datas = item.searchKey.split('_');
        return {
          value: datas[3].substring(0, 6),
          label: datas[3].substring(6),
        };
      });
      formconfig1.value.cProdList = selectedTerm.map((item: any) => {
        const datas = item.searchKey.split('_');
        return datas[3].substring(0, 6)
      });
      formconfig1.value.cProdDtlList = selectedTerm.map((item: any) => {
        const datas = item.searchKey.split('_');
        return {
          cProdNo: datas[3].substring(0, 6),
          cProdNme: datas[3].substring(6),
          cTermNo: item.code,
          cGrpMrk: formconfig1.value.cGrpMrk,
          searchKey: item.searchKey
        };
      });
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
  if (val == "5") {
    loadOptions(2);
    labelNm.value = "方案";
    formconfig1.value.cIsPlan = '1';
  } else if (val == "1") {
    loadOptions();
    labelNm.value = "条款";
    formconfig1.value.cIsPlan = '0';
  } else {
    loadOptions(1);
    labelNm.value = "条款";
    formconfig1.value.cIsPlan = '0';
  }
	handleQuery()
	formconfig1.value.cRiskNme = "";
	formconfig1.value.cRiskNo = "";
  formconfig1.value.cTermNme = "";
  formconfig1.value.cTermNo = "";
  formconfig1.value.cProdNo = "";
  formconfig1.value.cProdNme = "";
  formconfig1.value.tpl = null;
  formconfig1.value.seldef = "";
  tplOptions.value = [];
}

// 模板下拉选项
function getTplOptions() {
  tplOptions.value = [];
  formconfig1.value.seldef = "";
  formconfig1.value.tpl = null;
  const param = {
    'PrdProdTemplate.CProdNo': formconfig1.value.cProdNo,
    'PrdProdTemplate.CCrtCde': userStore.user.opCde,
    pageNum: 1,
    pageSize: 1000,
  }
  policyService.searchTemplate(param).then((res:any) => {
    console.log(res.res)
    if (res.code === 200) {
      tplOptions.value = res.res.map((item:any) => ({
        value: item.cPkId,
        label: item.cTplNme,
        desc: item.cDesc,
        cTplCtnt: JSON.parse(item.cTplCtnt)

      }));

      console.log(' tplOptions.value', tplOptions.value)

    } else {
      ElMessage.error(res.msg);
    }
  });
}

// 选择模板
function selectedTpl(value:any) {
  console.log('模版---',formconfig1)
  console.log('模版---',tplOptions)
  if(value) {
    const item: any = tplOptions.value.filter(f => f.value === value)[0];
    formconfig1.value.seldef = item?.desc;
    formconfig1.value.cPkId = value;
  } else {
    formconfig1.value.seldef = "";
    formconfig1.value.cPkId = "";
  }
}
/**
 * 协议号
 */

// 协议出单-协议号查询弹窗页面引入
const protocolNumberInfo = defineAsyncComponent(
  () => import("@/views/pcis/my-page/components/rotocol-number-info.vue")
);
// 协议出单-协议号弹窗打开
function getProtocolNumber (){
	dzmodal
    .open(protocolNumberInfo, { type: "Issuer", data: {} })
    .then((res: any) => {
      if (res.type === "ok") {
        const selectedTerm = res.body;
        // nRecRemPrm 剩余保费   nRecRemEstAmt 剩余保额
        if(selectedTerm.nRecRemPrm <= 0 || selectedTerm.nRecRemEstAmt <= 0 ){
          ElMessage.warning("该协议剩余预收保额不足,请重新选择协议！");
          return false
        }
        formconfig1.value.cEcAgrNo = selectedTerm.cEcAgrNo; // 协议号
        formconfig1.value.dptCde = selectedTerm.cDptRelCde; // 分公司编码
        formconfig1.value.cDptCnm = selectedTerm.cDptCnm; // 机构名称
        formconfig1.value.cDptCde = selectedTerm.cDptCde; // 机构代码
        formconfig1.value.cEcAgrAppNo = selectedTerm.cEcAgrAppNo; // 协议申请单号
        formconfig1.value.cNeedfeeFlag = selectedTerm.cNeedfeeFlag; // 是否见费出单
				getCDptCdeList(selectedTerm.cDptRelCde)
      }
    });
}

/**
 * 产品编码
 */
// 协议出单-产品编码查询弹窗页面引入
const productCodeInfo = defineAsyncComponent(
  () => import("@/views/pcis/my-page/components/product-code-info.vue")
);

// 协议出单-产品编码查询弹窗打开
function getBeToOrgan (){
	if(!formconfig1.value.cEcAgrNo && !formconfig1.value.cEcAgrAppNo){
		ElMessage.warning("请先选择协议号！");
		return false
	}
	dzmodal
    .open(productCodeInfo, { type: "Issuer", data: {cEcAgrAppNo:formconfig1.value.cEcAgrAppNo} })
    .then((res: any) => {
      if (res.type === "ok") {
				const selectedTerm = res.body;
				formconfig1.value.cProdNo = selectedTerm.code;
				formconfig1.value.cProdNme = selectedTerm.value;
				termCodeList.value = selectedTerm.list
      }
    });
}

/**
 * 条款代码
 */
const termCodeList = ref(null) // 条款下拉值
// 协议出单-条款代码查询弹窗页面引入
const termCodeInfo = defineAsyncComponent(
  () => import("@/views/pcis/my-page/components/term-code-info.vue")
);

// 协议出单-条款代码查询弹窗打开
function getTermNme (){
	if(!formconfig1.value.cEcAgrNo && !formconfig1.value.cEcAgrAppNo){
		ElMessage.warning("请先选择协议号！");
		return false
	}
	if(!formconfig1.value.cProdNo && !formconfig1.value.cProdNme){
		ElMessage.warning("请先选择产品编码！");
		return false
	}
	dzmodal
    .open(termCodeInfo, { type: "Issuer", data: {codelist: termCodeList.value} })
    .then((res: any) => {
      if (res.type === "ok") {
				const selectedTerm = res.body;
				formconfig1.value.cTermNo = selectedTerm.code;
				formconfig1.value.cTermNme = selectedTerm.value;
				RiskCodeList.value = selectedTerm.list
      }
    });
}

/**
 * 责任编码
 */
const RiskCodeList = ref(null) // 责任下拉值
// 协议出单-责任编码查询弹窗页面引入
const riskCodeInfo = defineAsyncComponent(
  () => import("@/views/pcis/my-page/components/risk-code-info.vue")
);

// 协议出单-责任编码查询弹窗打开
function getRiskNo (){
	if(!formconfig1.value.cEcAgrNo && !formconfig1.value.cEcAgrAppNo){
		ElMessage.warning("请先选择协议号！");
		return false
	}
	if(!formconfig1.value.cProdNo && !formconfig1.value.cProdNme){
		ElMessage.warning("请先选择产品编码！");
		return false
	}
	if(!formconfig1.value.cTermNo && !formconfig1.value.cTermNme){
		ElMessage.warning("请先选择条款代码！");
		return false
	}
	dzmodal
    .open(riskCodeInfo, { type: "Issuer", data: {codelist: RiskCodeList.value} })
    .then((res: any) => {
      if (res.type === "ok") {
				const selectedTerm = res.body;
				formconfig1.value.cRiskNo = selectedTerm.code;
				formconfig1.value.cRiskNme = selectedTerm.value;
      }
    });
}
/**
 * 被保人编码
 */
// 协议出单-被保人编码查询弹窗页面引入
const insuredNameInfo = defineAsyncComponent(
  () => import("@/views/pcis/my-page/components/insured-name-info.vue")
);

// 协议出单-被保人编码查询弹窗打开
function getInsuredName (){
	if(!formconfig1.value.cEcAgrNo && !formconfig1.value.cEcAgrAppNo){
		ElMessage.warning("请先选择协议号！");
		return false
	}
	dzmodal
    .open(insuredNameInfo, { type: "Issuer", data: {cEcAgrAppNo:formconfig1.value.cEcAgrAppNo} })
    .then((res: any) => {
      if (res.type === "ok") {
				const selectedTerm = res.body;
				formconfig1.value.cInsuredCde = selectedTerm.cInsuredCde;
				formconfig1.value.cInsuredNme = selectedTerm.cInsuredNme;
      }
    });
}

watch(
  () => formconfig1.value.cTermNme,
  (newVal) => {
    if(formconfig1.value.cRecordType == 7) {
      if(newVal) {
        getTplOptions();
      } else {
        formconfig1.value.tpl = null;
        formconfig1.value.seldef = "";
        tplOptions.value = [];
        formconfig1.value.cPkId = "";
      }
		} else {
			// 条款代码变化，清空责任编码
			formconfig1.value.cRiskNo   = '';
    	formconfig1.value.cRiskNme  = '';
		}
  }
);
watch(
  () => formconfig1.value.cEcAgrNo,
  () => {
    // 协议号变化，立即清空后续四项
    formconfig1.value.cProdNo   = '';
    formconfig1.value.cProdNme  = '';
    formconfig1.value.cTermNo   = '';
		formconfig1.value.cTermNme = '';
		formconfig1.value.cRiskNo   = '';
    formconfig1.value.cRiskNme  = '';
    formconfig1.value.cInsuredCde = '';
		formconfig1.value.cInsuredNme = '';
  }
);
watch(
  () => formconfig1.value.cProdNo,
  () => {
    if(formconfig1.value.cRecordType == '9') {
      // 协议出单 产品编码变化，立即清空条款代码、责任编码
      formconfig1.value.cTermNo   = '';
			formconfig1.value.cTermNme = '';
			formconfig1.value.cRiskNo   = '';
			formconfig1.value.cRiskNme = '';
    }
  }
);

// 续保查询
const renewalComponent = ref({})
function renewalQuery() {
  if(!formconfig1.value.cPlyNo) {
    ElMessage.warning("请输入上年保单号！")
    return;
  }
  getAppPolicyComponent({ cPlyNo: formconfig1.value.cPlyNo }).then((res:any) => {
    if (res.code == 500){
      ElMessage.error(res.msg)
    }else if(res.res.length > 0) {
      dzmodal
        .open(renewalDialog, { 
          type: "Issuer",
          cPlyNo: formconfig1.value.cPlyNo,
          options: Object.keys(res.res[0]).map((item:any) => ({ label: res.res[0][item], value: item })),
          selected: Object.keys(res.res[0]).map((item:any) => item)
        })
        .then((res: any) => {
          if(res.type === 'ok') {
            renewalComponent.value = res.body.component
          }
        });
    } else {
      ElMessage.error(res.msg)
    }
  }).catch(err => {
    ElMessage.error(err.msg || err)
  })
}

// 模板下载
const downloadTemplateLoading = ref(false);
function downloadTemplate() {
  if(!formconfig1.value.cProdNo || !formconfig1.value.cTermNo) {
    ElMessage.warning("请先选择方案！");
		return false
  }
  if(!formconfig1.value.cDptCde) {
    ElMessage.warning("请先选择承保机构！");
		return false
  }
  downloadTemplateLoading.value = true;
  const param = {
    cPlanNo: formconfig1.value.cTermNo,
    CProdNo: formconfig1.value.cProdNo,
    CGrpMrk: '0',
    cDptCde: formconfig1.value.cDptCde,
  }
  downloadPlanTemplate(param).then((res:any) => {
    downloadTemplateLoading.value = false;
    if (res.size <= 0) {
      ElMessage.error({ message: "下载出错", duration: 3000 });
      return;
    }
    const fileName = decodeURIComponent(res.headers['content-disposition'].split('filename=')[1]);
    const blob = new Blob([res.data], {
      responseType: res.headers["content-type"]
      // "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; charset=UTF-8",
    });
    saveAs(blob, fileName);
  })
  .catch(() => {
    ElMessage.error("模板下载失败");
    downloadTemplateLoading.value = false;
  });
}

// 模板导入
const importTemplateLoading = ref(false);
function importTemplate() {
  if(!formconfig1.value.cProdNo || !formconfig1.value.cTermNo) {
    ElMessage.warning("请先选择方案！");
		return false
  }
  if(!formconfig1.value.cDptCde) {
    ElMessage.warning("请先选择承保机构！");
		return false
  }
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.xlsx, .xls, .xlsm'; // 支持的文件类型
  input.onchange = () => {
    if (input.files?.length) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = async (e) => {
        const base64String = e.target?.result as string;

        // ✅ 此处赋值有效
        // fileBase = base64String.split(',')[1]; // 去掉 data:image/type;base64, 前缀

        // console.log(fileBase, "0000000"); // ✅ 此处可以正常打印 Base64 字符串

        // 构建参数并请求接口
        const params = {
          cPlanNo: formconfig1.value.cTermNo,
          CProdNo: formconfig1.value.cProdNo,
          CGrpMrk: '0',
          cDptCde: formconfig1.value.cDptCde,
          file: base64String,
        }
        importTemplateLoading.value = true;
        importPlan(params).then((res:any) => {
          importTemplateLoading.value = false;
          if (res.code === 200) {
            
          } else {
            ElMessage.error(res.msg || "导入失败");
          }
        }).catch((error) => {
          ElMessage.error("导入出错，请检查文件格式或内容");
          console.error("导入错误：", error);
          importTemplateLoading.value = false;
        });
      };

      reader.onerror = (e) => {
        console.error("文件读取失败", e);
        ElMessage.error("文件读取失败");
      };
      reader.readAsDataURL(file); // 启动读取
    }
  };
  input.click(); // 触发文件选择对话框
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
  border: 2px solid var(--el-color-primary);
  background: var(--rt-overlay-color);
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
:deep(.el-form-item--default) {
  margin-bottom: 5px;
}
</style>
