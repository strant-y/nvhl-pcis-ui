<!-- 待核保任务 暂存任务 已上报任务 核保退回任务 核保通过任务 -->
<template>
  <div class="app-container">
    <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
    <app-table
            :tableConfig="tableconfig"
            v-model:pageresult="pageresult"
            ref="tableRef"
            @selection-change="handleSelectionChange"
            @page-change="handleQuery(false)"
    >

        <template #column-nPrm="{ row, column, index }">
          <span >¥ {{ row.nPrm }}</span>
        </template>
    </app-table>
  </div>
</template>

<script setup lang="ts">
    import { useUserStore } from "@/store";
    import { useValidator } from "@/typings/useValidator";
    import { useRoute, useRouter, RouteRecordRaw } from "vue-router";
    import { cloneDeep } from "lodash-es";
    import {
        SCENE_EDR_APP_MODIFY_UNSUBMIT,
        SCENE_PLAN_READ,
        SCENE_PLY_APP_MODIFY_UNSUBMIT,
        SCENE_PLY_APP_READ,
        SCENE_PLY_APP_READBEARER,
        SCENE_TEMPORARY_DEPOSITBEARER,
        SCENE_PLAN_UW_PROCESS,
        SCENE_PLY_UW_PROCESS,
        SCENE_PLY_UW_PROCESSBEARER,
    } from "@/constants/tab-constants";
    import { AppKey } from "@/constants/api";
    const { getRules } = useValidator();
    const router = useRouter();
    const route = useRoute();
    import { ref, watch } from "vue";
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
    import { now } from "lodash";
    import { getListByCode } from "@/api/code-list-service";
    import { PcisQueryService } from "@/views/payinfoManagement/service/pcis-query-service";
    import { NewUdrListService } from "@/views/pcis-new-udr-list/service/new-udr-list.service";
    import { PolicyService } from "@/views/pcis-main/service/my-page/policy.service";
    import { codeListViewStore } from "@/store";

    const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
    const codeListStore = codeListViewStore(idxParam.cdeListViewProps);
    const pcisQueryService = new PcisQueryService();
    const policyService = new PolicyService();
    const {
        getBaseInfoByAppNo,
        getBackUdrList,
        getNewUdrList,
        removeReceived,
        checkEdrPocly,
        hasReceived,
    } = NewUdrListService();
    import moment from "moment";
    import { Row } from "element-plus/es/components/table-v2/src/components";
    import { submitUnderwriting } from "../../../api/query/index";
    import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";
    // import { saveAs } from 'file-saver';
    const userStore = useUserStore();
    const user = ref(userStore.user) || ref({ companyId: "", opCde: "" });
    const roles = ref(userStore.user.roles);
    const clsCde = ref(""); // 核保机构
    const dzmodal = useDzModal();
    const kindEdit = defineAsyncComponent(() => import("./kindEdit.vue"));
    const tableRef = ref<AppTableMethod | null>(null);
    const removeIds = ref([]); // 删除用户ID集合 用于批量删除
    const departmentTree = defineAsyncComponent(
        () => import("@/pcis/prodRef/commodityRef/DepartmentTree.vue")
    );
    // 任务痕迹列表 弹框页面
    const TaskListVestige = defineAsyncComponent(
        () => import("../common/TaskListVestige.vue")
    );
    // 费用信息 弹框页面
    const CostInformation = defineAsyncComponent(
        () => import("./CostInformation.vue")
    );
    // 历次批单 弹框页面
    const PreviousdrOpnList = defineAsyncComponent(
        () => import("../common/PreviousdrOpnList.vue")
    );

    const udrTypeValue = ref<string>(); // 单据状态 值
    const undrClsListOptions = ref<Array<any>>([]); // 核保级别 下拉数据
    const selectData = ref([]); // 删除用户ID集合 用于批量删除

    let cTermNoList = ref<any>([]);  // 条款数据
    let cTermNo = '';    // 条款编码
    const cPard = ref(null);

    function extractCode(str:string) {
      // 匹配 "P+数字" 或 "纯数字"
      const pattern = /^(P\d+|\d+)/;
      return str.match(pattern)?.[0] || "";
    }
    
    // 默认核保机构
    let loadOrgCde = ref([
      {
        label: user.value.companyCnm,
        value: user.value.companyId,
      },
    ]);
    watch(() => freeEditRef.value?.getValue("tm1"), (newVal,old) => {
      
    },{
         deep: true
    });
    // 根据切换下拉数据显示/隐藏对应表单
    const allForm = ref<Array<any>>([
        {
            prop: "udrType",
            inputtype: "rtSelectV2",
            title: "单据状态",
            showKey: [1, 2, 3, 4, 5],
            minWidth: 180,
            loadData: [
                { label: "待核保任务", value: "1" },
                { label: "暂存任务", value: "2" },
                { label: "已上报任务", value: "3" },
                { label: "核保退回任务", value: "4" },
                { label: "核保通过任务", value: "5" },
            ],
            func: (val: any) => {
                //这部分抽出来方法了，方便首页跳转的时候调用
                changeForm(val);
            },
        },
        {
            prop: "orgCde",
            inputtype: "rtSelectV2",
            title: "核保机构",
            rules: [getRules("required", {})],
            showKey: [1, 2, 5],
            btnWidth: 10,
            // itemWidth: 2,
            showExBtn: true,
            btnItems: {
                icon: "Search",
                type: "primary",
                func: () => {
                    dzmodal
                        .open(departmentTree, { type: "Issuer", data: {} })
                        .then((res) => {
                            if (res.type === "ok") {
                                if (res.body) {
                                    freeEditRef.value?.setValue("orgCde", res.body.id);
                                    loadOrgCde.value = [
                                            {
                                                label: res.body.name,
                                                value: res.body.id,
                                            },
                                        ]
                                    setFormItem("orgCde", {
                                        loadData: [
                                            {
                                                label: res.body.name,
                                                value: res.body.id,
                                            },
                                        ],
                                    });
                                }
                            }
                        });
                },
            },
        },
        {
            prop: "inNextDpt",
            inputtype: "rtcheckbox",
            title: "包含下级机构",
            showKey: [1, 2],
            defaultValue: 1,
            keymap: {
                y: "1",
                n: "0",
            },
        },
        {
            prop: "CLoadSub",
            inputtype: "rtcheckbox",
            title: "包含下级机构",
            showKey: [5],
            defaultValue: 1,
            keymap: {
                y: 1,
                n: 0,
            },
        },
        {
            prop: "objId",
            inputtype: "rtinput",
            title: "申请单号",
            showKey: [1, 2, 3, 4, 5],
            clearable: true,
        },
        {
            prop: "cPlyNo",
            inputtype: "rtinput",
            title: "保单号",
            showKey: [1, 2, 3, 4, 5],
            clearable: true,
        },
        {
            prop: "bsType",
            inputtype: "rtcheckboxgroup",
            title: "申请单类型",
            showKey: [1],
            minWidth: 180,
            loadData: [
                { label: "投保单", value: "A" },
                { label: "批改申请单", value: "E" },
            ],
        },
        {
            prop: "bsType",
            inputtype: "rtSelectV2",
            title: "申请单类型",
            showKey: [2, 4, 5],
            minWidth: 180,
            loadData: [
                { label: "投保单", value: "A" },
                { label: "批改申请单", value: "E" },
                { label: "方案", value: "P" },
            ],
        },
        // {
        //   prop: "cAppTyp",
        //   inputtype: "rtSelectV2",
        //   title: "申请单类型",
        //   showKey: [5],
        //   minWidth: 180,
        //   loadData: [
        //     { label: "投保", value: "A" },
        //     { label: "批改", value: "E" },
        //     { label: "方案", value: "P" },
        //   ],
        // },
        {
              prop: "CProdCatCde",
              inputtype: "rtselect",
              title: "产品大类",
              typeCode: "KIND_LIST_GRT",
              showKey: [1, 2, 3, 4, 5],
              child: "prodNo",
              filterable: true,
              clearable: true,
              codeParam: {
                  cOperId: JSON.parse(sessionStorage.getItem("user")).opCde,
                  cDptCde: JSON.parse(sessionStorage.getItem("user")).companyId,
              },
              func: (val) => {
                  setValue("prodNo","")   // 清空条款
                  setValue("undrClsCde","") // 清空核保级别
                  cTermNo = "";      // 重置条款编码
                  cPard.value = val;
                  codeListStore
                    .queryCodeList({
                        codeListName: "TERM_LIST_IN_GUIDE_SEARCH",
                        codeListParam:{
                        cParCde: cPard.value,
                        cOperId: JSON.parse(sessionStorage.getItem("user")).opCde,
                        cDptCde: JSON.parse(sessionStorage.getItem("user")).companyId,
                    },
                    })
                    .then((res) => {
                        cTermNoList.value = res;
                        setFormItem("prodNo", {
                            loadData: res,
                        });
                    });
              },
        },
        {
              prop: "prodNo",
              inputtype: "rtselect",
              title: "条款",
              showKey: [1, 2, 3, 4, 5],
              filterable: true,
              clearable: true,
              func: (val:any) => {
                if(val){
                        if(cTermNoList.value.length>0){
                            cTermNoList.value.forEach((ele) => {
                                if(ele['value']  === val){
                                    cTermNo = extractCode(ele['label'])
                                }
                            });
                        }  
                } else {
                    cTermNo = "";
                }
              },
        },
        {
            prop: "undrClsCde",
            inputtype: "rtSelectV2",
            title: "核保级别",
            showKey: [1, 2],
            // typeCode: "WEB_UNDR_CLS",
            typeCode: "undrClsList",
            codeParam: { cDptCde: user.value.companyId, cEmpCde: user.value.opCde},
            clearable: true,
        },
        {
            prop: "CAppNme",
            inputtype: "rtinput",
            title: "投保人名称",
            showKey: [5],
            clearable: true,
        },
        {
            prop: "CPlyNo",
            inputtype: "rtinput",
            title: "保单号",
            showKey: [5],
            clearable: true,
        },
        {
            prop: "appCde",
            inputtype: "rtinput",
            title: "投被保人姓名",
            showKey: [1, 2, 3, 4],
            clearable: true,
            placeholder: "请输入",
        },
        {
            prop: "tm1",
            inputtype: "rtdatepicker",
            title: "投保日期",
            rules: [],
            itemWidth: 1,
            showKey: [1, 2, 3, 4, 5],
            clearable: true,
            type: "datetimerange",
            format: "YYYY-MM-DD HH:mm:ss",
            valueFormat: "YYYY-MM-DD HH:mm:ss",
            
        },
        {
            prop: "tm2",
            inputtype: "rtdatepicker",
            title: "申请核保时间",
            rules: [],
            itemWidth: 1,
            showKey: [1, 2],
            clearable: true,
            type: "datetimerange",
            format: "YYYY-MM-DD HH:mm:ss",
            valueFormat: "YYYY-MM-DD HH:mm:ss",
        },
    ]);
    // 默认表单数据
    const formObj = {
        notWaitObj: {
            title: "核保任务查询",
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
                        // 循环重置每一项表单数据
                        resetForm();
                    },
                }),
                createFreeButtonBase({
                    label: "批量退回",
                    func: () => {
                        if (selectData.value.length < 1) {
                            ElMessage.warning("所选记录为空！");
                            return;
                        }

                        if (selectData.value.length > 5) {
                            ElMessage.warning("所选数据最多为5条！");
                            return;
                        }
                        let obj = {};
                        Object.keys(selectData.value).forEach((k) => {
                            obj[selectData.value[k]["objId"]] = selectData.value[k]["curtTask"];
                        });
                        console.log(obj);
                        const res = {};
                        res["user"] = JSON.parse(sessionStorage.getItem("user"));
                        res["user"]["opRelCde"] = "10030892";
                        res["appNoAndTaskIdMap"] = obj;
                        res["cUndrMrk"] = "BB";
                        res["undrMrk"] = "BB";
                        res["cAntiLnderRisk"] = "0"; //关联交易确认
                        res["cIsTransaction"] = "0"; //反洗钱风险
                        res["CRiBesprakMrk"] = "0"; // 预约分保标志
                        res["backUndrDptCde"] = null; // 退回指定核保级别机构编码
                        res["backUndrClsCde"] = null; // 退回指定核保级别编码
                        res["backUndrDptCnm"] = null; // 退回指定核保人员名称
                        console.log(res);
                        let submitUnder;
                        submitUnder = submitUnderwriting(res);
                        submitUnder.then((res) => {
                            console.log("submitUnderwriting-res", res);
                            if (res["code"] == "200") {
                                ElMessage.success(res.msg);
                                handleQuery();
                            } else {
                                ElMessage.error(res.msg);
                            }
                        });
                    },
                }),
                createFreeButtonBase({
                    label: "导出",
                    func: () => {
                        // 只有5有
                        freeEditRef.value?.validate().then((isValid: boolean) => {
                            if (isValid) {
                                exportDown();
                            } else {
                                ElMessage.error("请填写必填项");
                            }
                        });
                    },
                }),
                // createFreeButtonBase({
                //   label: "费用信息按钮",
                //   func: () => {
                //     dzmodal
                //       .open(CostInformation, { type: "Issuer", data: {} })
                //       .then((res: any) => {
                //         if (res.type === "ok") {
                //         }
                //       });
                //   },
                // }),
                // createFreeButtonBase({
                //   label: "历次批单按钮",
                //   func: () => {
                //     dzmodal
                //       .open(PreviousdrOpnList, { type: "Issuer", data: {} })
                //       .then((res: any) => {
                //         if (res.type === "ok") {
                //         }
                //       });
                //   },
                // }),
            ],
            fromSchema: ref<any>([]),
            // fromSchema: [...allForm.value],
        },
    };

    let formconfig1 = reactive<AppFreeEditConfig>(
        createAppFreeEditConfig(formObj.notWaitObj)
    );

    const pageresult = reactive<Pageresult>({
        result: "",
        /** 数据列表 */
        list: [],
        /** 总数 */
        total: 0,
    });

    // 默认表格数据
    const tableObj = {
        notWaitObj: {
            editFlag: true,
            editList: ["cStatus"],
            showSelection: true,
            tableBtnType: "btn",
            tableBtnWidth: 150,
            fixed:true,
            tableBtnPosition: ref<any>(""),
            tableBtnFixed: "right",
            tableBtn: ref<any>([]),
            fromSchema: ref<any>([]),
            rowDbClickFun: (row:any) => {
                handleDblClick(row);
            }
        },
    };
    // 根据切换下拉数据显示/隐藏对应列
    const allTable = ref<Array<any>>([
        {
            prop: "objId",
            inputtype: "rtinput",
            title: "申请单号",
            showKey: [1, 2, 3, 4],
            maxWidth: 200,
            fixed: 'left',
            showCopyIcon: true
        },
        {
            prop: "uwDptName",
            inputtype: "rtinput",
            title: "承保机构",
            showKey: [1, 2, 3, 4],
            maxWidth: 180,
        },
        {
          prop: "udrClsCde",
          inputtype: "rtinput",
          title: "当前核保级别",
          showKey: [1, 2],
          maxWidth: 200,
        },
        {
          prop: "cMinUndrCls",
          inputtype: "rtinput",
          title: "最终审核级别",
          showKey: [1, 2],
          maxWidth: 200,
        },
        {
            prop: "bsType",
            inputtype: "rtSelectV2",
            title: "业务类型",
            showKey: [1, 2],
            maxWidth: 100,
            loadData: [
                { label: "承保", value: "A" },
                { label: "批改", value: "E" },
                { label: "方案", value: "P" },
            ],
        },
        {
          prop: "cCiMrk",
          inputtype: "rtSelectV2",
          title: "共保方式",
          showKey: [1, 2],
          minWidth: 80,
          loadData: [
            { label: "非共保业务", value: "0" },
            { label: "外部共保我方主共_主联", value: "1" },
            { label: "外部共保我方从共_主联", value: "2" },
            { label: "外部共保我方主共_无联保", value: "3" },
            { label: "外部共保我方从共_无联保", value: "4" },
            { label: "司内联保_主联", value: "5" },
          ],
        },
        {
            prop: "prodName",
            inputtype: "rtinput",
            title: "产品名称",
            showKey: [1, 2, 3, 4],
            minWidth: 80,
        },
        {
          prop: "timeDiffHMS",
          inputtype: "rtinput",
          title: "等待时长",
          showKey: [1, 2, 3, 4],
          maxWidth: 180,
        },
        {
            prop: "nPrm",
            inputtype: "rtinput",
            title: "保费",
            showKey: [1, 2, 3, 4],
            minWidth: 120,
            slotName: "nPrm"
        },
        {
            prop: "appCde",
            inputtype: "rtinput",
            title: "投保人名称",
            showKey: [1, 2, 3, 4],
            minWidth: 180,
        },
        {
            prop: "bsTm1",
            inputtype: "rtdatepicker",
            title: "投保日期",
            showKey: [1, 2, 3, 4],
            minWidth: 180,
            type: "datetimerange", // 显示日期和时间选择器
            format: "YYYY-MM-DD HH:mm:ss", // 显示在界面上的格式
            valueFormat: "YYYY-MM-DD HH:mm:ss" // 传递给后端的值格式
        },
        {
            prop: "preUserName",
            inputtype: "rtinput",
            title: "任务提交人",
            showKey: [1, 2, 3, 4],
            minWidth: 150,
        },
        {
            prop: "preDptName",
            inputtype: "rtinput",
            title: "任务提交部门",
            showKey: [1, 3, 4],
            minWidth: 180,
        },
        {
            prop: "crtTm",
            inputtype: "rtdatepicker",
            title: "提交时间",
            showKey: [1, 2, 3, 4],
            minWidth: 180,
            type: "datetimerange", // 显示日期和时间选择器
            format: "YYYY-MM-DD HH:mm:ss", // 显示在界面上的格式
            valueFormat: "YYYY-MM-DD HH:mm:ss" // 传递给后端的值格式
        },
        {
            prop: "curtUserName",
            inputtype: "rtinput",
            title: "任务接收人",
            showKey: [3, 4],
            minWidth: 180,
        },
        {
            prop: "state",
            inputtype: "rtselect",
            title: "任务状态",
            showKey: [1, 2, 3, 4],
            minWidth: 120,
            loadData: [
                { label: "未接收", value: "0" },
                { label: "已接收", value: "1" },
                { label: "暂存", value: "2" },
                { label: "已完成", value: "3" },
                { label: "已撤回", value: "4" },
                { label: "已解除接收", value: "5" },
                { label: "已退回", value: "6" },
                { label: "已申请改派", value: "7" },
                { label: "已改派", value: "8" },
                { label: "已委托", value: "9" },
                { label: "已重做", value: "10" },
                { label: "已上报", value: "11" },
            ],
        },
        {
            prop: "newUndrCls",
            inputtype: "rtinput",
            title: "任务最新状态",
            showKey: [3],
            minWidth: 180,
        },
    ]);
    // 下拉 核保通过任务
    const table5 = ref<any>([
        {
            prop: "cAppNo",
            inputtype: "rtinput",
            title: "申请单号",
            minWidth: 180,
            fixed: "left",
        },
        {
            prop: "cPlyNo",
            inputtype: "rtinput",
            title: "保单号",
            minWidth: 180,
        },
        // {
        //   prop: "cAppTyp",
        //   inputtype: "rtSelectV2",
        //   title: "申请单类型",
        //   minWidth: 180,
        //   loadData: [
        //     { label: "投保",value: "A" },
        //     { label: "批改",value: "E" },
        //     { label: "方案",value: "P" },
        //   ],
        // },
        {
            prop: "cDptCnm",
            inputtype: "rtinput",
            title: "机构",
            minWidth: 180,
        },
        {
            prop: "cProdNmeCn",
            inputtype: "rtinput",
            title: "产品",
            minWidth: 180,
        },
        {
            prop: "nPrm",
            inputtype: "rtnumber",
            title: "保费",
            minWidth: 180,
        },
        {
            prop: "cAppNme",
            inputtype: "rtinput",
            title: "投保人名称",
            minWidth: 180,
        },
        {
            prop: "cAppStatus",
            inputtype: "rtselect",
            title: "状态",
            minWidth: 180,
            loadData: [
                { label: "暂存", value: '1' },
                { label: "已提核", value: '2' },
                { label: "核保退回", value: '3' },
                { label: "已核保", value: '4' },
                { label: "已签发保单", value: '5' },
                { label: "见费出单退回", value: '8' },
            ]
        },
    ]);
    // 根据下拉切换显示表格操作列 通用控制
    const tableBtn = ref<Array<any>>([
        createFreeButtonBase({
            id: "score",
            link: true,
            tooltip: "接收",
            showKey: [1],
            type: "info",
            size: "large",
            iconSize:"25",
            icon: "Message",
            tableClick: (row) => {
                //待核保任务 接收
                handle_hasReceived(row);
            },
        }),
        createFreeButtonBase({
            id: "score",
            link: true,
            tooltip: "修改",
            showKey: [2],
            type: "success",
            size: "large",
            iconSize:"25",
            icon: "Edit",
            tableClick: (row) => {
                if (udrTypeValue.value == "2") updateUdr(row);
            },
        }),
        createFreeButtonBase({
            id: "score",
            link: true,
            tooltip: "取消接收",
            showKey: [2],
            type: "info",
            size: "large",
            iconSize:"25",
            icon: "Release",
            tableClick: (row) => {
                handleWorkFlow(row, "removeReceived");
            },
        }),
        createFreeButtonBase({
            id: "score",
            link: true,
            tooltip: "撤回",
            showKey: [3],
            type: "danger",
            size: "large",
            icon: "RefreshLeft",
            iconSize:"23",
            tableClick: (row) => {
                // showDetails(row)
                const res = {};
                res["cUndrMrk"] = "W";
                res["undrMrk"] = "W";
                res["user"] = JSON.parse(sessionStorage.getItem("user"));
                res["user"]["opRelCde"] = "10030892";
                res["appNo"] = row.objId;
                res["taskId"] = row.curtTask;
                res["appTyp"] = row.bsType;
                res["cAntiLnderRisk"] = "0"; //关联交易确认
                res["cIsTransaction"] = "0"; //反洗钱风险
                res["CRiBesprakMrk"] = "0"; // 预约分保标志
                res["backUndrDptCde"] = row.dptCde; // 退回指定核保级别机构编码
                res["backUndrClsCde"] = row.level; // 退回指定核保级别编码
                res["backUndrDptCnm"] = JSON.parse(sessionStorage.getItem("user"))[
                    "userName"
                    ]; // 退回指定核保人员名称
                console.log(res);
                let submitUnder;
                submitUnder = submitUnderwriting(res);
                submitUnder.then((res) => {
                    console.log("submitUnderwriting-res", res);
                    if (res["code"] == "200") {
                        ElMessage.success(res.msg);
                        handleQuery();
                    } else {
                        ElMessage.error(res.msg);
                    }
                });
            },
        }),
        createFreeButtonBase({
            id: "score",
            link: true,
            tooltip: "查看",
            showKey: [3,4],
            type: "primary",
            size: "default",
            iconSize:"25",
            icon: "View",
            tableClick: (row) => {
                showDetails(row);
            },
        }),
        createFreeButtonBase({
            id: "score",
            link: true,
            tooltip: "承保流程",
            showKey: [3,4],
            type: "danger",
            size: "default",
            icon: "Refresh",
            iconSize:"25",
            tableClick: (row) => {
                let data;
                if (udrTypeValue.value == "3"||udrTypeValue.value == "4") {
                    data = { objId: row.objId, sysType: row.objExt };
                } else {
                    data = {
                        objId: row.cAppNo,
                        sysType:
                            !!row["bsType"] && ("A" === row["bsType"] || "P" === row["bsType"])
                                ? "U"
                                : "E",
                    };
                }
                dzmodal.open(TaskListVestige, { type: "Issuer", data }).then((res) => {
                    if (res.type === "ok") {
                        refreshData(true);
                    }
                });
            },
        }),
        // createFreeButtonBase({
        //   id: "score",
        //   link: true,
        //   tooltip: "编辑",
        //   hideBtns:(row: any) => {
        //     if(row.cAppStatus!=1 && row.cAppStatus!=3 && row.cAppStatus!=8) return false;
        //   },
        //   showKey:[5],
        //   type: "success",
        //   size: "large",
        //   icon: "Edit",
        //   tableClick: (row) => {
        //     handleEdit(row);
        //   },
        // }),
        // createFreeButtonBase({
        //   id: "score",
        //   link: true,
        //   tooltip: "删除",
        //   showKey:[5],
        //   type: "danger",
        //   size: "large",
        //   icon: "Delete",
        //   tableClick: (row) => {
        //     handleDelete(row.cAppNo);
        //   },
        // }),
    ]);

    // 核保通过任务 table操作控制
    const tableBtn5 = ref<Array<any>>([
        createFreeButtonBase({
            id: "score",
            link: true,
            tooltip: "查看",
            hideBtns: (row: any) => {
                if (row.cAppStatus == 1 || row.cAppStatus == 3 || row.cAppStatus == 8)
                    return false;
            },
            type: "danger",
            size: "large",
            icon: "View",
            iconSize:"25",
            tableClick: (row) => {
                showDetails(row);
            },
        }),
        createFreeButtonBase({
            id: "score",
            link: true,
            tooltip: "承保流程",
            iconSize:"25",
            hideBtns: (row: any) => {
                if (row.cAppStatus == 1 || row.cAppStatus == 3 || row.cAppStatus == 8)
                    return false;
            },
            type: "danger",
            size: "large",
            icon: "Refresh",
            tableClick: (row) => {
                let data;
                if (udrTypeValue.value == "3") {
                    data = { objId: row.objId, sysType: row.objExt };
                } else {
                    data = {
                        objId: row.cAppNo,
                        sysType:
                            !!row["bsType"] && ("A" === row["bsType"] || "P" === row["bsType"])
                                ? "U"
                                : "E",
                    };
                }
                dzmodal.open(TaskListVestige, { type: "Issuer", data }).then((res) => {
                    if (res.type === "ok") {
                        refreshData(true);
                    }
                });
            },
        }),
        // createFreeButtonBase({
        //   id: "score",
        //   link: true,
        //   tooltip: "编辑",
        //   hideBtns: (row: any) => {
        //       if (row.cAppStatus != 1 && row.cAppStatus != 3 && row.cAppStatus != 8) return false;
        //   },
        //   type: "success",
        //   size: "large",
        //   icon: "Edit",
        //   tableClick: (row) => {
        //       handleEdit(row);
        //       // 是跳转页面  or 弹框？
        //       // dzmodal.open(kindEdit, { type: "edit", data: row }).then((res) => {
        //       //   if (res.type === "ok") {
        //       //     handleQuery();
        //       //   }
        //       // });
        //   },
        // }),
        // createFreeButtonBase({
        //   id: "score",
        //   link: true,
        //   tooltip: "删除",
        //   hideBtns: (row: any) => {
        //       if (row.cAppStatus != 1 && row.cAppStatus != 3 && row.cAppStatus != 8) return false;
        //   },
        //   type: "danger",
        //   size: "large",
        //   icon: "Delete",
        //   tableClick: (row) => {
        //       handleDelete(row.cAppNo);
        //   },
        // }),
    ]);

    let tableconfig = reactive<AppTableConfig>(
        createTableEditConfig(tableObj.notWaitObj)
    );

    //切换产品大类 获取对应 核保级别 下拉数据
    const loadUndrClsListOptions = async (cProdNo: string) => {
        const response = await getListByCode("undrClsList", {
            cDptCde: user.value.companyId,
            cEmpCde: user.value.opCde,
            cProdNo,
        });
        console.log("response", response);
        // undrClsListOptions.value = response.map(item => ({ value: item.value, label: item.label }));
        // if(response.data.length>0) {
        //   response.data.map((item: any) => {value: item.value, label: item.label});
        // }

        // getListByCode('undrClsList',{
        //   cDptCde: user.value.companyId, cEmpCde: user.value.opCde, cProdNo
        // }).then((res) => {
        //   const {msg,data,code} = res;
        //   data.map((item: any) => {value: item.value, label: item.label

        //   })
        //   // undrClsListOptions.value = data.map(item => ({ value: item.value, label: item.label }));
        // })
    };

    const changeForm = (val: any) => {
            console.log(val);
        // freeEditRef.value?.resetFields();
        // resetForm();
        freeEditRef.value?.setFormValue({
            udrType: val,
        });
        nextTick(() => {
            formObj.notWaitObj.fromSchema.value = [];
            if (val == "1" || val == "2") {
                formObj.notWaitObj.endBtns.forEach((key) => {
                    if (key.label == "批量退回") {
                        key.hidden = false;
                    }
                });
            } else {
                formObj.notWaitObj.endBtns.forEach((key) => {
                    if (key.label == "批量退回") {
                        key.hidden = true;
                    }
                });
            }
            allForm.value.map((item: any, index: number) => {
                const isVal = item.showKey.findIndex((vals: any) => vals == val);
            
                if (isVal !== -1) {
                    if (item.prop == "tm1") {
                        item.rules =
                            val == 3 || val == 4 || val == 5 ? [getRules("required", {})] : [];
                    }
                    if (item.prop == "tm2") {
                        item.rules = val == 1 || val == 2 ? [getRules("required", {})] : [];
                    }
                    formObj.notWaitObj.fromSchema.value.push(item);
                }
            });



            // setFormItem("orgCde", {
            //     loadData: [
            //         {
            //             label: "永安保险总公司",
            //             value: "0200000000000",
            //         },
            //     ],
            // });

            // // 确保 loadData 设置完成后再设置表单值
            // freeEditRef.value?.setValue(
            //     'orgCde', "0200000000000",
            // );


        });
    };

    watch(
        () => freeEditRef.value?.getValue("udrType"),
        (n, o) => {
            udrTypeValue.value = n;
       
            // 切换表格 数据列 显示/隐藏
            tableObj.notWaitObj.fromSchema.value = [];
            allTable.value.map((item: any, index: number) => {
                const isVal = item.showKey.findIndex((vals: any) => vals == n);
                if (isVal !== -1) tableObj.notWaitObj.fromSchema.value.push(item);
            });
            if (n == "5") {
                tableObj.notWaitObj.fromSchema.value = table5.value;
            }
            // 切换表格 操作列 显示/隐藏
            tableObj.notWaitObj.tableBtn.value = [];
            tableObj.notWaitObj.tableBtnPosition.value = "right";
            // if (n !== "4") {
            //     tableObj.notWaitObj.tableBtnPosition.value = "right";
            // }
            if (n !== "5") {
                tableBtn.value.map((item: any, index: number) => {
                    const isVal = item.showKey.findIndex((vals: any) => vals == n);
                    if (isVal !== -1) tableObj.notWaitObj.tableBtn.value.push(item);
                });
            } else {
                // 全部显示，根据每行数据显示/隐藏对应按钮
                tableBtn5.value.map((item: any, index: number) => {
                    tableObj.notWaitObj.tableBtn.value.push(item);
                });
            }
            setTimeout(() => {
                 resetForm();
                
            }, 0);
        },
        { deep: true }
    );

    function loadClsCde() {
        getListByCode("GET_CEMPCDE_UNDR_CLS", { cEmpCde: user.value.opCde })
            .then((res) => {
                if (res && res.data) {
                    clsCde.value = res.data[0].value;
                }
            })
            .catch((err) => {
                console.log("出错了", err);
                ElMessage.error("后台服务异常,请联系管理员");
            });
    }

    const resetForm = () => {
        const arr = freeEditRef.value?.getFromValue();
        Object.keys(arr).forEach((key: any) => {
            if (key !== "udrType") {
                freeEditRef.value?.setValue(key, "");
                delete arr[key];
            }
        });
        // 表单查询默认项
        nextTick(() => {
            if (
                udrTypeValue.value == "1" ||
                udrTypeValue.value == "2" ||
                udrTypeValue.value == "3" ||
                udrTypeValue.value == "4" ||
                udrTypeValue.value == "5"
            ) {  
                  console.log( udrTypeValue.value)
                if (udrTypeValue.value == "1" || udrTypeValue.value == "2") {
                    freeEditRef.value?.setValue("inNextDpt", "1");
                     setFormItem("orgCde", {
                        loadData:  loadOrgCde.value
                    });
                    freeEditRef.value?.setValue(
                        'orgCde',  loadOrgCde.value[0]['value'],
                    );
                    freeEditRef.value?.setValue("tm2", [
                        moment(new Date(Date.now() - 30 * 1000 * 60 * 60 * 24)).format(
                            "YYYY-MM-DD 00:00:00"
                        ),
                        moment(new Date()).format("YYYY-MM-DD 23:59:59"),
                    ]);

                       freeEditRef.value?.setValue("tm1", [
                        moment(new Date(Date.now() - 30 * 1000 * 60 * 60 * 24)).format(
                            "YYYY-MM-DD 00:00:00"
                        ),
                         moment().endOf('day').format('YYYY-MM-DD HH:mm:ss')
                        // moment(new Date()).format("YYYY-MM-DD 23:59:59"),
                        // moment(new Date()).endOf('day').toDate()
                        // .format("HH:mm:ss"),
                        // .format("YYYY-MM-DD 23:59:58"),
                    ]);
                }
                
                 if (udrTypeValue.value == "3") {
                    freeEditRef.value?.setValue("CLoadSub", 1);
                        freeEditRef.value?.setValue("tm1", [
                        moment(new Date(Date.now() - 30 * 1000 * 60 * 60 * 24)).format(
                            "YYYY-MM-DD 00:00:00"
                        ),
                        moment(new Date()).format("YYYY-MM-DD 23:59:59"),
                    ]);
                }
                 if (udrTypeValue.value == "4") {
                   freeEditRef.value?.setValue("inNextDpt", "1");
                   setFormItem("orgCde", {
                     loadData:  loadOrgCde.value
                   });
                   freeEditRef.value?.setValue(
                       'orgCde',  loadOrgCde.value[0]['value'],
                   );
                    freeEditRef.value?.setValue("CLoadSub", 1);
                        freeEditRef.value?.setValue("tm1", [
                        moment(new Date(Date.now() - 30 * 1000 * 60 * 60 * 24)).format(
                            "YYYY-MM-DD 00:00:00"
                        ),
                        moment(new Date()).format("YYYY-MM-DD 23:59:59"),
                    ]);
                }

                if (udrTypeValue.value == "5") {
                    freeEditRef.value?.setValue("CLoadSub", 1);
                      setFormItem("orgCde", {
                        loadData:  loadOrgCde.value
                    });
                    freeEditRef.value?.setValue(
                        'orgCde',  loadOrgCde.value[0]['value'],
                    );
                        freeEditRef.value?.setValue("tm1", [
                        moment(new Date(Date.now() - 30 * 1000 * 60 * 60 * 24)).format(
                            "YYYY-MM-DD 00:00:00"
                        ),
                        moment(new Date()).format("YYYY-MM-DD 23:59:59"),
                    ]);
                }
            }
        });
    };

    onMounted(async () => {
         freeEditRef.value?.setFormValue({
            udrType: "1",
            inNextDpt: "1",
            tm1: [
                moment(new Date(Date.now() - 6 * 1000 * 60 * 60 * 24)).format(
                    "YYYY-MM-DD 00:00:00"
                ),
                moment(new Date()).format("YYYY-MM-DD 23:59:59"),
            ],
        });

        freeEditRef.value?.setFormValue({
            udrType: "1",
            inNextDpt: "1",
            tm2: [
                moment(new Date(Date.now() - 6 * 1000 * 60 * 60 * 24)).format(
                    "YYYY-MM-DD 00:00:00"
                ),
                moment(new Date()).format("YYYY-MM-DD 23:59:59"),
            ],
        });
        // setTimeout(() => {
        //     setFormItem("orgCde", {
        //         loadData: [
        //             {
        //                 label: "永安保险总公司",
        //                 value: "0200000000000",
        //             },
        //         ],
        //     });

        //     // 确保 loadData 设置完成后再设置表单值
        //     freeEditRef.value?.setValue(
        //         'orgCde', "0200000000000",
        //     );
        // }, 200);
        
        // 初始化表单
        allForm.value.map((item: any, index: number) => {
            const isVal = item.showKey.findIndex((vals: any) => vals == 1);
            if (isVal !== -1) {
                if (item.prop == "tm1") item.rules = [];
                if (item.prop == "tm2") item.rules = [getRules("required", {})];
                formObj.notWaitObj.fromSchema.value.push(item);
            }
        });

        //首页跳转过来的逻辑 Start
        if (sessionStorage.getItem(AppKey.query.pcis_query_newudrlist)) {
            //首页 暂存任务跳转过来的,选中投保单
            const homeJumpData = JSON.parse(
                sessionStorage.getItem(AppKey.query.pcis_query_newudrlist)
            );
            await nextTick();
            if (homeJumpData.type === "temp") {
                //暂存任务
                changeForm("1"); //展示form表单不同的栏位
            } else if (homeJumpData.type === "edit") {
                //核保退回任务
                changeForm("4"); //展示form表单不同的栏位
            }
            console.log('123123',homeJumpData)
            // 投保日期
            freeEditRef.value.setValue("tm1", [
                homeJumpData.startCrtTm,
                homeJumpData.TAppTmEnd,
            ]);
            // 提核日期
            freeEditRef.value.setValue("tm2", [
                homeJumpData.startBsTm1,
                homeJumpData.endBsTm1,
            ]);
            setTimeout(() => {
                if (homeJumpData.hasOwnProperty("objId")) {
                    //申请单号
                    freeEditRef.value.setValue("objId", homeJumpData.objId);
                    handleQuery()
                }
            }, 500)
        } else {
            setTimeout(() => {
                handleQuery()
            }, 500)
        }
        //首页跳转过来的逻辑 End
    });

    onUnmounted(() => {
        //组件销毁，清除sessionStorage数据
        sessionStorage.getItem(AppKey.query.pcis_query_newudrlist) &&
        sessionStorage.removeItem(AppKey.query.pcis_query_newudrlist);
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

    // 导出
    const exportDown = () => {
        const CAppNo = freeEditRef.value?.getValue("CAppNo");
        const CPlyNo = freeEditRef.value?.getValue("CPlyNo");
        // 查询条件：申请单号，保单号任何一个有值时，都无需做其他查询条件校验
        if (!CAppNo && !CPlyNo) {
            // 查询时间段验证
            const date1 = freeEditRef.value?.getValue("tm1"); //投保日期
            const startTemp = date1[0];
            // if (null == startTemp.value || undefined === startTemp.value) {
            //     this._loading = false;
            //     this.msg.warning('投保起期不能为空');
            //     return;
            // }
            const start = Date.parse(startTemp.value);
            const endTemp = date1[1];
            // if (null == endTemp.value || undefined === endTemp.value) {
            //     this._loading = false;
            //     this.msg.warning('投保止期不能为空');
            //     return;
            // }
            const end = Date.parse(endTemp.value);
            // if (start - end > 0) {
            //     // this._loading = false;
            //     this.msg.warning('投保起期不能大于投保止期');
            //     return;
            // }
            if (
                new Date(date1[1]).getTime() - new Date(date1[0]).getTime() >=
                31 * 1000 * 60 * 60 * 24
            ) {
                // this._loading = false;
                ElMessage.warning("投保日期范围请控制在30天以内");
                return;
            }
        }
        const r = tableRef.value?.getPartnerPage(true); //获取分页数据
        const s = freeEditRef.value?.getFromValue(); //获取表单数据
        const param = {
            pageNo: 1,
            pageSize: 2000,
            sortField: "name",
            bsType: "A",
            CAppStatus: "4",
            // CUdrCde: this.user.opCde, // 已核保查询去掉人员限制
            // sortOrder: this._sortValue,
            CurrentUser: user.value.opCde,
            CurrentUserOrg: user.value.companyId,
            CType: "undrList",
            CLoadSub: freeEditRef.value?.getValue("CLoadSub"),
        };
        policyService
            .excelDown(param)
            .then((res: any) => {
                if (res.size <= 0) {
                    ElMessage.error({ message: "下载出错", duration: 3000 });
                    return;
                }
                const fileName = "queryList.xls";
                // saveAs(res, decodeURI(fileName));
            })
            .catch((error: any) => {
                console.log("出错了", error);
                ElMessage.error({ message: "下载出错", duration: 3000 });
            });
    };

    // 校验表单查询
    const handleQuery = (flag = true) => {
        freeEditRef.value?.validate().then((isValid: boolean) => {
            if (isValid) {
                refreshData(flag);
            } else {
                ElMessage.error("请填写必填项");
            }
        });
    };

    /** 查询 */
    function refreshData(flag?: boolean) {
        const date1 = freeEditRef.value?.getValue("tm1"); //投保日期
        const date2 = freeEditRef.value?.getValue("tm2"); //提核日期
        const objId = freeEditRef.value?.getValue("objId"); //申请单号
        const udrType = freeEditRef.value?.getValue("udrType"); //单据状态
        let roleCde = "";
        roles.value?.length &&
        roles.value.forEach((role) => {
            roleCde = roleCde === "" ? role : `${roleCde},${role}`;
        });
        roleCde = "ROLE_00000152";
        if (!objId) {
            // 查询时间段验证
            if (udrType == "3" || udrType == "4" || udrType == "5") {
                // if (!date1) {
                //   // loading.value = false;
                //   ElMessage.warning('投保日期不能为空');
                //   return;
                // }
                if (
                    new Date(date1[1]).getTime() - new Date(date1[0]).getTime() >=
                    31 * 1000 * 60 * 60 * 24
                ) {
                    // loading.value = false;
                    ElMessage.warning("投保日期范围请控制在30天以内");
                    return;
                }
            } else {
                if (!date2) {
                    ElMessage.warning("提核日期不能为空");
                    return;
                }
                if (
                    new Date(date2[1]).getTime() - new Date(date2[0]).getTime() >=
                    31 * 1000 * 60 * 60 * 24
                ) {
                    ElMessage.warning("提核日期范围请控制在30天以内");
                    return;
                }
            }
        }
        const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
        const s = freeEditRef.value?.getFromValue(); //获取表单数据
        let params = {};

        if (udrType !== "5") {
            params = {
                companyId: user.value.companyId,
                roleCde: roleCde,
                operId: user.value.opCde,
                inNextDpt: freeEditRef.value?.getValue("inNextDpt"),
                ...s,
            };
           
        //     "startBsTm1": "2025-07-08 00:00:00",
		// "endBsTm1": "2025-07-10 23:59:59",
            if(udrType == "1"  || udrType == "2" ){
                params.startBsTm1 = date1[0];
                params.endBsTm1 = date1[1];
                params.startCrtTm = date2[0];
                params.tAppTmEnd = date2[1];
            }else if (udrType == "3" || udrType == "4") {
                params.startBsTm1 = date1[0];
                params.endBsTm1 = date1[1];
            } else {
                params.startCrtTm = date2[0];
                params.tAppTmEnd = date2[1];
            }
        } else {
            params = Object.assign(
                {
                    sortField: "name",
                    bsType: "A",
                    CAppStatus: "4",
                    // CUdrCde: this.user.opCde, // 已核保查询去掉人员限制
                    sortOrder: null, // 存在问题_sortValue需要确认5个页面，每个tale具体哪些字段需要排序
                    CurrentUser: user.value.opCde,
                    CurrentUserOrg: user.value.companyId,
                    TAppTmStart: date1[0],
                    tAppTmEnd: date1[1],
                    CLoadSub: freeEditRef.value?.getValue("CLoadSub"),
                },
                s
            );
            params["findPlan"] = true;
        }
        delete params.tm1;
        delete params.tm2;
         console.log('32',udrType,params)
        const querys = Object.assign(params, r);
        const requestParam = cloneDeep(querys);
        requestParam.udrType = String(requestParam.udrType - 1);
        let udrData;
        if (udrType !== "5") {
            if (udrType === "4") {
                udrData = getBackUdrList(requestParam);
            } else {
                udrData = getNewUdrList(requestParam);
            }
        } else {
            udrData = pcisQueryService.getAppPolicyList(requestParam);
        }

        udrData
            .then((res: any) => {
                // loading.value = false;
                if (res && res.code === 200) {
                    ElMessage.success({ message: "查询完毕！", duration: 3000 });
                    if (udrType !== "5") {
                        pageresult.list = res.data || [];
                        pageresult.total = res.totalCount || 0;
                    } else {
                        pageresult.list = res.data.result || [];
                        pageresult.total = res.data.total || 0;
                    }
                } else {
                    ElMessage.error({ message: res.msg, duration: 3000 });
                }
            })
            .catch((error: any) => {
                console.log("出错了", error);
                ElMessage.error({ message: "后台服务异常,请联系管理员", duration: 3000 });
            });
    }

    // 修改 暂存任务
    function updateUdr(row: any) {
        const {
            objId,
            curtTask,
            bsType,
            prodNo,
            cRelateBusi,
            cEdrRsnBundleCde,
            plyNo,
        } = row;
        if (row.bsType === "P") {
            // 方案不校验倒签
            if (row.prodNo === "000000") {
                const data = {
                    CPlanNo: row.objId,
                    TaskId: row.curtTask,
                    scene: SCENE_PLAN_UW_PROCESS,
                    CProdNo: "000000",
                    cAppTyp: row.bsType,
                };
                const en = JSON.stringify(data);
                router.push({
                    path: "/index/pcis-combination/new-udr-list/combination-main",
                    query: { data: en },
                });
            } else {
                const en = JSON.stringify({
                    CPlanNo: row.objId,
                    TaskId: row.curtTask,
                    "Base.CProdNo": row.prodNo,
                    scene: SCENE_PLAN_UW_PROCESS,
                    cAppTyp: row.bsType,
                });
                router.push({
                    path: "/index/sys-right-basic/configPlan/detail",
                    query: { data: en },
                });
            }
        } else {
            // 关联交易业务，接收时给出提示
            if (
                row.cRelateBusi &&
                row.cEdrRsnBundleCde !== "s1" &&
                row.cEdrRsnBundleCde !== "s2" &&
                row.cEdrRsnBundleCde !== "c1"
            ) {
                ElMessageBox.alert(
                    "该笔业务为关联交易业务，请检查是否已上传【关联交易审批单】！",
                    "提示",
                    {
                        confirmButtonText: "确认",
                    }
                );
            }
            // 批改核保调用理赔接口校验团单在途赔案
            if (row.bsType === "E" && row.plyNo) {
                // 暂时注销  保证批改可核保
                checkEdrPocly({ CPlyNo: row.plyNo }).then(async (res: any) => {
                    if (res && res.code === 200 && res.msg.indexOf("出险时间") > 0) {
                        const confirmRes = await ElMessageBox.confirm(
                            res.msg + "\n是否继续核保？",
                            "提示",
                            {
                                confirmButtonText: "确认",
                                cancelButtonText: "取消",
                                type: "info",
                            }
                        ).catch(() => false);
                        if (!confirmRes) {
                            return;
                        }
                    }
                    updateUdrDetail(row);
                });
            } else {
                updateUdrDetail(row);
            }
        }
    }

    // 查看详情
    function updateUdrDetail(row: any) {
        getBaseInfoByAppNo({ appNo: row.objId }).then((r: any) => {
            if (r.code !== 200) {
                ElMessage.error({ message: r.msg, duration: 6000 });
            } else {
                if (row.bsType === "A") {
                    const en = JSON.stringify({
                        // scene: SCENE_PLY_UW_PROCESS,
                        cAppNo: row.objId,
                        taskId: row.curtTask,
                        cAppTyp: row.bsType,
                        cProdNo: row.prodNo,
                        cCiMrk: r.data.cCiMrk,
                        cGrpMrk: r.data.cGrpMrk,
                        cDptCde: r.data.cDptCde,
                        cDptCnm:row.uwDptName,
                        pageType: "PLY_UW_PROCESS_SCENE",
                        sysType:row.objExt,
                        plyNo: row.plyNo === "*" ? "" : row.plyNo,
                        cTermNo:row.cTermNo,
                        cTermNme:row.cTermNme,
                        cProdNmeCn: row.prodName,
                        cPolicySource: row.cPolicySource,
                        cRelateBusi: row.cRelateBusi,
                        cEdrRsnBundleCde: row.cEdrRsnBundleCde,
                        nRecRemEstAmt:row?.nRecRemEstAmt || 0,
                        nRecRemPrm:row?.nRecRemPrm || 0,
                    });
                    router.push({
                        path: "/pcisapp/myPage",
                        query: {
                            param: en,
                        },
                    });
                } else {
                    const en = JSON.stringify({
                        scene:
                            r.data.cEdrRsnBundleCde === "BL"
                                ? SCENE_PLY_UW_PROCESSBEARER
                                : SCENE_PLY_UW_PROCESS,
                        cAppNo: row.objId,
                        taskId: row.curtTask,
                        cAppTyp: row.bsType,
                        cProdNo: row.prodNo,
                        cCiMrk: r.data.cCiMrk,
                        cRsnCde: r.data.cEdrRsnBundleCde,
                        cEdrType: r.data.cEdrType,
                        cGrpMrk: r.data.cGrpMrk,
                        cDptCde: r.data.cDptCde,
                        cDptCnm:row.uwDptName,
                        pageType: "PLY_UW_PROCESS_SCENE",
                        sysType: row.objExt,
                        plyNo: row.plyNo,
                        cTermNo:row.cTermNo,
                        cTermNme:row.cTermNme,
                        cProdNmeCn: row.prodName,
                        cPolicySource: row.cPolicySource,
                        cRelateBusi: row.cRelateBusi,
                        cEdrRsnBundleCde: row.cEdrRsnBundleCde,
                      nRecRemEstAmt:row?.nRecRemEstAmt || 0,
                      nRecRemPrm:row?.nRecRemPrm || 0,
                    });
                    router.push({
                        path: "/pcisapp/myPage",
                        query: {
                            param: en,
                        },
                    });
                }
            }
        });
    }

    // 工作流处理
    function handleWorkFlow(row: any, type: any) {
        const param = {
            taskId: row.curtTask,
            user: user.value,
        };

        let udrData;
        // 接收 / 取消接收
        if (type === "handleReceived") {
            udrData = hasReceived(param);
        }
        if (type === "removeReceived") udrData = removeReceived(param);
        udrData &&
        udrData
            .then((result: any) => {
                if (result.code !== 200) {
                    ElMessage.error({ message: result.msg, duration: 3000 });
                } else {
                    if (type === "handleReceived") {
                        if (row.bsType === "P") {
                            const en = JSON.stringify({
                                CPlanNo: row.objId,
                                TaskId: row.curtTask,
                                "Base.CProdNo": row.prodNo,
                                scene: SCENE_PLAN_UW_PROCESS,
                                cAppTyp: row.bsType,
                                cTermNo:row.cTermNo,
                                cTermNme:row.cTermNme,
                                cProdNmeCn: row.prodName,
                                cPolicySource:row.cPolicySource,
                                cRelateBusi: row.cRelateBusi,
                                cEdrRsnBundleCde: row.cEdrRsnBundleCde,
                              nRecRemEstAmt:row?.nRecRemEstAmt || 0,
                              nRecRemPrm:row?.nRecRemPrm || 0,
                            });
                            router.push({
                                path: "/pcisapp/myPage",
                                query: {
                                    param: en,
                                },
                            });
                        } else {
                            // 详情
                            updateUdrDetail(row);
                        }
                    }
                    if (type === "removeReceived") {
                        if (result.msg === "解除接收成功!") {
                            ElMessage.success({ message: result.msg, duration: 3000 });
                        } else {
                            ElMessage.warning({ message: result.msg, duration: 3000 });
                        }
                        refreshData(true);
                    }
                }
            })
            .catch((error: any) => {
                console.log("出错了", error);
                ElMessage.error({
                    message: "后台服务异常,请联系管理员",
                    duration: 3000,
                });
            });
    }

    // 接收按钮 待核保任务
    function handle_hasReceived(row: any) {
        const {
            objId,
            curtTask,
            bsType,
            prodNo,
            cRelateBusi,
            cEdrRsnBundleCde,
            plyNo,
            cTermNme,
            cTermNo
        } = row;
        // 关联交易业务，接收时给出提示
        if (
            cRelateBusi &&
            cEdrRsnBundleCde !== "s1" &&
            cEdrRsnBundleCde !== "s2" &&
            cEdrRsnBundleCde !== "c1"
        ) {
            ElMessageBox.alert(
                "该笔业务为关联交易业务，请检查是否已上传【关联交易审批单】！",
                "提示",
                {
                    confirmButtonText: "确认",
                }
            )
        }

        if (bsType === "P") {
            // 方案不校验倒签
            if ("000000" === prodNo) {
                const param = {
                    taskId: curtTask,
                    user: user.value,
                };
                const flag = hasReceived(param);
                flag.then((result) => {
                    if (200 !== result["code"]) {
                        ElMessage.error({ message: result.msg, duration: 3000 });
                    } else {
                        const data = {
                            CPlanNo: objId,
                            TaskId: curtTask,
                            scene: SCENE_PLAN_UW_PROCESS,
                            CProdNo: "000000",
                            cAppTyp: row.bsType,
                            cTermNme:row.cTermNme,
                            cTermNo:row.cTermNo,
                            cPolicySource:row.cPolicySource,
                            cRelateBusi: row.cRelateBusi,
                            cEdrRsnBundleCde: row.cEdrRsnBundleCde,
                          nRecRemEstAmt:row?.nRecRemEstAmt || 0,
                          nRecRemPrm:row?.nRecRemPrm || 0,
                        };
                        const en = JSON.stringify(data);
                        router.push({
                            path: "/pcisapp/myPage",
                            query: {
                                param: en,
                            },
                        });
                    }
                });
            } else {
                handleWorkFlow(row, "handleReceived");
            }
        } else if (bsType === "E" && !!plyNo) {
            checkEdrPocly({ CPlyNo: plyNo }).then(async (res) => {
                if (!!res && !!res["code"]) {
                    if (res["code"] === 200 && res["msg"].indexOf("出险时间") > 0) {
                        const confirmRes = await ElMessageBox.confirm(
                            res.msg + "\n是否继续核保？",
                            "提示",
                            {
                                confirmButtonText: "确认",
                                cancelButtonText: "取消",
                                type: "info",
                            }
                        ).catch(() => false);
                        if (!confirmRes) {
                            return;
                        }
                    }
                    handleWorkFlow(row, "handleReceived");
                }
            });
        } else {
            handleWorkFlow(row, "handleReceived");
        }
    }

    // 多选事件
    function handleSelectionChange(selection: any) {
        console.log("selection", selection);
        selectData.value = selection;
        removeIds.value = selection.map((item: any) => item.cPkId);
    }

    // 详情 核保通过任务
    function showDetails(row: any) {
        let cAppTyp= row.bsType? row.bsType: row.cAppTyp;
        if (cAppTyp === "P") {
            if (row.cProdNo === "000000") {
                const param = {
                    CPlanNo: row.cAppNo,
                    CPlanMrk: row.cPlanMrk,
                    scene: SCENE_PLAN_READ,
                };
                const en = JSON.stringify(param);
                router.push({
                    path: "/index/pcis-combination/configPlan/combination-main",
                    query: { data: en },
                });
            } else {
                const en = JSON.stringify({
                    CPlanNo: row.cAppNo,
                    // 'Base.CProdNo': plan['PrdProdPlan.CProdNo'],
                    // 'Base.CGrpMrk': plan['PrdProdPlan.CGrpMrk'],
                    CPlanMrk: row.cPlanMrk,
                    "Base.CProdNo": row.cProdNo,
                    "Base.CGrpMrk": row.cGrpMrk,
                    scene: SCENE_PLAN_READ,
                });
                router.push({
                    path: "/index/sys-right-basic/configPlan/detail",
                    query: { data: en },
                });
            }
        } else {
            getBaseInfoByAppNo({ appNo: row.objId ? row.objId : row.cAppNo }).then((r: any) => {
                if (r.code !== 200) {
                    ElMessage.error({ message: r.msg, duration: 6000 });
                } else {
                    if (cAppTyp === "A") {
                        const en = JSON.stringify({
                            // scene: SCENE_PLY_UW_PROCESS,
                            cAppNo: row.objId ? row.objId : row.cAppNo,
                            taskId: row.curtTask,
                            cAppTyp: row.bsType? row.bsType: row.cAppTyp,
                            cProdNo: row.prodNo? row.prodNo: row.cProdNo,
                            cCiMrk: r.data.cCiMrk,
                            cGrpMrk: r.data.cGrpMrk,
                            cDptCde: r.data.cDptCde,
                            cDptCnm:row.uwDptName?row.uwDptName:row.cDptCnm,
                            pageType: "UW_READ_SCENE",
                            cTermNme:row.cTermNme,
                            cTermNo:row.cTermNo,
                            cProdNmeCn: row.prodName,
                            cPolicySource: row.cPolicySource,
                          nRecRemEstAmt:row?.nRecRemEstAmt || 0,
                          nRecRemPrm:row?.nRecRemPrm || 0,
                        });
                        router.push({
                            path: "/pcisapp/myPage",
                            query: {
                                param: en,
                            },
                        });
                    } else {
                        const en = JSON.stringify({
                            cAppNo: row.objId ? row.objId : row.cAppNo,
                            taskId: row.curtTask,
                            cAppTyp: row.bsType? row.bsType: row.cAppTyp,
                            cProdNo: row.prodNo? row.prodNo: row.cProdNo,
                            cCiMrk: r.data.cCiMrk,
                            cRsnCde: r.data.cEdrRsnBundleCde,
                            cEdrType: r.data.cEdrType,
                            cGrpMrk: r.data.cGrpMrk,
                            cDptCde: r.data.cDptCde,
                            cDptCnm:row.uwDptName?row.uwDptName:row.cDptCnm,
                            pageType: "UW_READ_SCENE",
                            cTermNme:row.cTermNme,
                            cTermNo:row.cTermNo,
                            cProdNmeCn: row.prodName,
                            cPolicySource: row.cPolicySource,
                          nRecRemEstAmt:row?.nRecRemEstAmt || 0,
                          nRecRemPrm:row?.nRecRemPrm || 0,
                        });
                        router.push({
                            path: "/pcisapp/myPage",
                            query: {
                                param: en,
                            },
                        });
                    }
                }
            });
        }
    }

    // 编辑 核保通过任务
    function handleEdit(row: any) {
        const bsType = row.bsType;
        let scene = SCENE_PLY_APP_MODIFY_UNSUBMIT;
        if (!!bsType && bsType === "E") {
            scene =
                row.cEdrRsnBundleCde === "BL"
                    ? SCENE_TEMPORARY_DEPOSITBEARER
                    : SCENE_EDR_APP_MODIFY_UNSUBMIT;
        }
        const en = JSON.stringify({
            scene: scene,
            cAppNo: row.objId,
            cProdNo: row.prodNo,
            cAppTyp: row.bsType,
            cJiMrk: row.cJiMrk,
            cDptCde: row.cDptCde,
            cDptCnm:row.uwDptName,
            cCiMrk: row.cCiMrk,
            cGrpMrk: row.cGrpMrk,
            cRsnCde: row.cEdrRsnBundleCde,
            cTermNme:row.cTermNme,
            cTermNo:row.cTermNo,
            pageType: "PLY_UW_PROCESS_SCENE",
            cProdNmeCn: row.prodName,
            cPolicySource: row.cPolicySource,
          nRecRemEstAmt:row?.nRecRemEstAmt || 0,
          nRecRemPrm:row?.nRecRemPrm || 0,
        });
        router.push({
            path: "/pcisapp/myPage",
            query: {
                param: en,
            },
        });
    }

    // 删除  核保通过任务
    function handleDelete(id?: string) {
        ElMessageBox.confirm("确认删除数据?", "警告", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
        }).then(function () {
            const delResult = pcisQueryService.delTmpPolicy({ cAppNo: id });
            delResult.then((res: any) => {
                if (null != res && null != res["code"]) {
                    if (res["code"] === 200) {
                        ElMessage.info({ message: res.msg, duration: 3000 });
                        refreshData(true);
                    } else {
                        ElMessage.error({ message: res.msg, duration: 3000 });
                    }
                }
            });
        });
    }

    function handleDblClick(row: any) {
        if(row.state === "0") {
            handle_hasReceived(row);
        }
    }

    //给表单下拉项赋值
    function setFormItem(key: any, obj: any) {
        if (obj && Object.keys(obj).length) {
            formconfig1.fromSchema?.forEach((item) => {
            if (item.prop === key) {
                //控制尾部按钮的
                if (item.btnItems && obj.btnItems) {
                for (let key in obj.btnItems) {
                    item.btnItems[key] = obj.btnItems[key];
                }
                }else{
                Object.assign(item, obj);
                }
            }
            });
        }
    }
    function setValue(key: string, value: any) {
        freeEditRef?.value?.setValue(key, value);
    }
    function getValue(key: string) {
       return freeEditRef?.value?.getValue(key);
    }
    defineExpose({
        setValue,
        getValue,
    });
</script>

<style scoped>
:deep(.el-button-group .el-button) {
  width: 80px;
}
</style>
