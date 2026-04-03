<template>
    <el-dialog
      v-model="dialogVisible"
      width="55%"
      title="选择付费方式"
      @close="closeDialog"
    >
    <div>
      <el-form
        ref="dataFormRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="付费方式" prop="paymentMethod">
          <el-select-v2 v-model="formData.paymentMethod" size="large" :options="paymentMethodList" :disabled="formData.cRenewMrk == '1'" placeholder="请选择付费方式">
            <!-- <el-option
                v-for="(item, index) in paymentMethodList"
                :key="index"
                :value="item.value"
                :label="item.label"
            /> -->
          </el-select-v2>
        </el-form-item>
        <el-form-item
          id="dptCde"
          v-if="isZGS"
          label="分公司"
          prop="dptCde"
        >
            <el-select-v2
                v-model="formData.dptCde"
                :options="dptCdeList"
								:disabled="formData.cRenewMrk == '1'"
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
        >
            <el-select-v2
                v-model="formData.cDptCde"
                :options="cDptCdeList"
								:disabled="formData.cRenewMrk == '1'"
                placeholder="承保机构"
                size="large"
                :loading="cDptCdeLoading"
                filterable
                clearable
                @change="selectedItem"
            />
        </el-form-item>
				<el-form-item
            id="cRenewMrk"
            label="投保标识"
            prop="cRenewMrk"
            :rules="[getRules('required', {})]"
          >
            <el-radio-group v-model="formData.cRenewMrk">
              <el-radio value="0">新保</el-radio>
              <el-radio value="1">续保</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item
            id="cPlyNo"
            v-if="formData.cRenewMrk == '1'"
            label="上年保单号"
            prop="cPlyNo"
            :rules="[getRules('required', {})]"
          >
            <el-input
              style="width: 300px"
              placeholder="请输入续保保单号"
              v-model="formData.cPlyNo"
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
      </el-form>
    </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="confirm">确 定</el-button>
          <el-button @click="closeDialog">取 消</el-button>
        </div>
      </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();
import { ref } from "vue";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import {codelistQuery} from "@/api/dict";
import { listChrDepts } from "@/api/dept";
import { useUserStore } from "@/store";
import {
  checkRenewalDpt,
  getECargoPolicyComponent,
	getECargoPolicyForRenewal,
	getECargoPolicyPayment,
} from "../../pcis/guide/custom-recording.service";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { useRouter } from "vue-router";
import { PolicyService } from '@/views/pcis-main/service/my-page/policy.service';
const policyService = new PolicyService();
const dzmodal = useDzModal();
const router = useRouter();
const paymentMethodList = ref([
    {label:'预付', value:'01'},
    {label:'非预付', value:'02'}
]);

const emits = defineEmits(["ok", "cancel"]);
const dialogVisible = ref(true);

const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
  method: {
    type: Object,
    default: () => ({}),
  },
});
const queryFormRef = ref(ElForm);
const dataFormRef = ref(ElForm);
const formData = reactive<DictTypeForm>({
    paymentMethod: '',
    cDptCde: "",
    cDptCnm: "",
    cTeamType: "",
		dptCde: "",
		cRenewMrk: "0",
		cPlyNo: "",
});
const userStore = useUserStore();
const dptCdeList = ref<any[]>([]);
const cDptCdeList = ref<any[]>([]);
const selectTreeItem = ref({});

