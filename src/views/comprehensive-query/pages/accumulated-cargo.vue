<template>
  <div class="app-container">
    <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
    <app-table
      :tableConfig="tableconfig"
      v-model:pageresult="pageresult"
      ref="tableRef"
      @page-change="handleQuery(false)"
    >
      <template #column-cPlyNoInfo="{ row }">
        <div class="policy-info-cell">
          <div v-if="row.cPlyNo" class="policy-number-row">
            <span v-html="row.cPlyNo"></span>
            <el-icon class="copy-icon" @click="copyText(row.cPlyNo)">
                <DocumentCopy />
            </el-icon>
          </div>
        </div>
      </template>
      <template #column-cDptCnm="{ row, column, index }">
        <el-tooltip :content="row.cDptName" placement="top">
          <span v-html="row.cDptName || ''" class="twoLine"></span>
        </el-tooltip>
      </template>
      <template #column-cInsuredNme="{ row, column, index }">
        <el-tooltip :content="row.cInsuredNme" placement="top">
          <span v-html="row.cInsuredNme || ''" class="twoLine"></span>
        </el-tooltip>
      </template>
    </app-table>
  </div>
</template>

<script setup lang="ts">
import { defineComponent, ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { AccumulatedCargo } from '../service/accumulated-cargo';
import { getListByCode } from '@/api/code-list-service';
import { useUserStore } from "@/store/modules/user";

import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import { useValidator } from "@/typings/useValidator";
import { createFreeButtonBase } from "@/shared/button-config";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
const { getRules } = useValidator();

const freeEditRef = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<MyTableMethod | null>(null);
const userStore = useUserStore();
const user = ref<any>({});
user.value = userStore.user || {};
const accumulatedCargo = new AccumulatedCargo();
const title = ref(' ')
const tableTotal = ref(0)

const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    endBtnsPosition: "right",
    fromUi: {
      cols: 3
    },
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
          title.value = ' '
          freeEditRef.value?.resetFields()
        },
      }),
    ],
    fromSchema: [
      {
        prop: "nType",
        inputtype: "rtselect",
        title: "风险累计方式",
        typeCode: "",
        loadData: [  //先写死，没有接口 0船货 1船舶 2货运
          
          {
            label: '船舶险风险累计',
            value: 1
          },
          {
            label: '货运险风险累计',
            value: 2
					},
					{
            label: '船货风险累计',
            value: 0
          },
        ],
        params: {},
        clearable: true,
        rules: [getRules("required", {})],
      },
      {
        prop: "tSearchTm",
        inputtype: "rtdatepicker",
        title: "查询时间",
        type: "datetime",
        format: "YYYY-MM-DD HH:mm:ss",
        valueFormat: "YYYY-MM-DD HH:mm:ss",
        rules: [getRules("required", {})],
      },
      {
        prop: "cShipName",
        inputtype: "rtinput",
				title: "船名",
        rules: [getRules("required", {})],
        clearable: true,
      },
      {
        prop: "cTransportVoyage",
        inputtype: "rtinput",
        title: "航次",
        clearable: true,
      },
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
    showSelection: false,
    title: title,
    fromSchema: [
      {
        prop: "cPlyNo",
        inputtype: 'rtinput',
        title: "保单号",
        lengthNum: 21,
        lengthIsNumber: true,
        fixed: "left",
        slotName: "cPlyNoInfo"
      },
      {
        prop: "cDptName",
        inputtype: 'rtinput',
        title: "出单机构",
        slotName: "cDptCnm",
        align: 'left',
        lengthNum: 12,
      },
      {
        prop: "cInsuredNme",
        inputtype: 'rtinput',
        title: "被保险人",
        slotName: "cInsuredNme",
        align: 'left',
        lengthNum: 12,
      },
      {
        prop: "tDepartureTime",
        inputtype: 'rtinput',
        title: "起运日期",
        lengthNum: 17,
        lengthIsNumber: true,
      },
      {
        prop: "cShipName",
        inputtype: 'rtinput',
        title: "船名",
        align: 'left',
      },
      {
        prop: "cTransportVoyage",
        inputtype: 'rtinput',
        title: "航次",
      },
      {
        prop: "cDispatchDetail",
        inputtype: 'rtinput',
        title: "起运地",
        align: 'left',
      },
      {
        prop: "cDestinationDetail",
        inputtype: 'rtinput',
        title: "目的地",
        align: 'left',
      },
      {
        prop: "tInsrncBgnTm",
        inputtype: 'rtinput',
        title: "起保时间",
        lengthNum: 17,
        lengthIsNumber: true,
      },
      {
        prop: "tInsrncEndTm",
        inputtype: 'rtinput',
        title: "终保时间",
        lengthNum: 17,
        lengthIsNumber: true,
      },
      {
        prop: "nAmt",
        inputtype: 'rtinput',
        title: "保额/赔偿限额",
        lengthNum: 13,
        lengthIsNumber: true,
        align: "left",
        formatter:(val:any) => {
          return val.toLocaleString()
        }
      },
    ],
  })
);

const handleQuery = (flag = true) => {
  submitForm(flag)
}


//风险累计方式change
const handleChange = (value: string) => {
	console.log('handleChange', value);
	//0船货 1船舶 2货运
  if (value == '1') {
    title.value = `船舶险累积保额/赔偿限额 ${tableTotal.value}`
  } else if (value == '2') {
    title.value = `货运险累积保额 ${tableTotal.value}`
  } else if (value == '0') {
    title.value = `船货累积保额 ${tableTotal.value}`
  }
}

const submitForm = (flag) => {
  freeEditRef.value?.validate().then((isValid) => {
    if (isValid) {
      refreshData(flag);
    } else {
      console.log('error submit!!');
      return false;
    }
  });
};

const refreshData = (flag = true) => {
  const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  const params = Object.assign(s, r)
  tableTotal.value = 0
	accumulatedCargo.cumulativeRiskList(params).then((res: any) => {
    if (res.code === 200) {
      const pageData = res.data;
      if (pageData.result.length > 0) {
        pageresult.total= pageData.total;
				pageresult.list = pageData.result;
				if (s.nType == '1') {
					tableTotal.value = pageData.result[0].totalCBamt
				} else if (s.nType == '2') {
					tableTotal.value = pageData.result[0].totalHYamt
				} else if (s.nType == '0') {
					tableTotal.value = pageData.result[0].totalAmt
				}
			} else {
				pageresult.total= pageData.total;
				pageresult.list = pageData.result;
			}
			handleChange(s.nType)
		} else {
			ElMessage.error(res.msg || '查询失败');
		}
  });
};

// 添加 copyText 方法
const copyText = (text: any) => {
  if (!text) {
    ElMessage.warning('没有可复制的内容');
    return;
  }

  // 检查 navigator.clipboard 是否存在
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(
        () => {
          ElMessage.success('复制成功');
        },
        () => {
          ElMessage.error('复制失败');
        }
    );
  } else {
    // 使用 document.execCommand('copy') 方法作为备选方案
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      const result = document.execCommand('copy');
      if (result) {
        ElMessage.success('复制成功');
      } else {
        ElMessage.error('复制失败');
      }
    } catch (err) {
      ElMessage.error('复制失败，请稍后再试');
    } finally {
      document.body.removeChild(textarea); // 清理创建的 textarea 元素
    }
  }
};


onMounted(() => {});

</script>

<style scoped lang="scss">
  .app-container{
    padding: 6px 30px;
  }
  ::v-deep(.el-form){
    padding: 5px 30px;
  }
  .twoLine {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    word-break: break-all;
    overflow: hidden;
  }
</style>
