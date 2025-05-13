<!-- 工资总额信息 -->
<template>
     <el-dialog :close-on-click-modal="false"  v-model="dialogVisible"  @close="close" width="90%" title="工资总额信息">
        <app-grid-edit v-model:gridEditConfig="tableconfig" ref="tableRef" />
    
    </el-dialog>
    </template>
    
    <script setup lang="ts">
    import { useValidator } from "@/typings/useValidator";
    import { useDzModal } from "@/common/dzmodel/DzModalService";
    import { ref, defineProps, defineEmits, onMounted } from "vue";
    import { createFreeButtonBase } from "@/shared/button-config";
    import {
  AppGridEditConfig,
  AppGridEditMethod,
  createAppGridEditConfig,
  createGridFromUiConfig,
} from "@/shared/app-grid-edit-config";
    import {
        AppFreeEditConfig,
        AppFreeEditMethod,
        createAppFreeEditConfig,
    } from "@/shared/app-free-edit-config";
    import {
        creatCardConfig,
    } from "@/shared/mytemplate/card-config";
 
    
    import { PolicyService } from '@/views/pcis-main/service/my-page/policy.service';
    import { dataOpertaor } from "@/store/modules/data-opertaor";
    
    const opertaor = dataOpertaor();
    opertaor.init();
    
    const props = defineProps({
        data: Object,
        type: String,
    });
    const { getRules } = useValidator();
    const emits = defineEmits(["ok", "cancel"]);
    import { v4 as uuidv4 } from "uuid";
    import { conforms, forEach } from "lodash";
    const showBtnConfig = ref(false);
    const showView = ref(false);
    

    const tableRef = ref<AppGridEditMethod | null>(null);
    const appTableShow = ref(false);
    const policyService = new PolicyService();
    const dialogVisible = ref(true);
    
    
    const schemaMap = reactive<Record<string, any>>({
        rtinputgroup: [],
    });
    const cardConfig = reactive<CardConfig>(
        creatCardConfig({
            // title: '投保人-法人扩展信息',
            showMyfromBtm: true
        })
    )
    const  pageresult = reactive<Pageresult>({
        result: "",
        /** 数据列表 */
        list: [],
        /** 总数 */
        total: 0,
    });
    
    const close = (type) => {
 
        emits('ok', type)
    };
    
    const tableconfig = reactive<AppGridEditConfig>(
        createAppGridEditConfig({
            // title: '投保人-客户受益所有人',
            // editList:['CSeqNo','CCusLnme','CCusFnme','TCerftBgnTm','CCusAddr'],
        // showSelection: true,  // 是否显示多选框
               editFlag: true, //是否可以编辑
            // editList:['cOpgrpCnm','cName'],
            titleBtns: [
                createFreeButtonBase({
                    type: "primary",
                    label: "新增",
                    func: async () => {
                        tableRef.value?.addRowByData({ cGrpMrk: "0" });
    
    
                        let seleObj= [
                            {cOpgrpCnm:'张',cName:'草人'},
                            {cOpgrpCnm:'张2',cName:'草人'},
                            {cOpgrpCnm:'张3',cName:'草人'},
                        ]
                         
                        // seleObj.forEach((item,index)=>{
                        // 	tableRef.value?.addRowByData({
                        // 		cOpgrpCnm: item.cOpgrpCnm,
                        // 		// cName: freeEditRef.value?.getValue("cUndrClsCde"),
                        // 	// cStatus: "0",
                        // 	});	
                        // })
    
                        
                        // tableRef.value?.addRowByData(seleObj);
    
                        // tableRef.value?.setFormValue(seleObj)
                    },
                }),
                createFreeButtonBase({
                    type: "primary",
                    label: "删除",
                    func: async () => {
                        const selData = tableRef?.value?.getSelectRow();
                        if (!selData) {
                            ElMessage.error("请选择要删除的数据!");
                            return;
                        }
                        const editIndex = selData["_dataId"];
                        tableRef?.value?.delRow(editIndex);
    
                        
                    },
                })
            ],
            fromSchema: [
                // {
                // 	prop: "CSeqNo",
                // 	inputtype: "rtinput",
                // 	title: "序号",
                // 	disabled: true,
                // },
                {
                    prop: "cCusLnme",
                    inputtype: "rtinput",
                    title: "方案号",
                },
                {
                    prop: "cCusFnme",
                    inputtype: "rtinput",
                    title: "投保雇员人数",
                },
      
                {
                    prop: "cCerftCde",
                    inputtype: "rtinput",
                    title: "年工资总额（必填）元",
                    rules: [getRules("idCard", {})],
                },
               
             
            
                {
                    prop: "cCusAddr",
                    inputtype: "rtinput",
                    title: "岗位（非必填）",
                }
            ],
        })
    );
    onMounted(async () => {
    
    //     getTableFun();
  
    //     let CAppNo = opertaor.getDataAll()['applicant']['Applicant.cAppNo'];   // 投保单号
    
    //     policyService.getAMLExtendInfoByAppNo(CAppNo,'Applicant').then((response) => {
    //         let {code, data} = response
    //     if (code === 200) {
    //       if (response.data) {
          
    //       }
    //     } else {
    //       ElMessage.error('根据申请单号获取发票信息出现异常！');
    //     }
    //   }).catch(() => {
    //     ElMessage.error('根据申请单号获取发票信息出现异常！');
    //   });
    
    
    });
    
    
    // 收益所有人table信息
    const getTableFun = async ()=>{
        let CAppNo = opertaor.getDataAll()['applicant']['Applicant.cAppNo'];   // 投保单号
        policyService.getAMLCusBnfcInfoByAppNo(CAppNo,'Applicant').then((response) => {
            let {code , data} = response
        if (code === 200) {
          if (data) {
            tableRef.value?.setFormValue(data)
          }
        } else {
          ElMessage.error('根据申请单号获取发票信息出现异常！');
        }
      }).catch(() => {
        ElMessage.error('根据申请单号获取发票信息出现异常！');
      });
    }
    
    // 绑定方法
    const method = {
        func1: () => {
            console.log(getRules);
        },
        
    
    };

    

    
    defineExpose({ });
    </script>
    
    <style scoped></style>