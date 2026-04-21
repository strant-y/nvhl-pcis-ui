<!-- 配置 -->
<template>
	<div class="app-container">
		<app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
	</div>
</template>

<script setup lang="ts">
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();

import { ref } from "vue";
import {
	AppFreeEditConfig,
	AppFreeEditMethod,
	createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";
import { useRouter } from "vue-router";
const freeEditRef = ref<AppFreeEditMethod | null>(null);
import { createFreeButtonBase } from "@/shared/button-config";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import {
	AppTableConfig,
	AppTableMethod,
	createTableEditConfig,
} from "@/shared/app-table-config";
import { useDzModal } from "@/common/dzmodel/DzModalService";
import { PcisQueryService } from '../service/pcis-query-service';
const pcisQueryService = new PcisQueryService();
import { log } from "console";
const bankPayType = ref<any>(null)
const cPlyNo = ref<any>(null)
const CAppNo = ref<any>(null)
const CEdrNo = ref<any>(null)
const CCoinsurerCde = ref<any>(null)
const dzmodal = useDzModal();
const router = useRouter();
const tableRef = ref<AppTableMethod | null>(null);
const formconfig1 = reactive<AppFreeEditConfig>(
	createAppFreeEditConfig({
		title: "",
		endBtnsPosition: "right",
		endBtns: [
			createFreeButtonBase({
				type: "primary",
				label: "确认",
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
			createFreeButtonBase({
				type: "primary",
				label: "读取银行卡",
				func: async () => {
					console.log("读取银行卡")
				},
			}),
		],
		fromSchema: [
      {
				prop: "CAcctNo",
				inputtype: "rtinput",
				title: "收款人账号",
        rules: [getRules("required", {}),getRules('bankNum',{})],
			},
      {
				prop: "CAcctNme",
				inputtype: "rtinput",
				title: "收款人户名",
        rules: [getRules("maxLength", {len: 50})],
			},       
			{
				prop: "CBankRelTyp",
				inputtype: "rtcascader",
				title: "收款银行大类",
        typeCode: "SELECT_CBANKRELTYP",
        func: function (val) {
          console.log('收款银行大类', val)
        }
			},    
			{
				prop: "CBankLittle",
				inputtype: "rtcascader",
				title: "银行小类",
        typeCode: "",
			},
			{
				prop: "CBankCde",
				inputtype: "rtselect",
				title: "开户行",
        typeCode: "",
			},
			{
				prop: "CBankCnaps",
				inputtype: "rtinput",
				title: "CNAPS号",
        disabled: true
			},
			{
				prop: "CBankAddr",
				inputtype: "rtinput",
				title: "开户行地址"
			},
			{
				prop: "CPubPri",
				inputtype: "rtinput",
				title: "对公对私",
        loaddata:[
          {value: '1', label: '对公'}, {value: '2', label: '对私'}
        ]
			},
			{
				prop: "CPubPri",
				inputtype: "rtinput",
				title: "支付类型",
        loaddata:[
        {value: '1', label: '正常支付'}, {value: '2', label: '例外支付'}
        ]
			},
      // {
			// 	prop: "CEdrNo",
			// 	inputtype: "rtinput",
      //   type: 'hidden',
			// },  
      // {
			// 	prop: "CUpdCde",
			// 	inputtype: "rtinput",
      //   type: 'hidden',
			// },  
      // {
			// 	prop: "CAppNo",
			// 	inputtype: "rtinput",
      //   type: 'hidden',
			// },  	
		],
	})
);

onMounted(async () => {});

/** 查询 */
function handleQuery(flag?: boolean) {
  freeEditRef.value?.validate().then((isValid) => {
    if (!isValid) {
      return false;
    } else {
      const s = freeEditRef.value?.getFromValue(); //获取表单数据
      const param = Object.assign(s, {
        bankPayType: bankPayType,
        CPlyNo: cPlyNo,
        CAppNo: CAppNo,
        CEdrNo: CEdrNo,
        CCoinsurerCde: CCoinsurerCde
      });
      pcisQueryService.accountExDispose(param)
        .then((res) => {
          const { code, data, msg } = res;
          if (200 === code) {
            ElMessage.success('处理成功');
            router.push({ path: '/payinfo/editAccountExDispose', query: { data: {} } });            
          } else {
            ElMessage.error(msg);
          }
        })
        .finally(() => { });
    }});
}

</script>

<style scoped></style>