const isZGS = computed(()=>'0200000000000' === userStore.user.companyId);
const rules = reactive({
  paymentMethod: [{ required: true, message: "请选择付费方式", trigger: "change" }],
  dptCde: [{ required: true, message: "请选择分公司", trigger: "change" }],
  cDptCde: [{ required: true, message: "请选择出单机构", trigger: "change" }],
});
// 查询分公司机构
const getDptCdeList = ()=> {
    if(isZGS.value) {
        listChrDepts({cDptCde: userStore.user.companyId, cDptCls: '1'}).then(({data, code}) => {
            if (code === 200) {
                dptCdeList.value = data.map((item) => ({
                    value: item.cDptCde,
                    label: item.cDptCnm,
										cTeamType: item.cTeamType || '',
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
const getCDptCdeList = (data: any, data2) => {
    cDptCdeLoading.value = true;
    listChrDepts({cDptRelCde: data,cSignDptMrk: '1',cDptCls: '2'}).then(({data, code}) => {
        if (code === 200) {
            cDptCdeList.value = data.map((item) => ({
                value: item.cDptCde,
                label: item.cDptCnm,
                cTeamType: item.cTeamType || '',
            }));

          // 清空已选择的承保机构
          formData.cDptCde = "";
					formData.cDptCnm = "";
					if (data2) {
						selectedItem(data2)
					}
        }
        cDptCdeLoading.value = false;
    }).catch(err => console.error(err));
};

onMounted(() => {
  nextTick(() => {
      if(isZGS.value) {
          getDptCdeList();
      }else {
          getCDptCdeList(userStore.user.companyId);
      }
  });
});
//当前选中的机构item
function selectedItem(value) {
    const item = cDptCdeList.value.filter(f => f.value === value)[0];
    selectTreeItem.value = item;
    formData.cDptCnm = item?.label;
    formData.cDptCde = item?.value;
    formData.cTeamType = item?.cTeamType || '';
}

// 绑定方法
const method = {};

// 确定
function confirm() {
  dataFormRef.value.validate(async(isValid: boolean) => {
    if (isValid) {
      const param = formData.paymentMethod;
      const dptCde = formData.dptCde;
      const cDptCde = formData.cDptCde;
			const cDptCnm = formData.cDptCnm;
			const cTeamType = formData.cTeamType;
			// 点击下一步前校验，如果data为true则继续，否则阻断并提示
			if (formData.cRenewMrk === "1") {
        if(formData.cPlyNo?.length > 19) {
          ElMessage.error("历史数据的保单, 不允许续保");
          return;
				}
				if(Object.keys(renewalComponent.value).length === 0) {
          ElMessage.error("上年保单号请点击查询！");
          return;
        }
      	const data = formData.value;
				getECargoPolicyForRenewal({ cEcAgrNo: formData.cPlyNo, components: [renewalComponent.value] }).then(
					async (res1: any) => {
						if (res1.code == "200") {
							// 存一份申请单号，把res的单号清空
							let AgreementBase = JSON.parse(JSON.stringify(res1.res.composition.ECargoBase[0]))
							let res = JSON.parse(JSON.stringify(res1))
							clearCEcAgrAppNoValues(res)
							router.push({
								path: "/protocolManagement/enteringDtl",
								query: {
									param: JSON.stringify({
										...handleArray(AgreementBase),
										res, dptCde, cDptCde, cDptCnm, cTeamType,
										renewalComponent: renewalComponent.value
									}),
									type: 'orig',
									payWay: param
								},
							});
							closeDialog();
						} else {
							ElMessage.error(res1.msg);
						}
					}
				);
			} else {
				if (param) {
        	closeDialog();
        	emits("ok", { param,dptCde,cDptCde,cDptCnm,cTeamType });
      	}
			}
      
    }
  });
}

/** 关闭弹窗 */
function closeDialog() {
  dialogVisible.value = false;
  resetForm();
}

/**  重置表单 */
function resetForm() {
  dataFormRef.value.resetFields();
  dataFormRef.value.clearValidate();
  formData.paymentMethod = undefined;
}

// 续保查询
const renewalDialog = defineAsyncComponent(() => import("../../pcis/guide/renewalDialog.vue"));
const renewalComponent = ref({})
function renewalQuery() {
  if(!formData.cPlyNo) {
    ElMessage.warning("请输入上年保单号！")
    return;
  }
	getECargoPolicyComponent({ cPlyNo: formData.cPlyNo }).then((res: any) => {
    if(!!res.res && res.res.length > 0) {
      dzmodal
        .open(renewalDialog, { 
          type: "Issuer",
          cPlyNo: formData.cPlyNo,
          options: Object.keys(res.res[0]).map((item:any) => ({ label: res.res[0][item], value: item })),
          selected: Object.keys(res.res[0]).map((item:any) => item)
        })
        .then((res: any) => {
					if (res.type === 'ok') {
						renewalComponent.value = res.body.component
						// 续保根据单号获取付费方式
						getECargoPolicyPayment({ cPlyNo: formData.cPlyNo }).then((res1: any) => {
							if (res1 && res1.code == 200) {
								formData.paymentMethod = res1.data.paymentMethod
								formData.dptCde = res1.data.dptCde
								// formData.cDptCde = res1.data.cDptCde
								getCDptCdeList(res1.data.dptCde, res1.data.cDptCde)
              } else {
                ElMessage.error(res1.msg);
              }
						})
						.catch((err: any) => {
              ElMessage.error(err.msg);
            });
          }
        });
    } else {
      ElMessage.error(res.msg)
    }
  }).catch(err => {
    ElMessage.error(err.msg || err)
  })
}


// 下一步
const handleArray = (obj:any)=>{
  // 创建一个新的对象，并移除"Base."前缀
  let newObj = {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      // 通过字符串操作去掉前缀
      let newKey = key.replace('ECargoBase.', '');
      newObj[newKey] = obj[key];
    }
  }
  return newObj
}

/**
 * 清空所有对象中字段名包含 '.cEcAgrAppNo' 的值（设为空字符串）
 */
 function clearCEcAgrAppNoValues(data) {
  if (Array.isArray(data)) {
    data.forEach(item => {
      if (item && typeof item === 'object') {
        clearCEcAgrAppNoValues(item); // 递归处理数组中的对象
      }
    });
  } else if (data && typeof data === 'object') {
    for (const key in data) {
      if (key.endsWith('.cEcAgrAppNo')) {
        // 清空该字段的值（可选：设为 ""、null、undefined）
        delete data[key] // 或 null，根据业务需求
      } else if (typeof data[key] === 'object') {
        // 继续递归嵌套对象（虽然你数据是扁平的，但更健壮）
        clearCEcAgrAppNoValues(data[key]);
      }
    }
  }
}
</script>

<style scoped>

</style>
