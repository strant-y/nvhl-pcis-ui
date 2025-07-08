<template>
    <div class="app-container">
        <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
        <app-table :tableConfig="tableconfig" v-model:pageresult="pageresult" ref="tableRef"
            @page-change="handleQuery(false)" @row-click="handleRowClick" @row-dblclick="handleRowDoubleClick"
            @sort-change="sortChange" />
    </div>
</template>

<script setup lang="ts">
import { defineComponent, ref, reactive, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import moment from "moment";
import DepartmentTree from "@/pcis/prodRef/commodityRef/DepartmentTree.vue";
import ChangeImageUploadModeComponent from "./change-image-upload-mode.vue";
import changeCiPolicynoComponent from "./change-ci-policyno-component.vue";
import { PcisEdrQueryService } from "./service/pcis-edr-query-service";
import { getListByCode } from "@/api/code-list-service";
import { useUserStore } from "@/store/modules/user";
import { AppKey } from "@/constants/api";
import { getProdEnableList } from "@/api/prod/";
import {
    DEFERRED_CORRECTION,
    SCENE_EDR_APP_NEW,
    SCENE_PLY_APP_READ,
} from "@/constants/tab-constants";

import { useDzModal } from "@/common/dzmodel/DzModalService";
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
    MyTableMethod,
} from "@/shared/app-table-config";
import { codeListViewStore } from "@/store";
const codeListStore = codeListViewStore();
const { getRules } = useValidator();
const dzmodal = useDzModal();

const freeEditRef = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<MyTableMethod | null>(null);
const userStore = useUserStore();
const user = ref(userStore.user);

const props = defineProps({
    activeName: {
        type: String,
        required: true,
    },
});
const router = useRouter();
const route = useRoute();
const pcisEdrQueryService = new PcisEdrQueryService();

const routeData = route.query || route.params;
//todo 假数据，为了让按钮展示出来
routeData.rsnTyp = "1";

const form = reactive(freeEditRef.value?.getFromValue()); //获取表单数据

const sortField = ref(null);
const sortOrder = ref(null);
const selected = ref({});
const rsnCde = ref({});
const rsnDetail = ref({});
const codeListMap = ref({});
const dialogVisible = ref(false);
const dialogTitle = ref("");
const dialogComponent = ref(null);
const dialogData = ref({});

const orgDptOptions = ref<any>([]);
const commodityOptions = ref<any>([]);
const kindOptions = ref<any>([]);
const prodOptions = ref<any>([]);
const treeNodes = ref<any>([]);

const formconfig1 = reactive<AppFreeEditConfig>(
    createAppFreeEditConfig({
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
                    freeEditRef.value?.resetFields();
                },
            }),
        ],
        fromSchema: [
            {
                prop: "cDptCde",
                inputtype: "rtSelectV2",
                title: "归属机构名称",
                showExBtn: true,
                disabled: true,
                rules: [getRules("required", {})],
                btnItems: {
                    icon: "Search",
                    type: "primary",
                    func: () => {
                        dzmodal
                            .open(DepartmentTree, { type: "Issuer", data: {} })
                            .then((res) => {
                                if (res.type === "ok") {
                                    if (res.body) {
                                        freeEditRef.value?.setValue("cDptCde", res.body.id);
                                        setFormItem("cDptCde", {
                                            loadData: [
                                                {
                                                    label: `${res.body.id}${res.body.name}`,
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
                prop: "cLoadSub",
                inputtype: "rtradio",
                title: "是否包含下级",
                loadData: [
                    { label: "是", value: 1 },
                    { label: "否", value: 0 },
                ],
                defaultValue: 1,
            },
            {
                prop: "cKindNo",
                inputtype: "rtSelectV2",
                title: "产品大类",
                clearable: true,
                typeCode: "KIND_LIST_CACHE",
                params: { cOperId: user.value.opCde, cDptCde: user.value.companyId },
                func: (val: any) => {
                    //根据产品大类再次请求条款接口
                    // codeListStore
                    //     .queryCodeList(
                    //         {
                    //             codeListName: "PROD_LIST",
                    //             codeListParam: {
                    //                 cParCde: val,
                    //                 cOperId: user.value.opCde,
                    //                 cDptCde: user.value.companyId,
                    //             },
                    //         },
                    //         false,
                    //         false
                    //     )
                    //     .then((res) => {
                    //         if (res && res.code == 200) {
                    //             const codeValData = res.data;
                    //             if (codeValData) {
                    //                 //清空条款显示值，重置条款下拉值
                    //                 freeEditRef.value?.setValue("prodNo", "");
                    //                 setFormItem("prodNo", {
                    //                     loadData: codeValData,
                    //                 });
                    //             }
                    //         }
                    //     });
                    // freeEditRef.value?.setValue("prodNo", []); // 清空条款
                    if(val){
                        console.log(11,val)
                        freeEditRef.value?.setValue('cProdNo',[]);

                        setFormItem('cProdNo',{
                            typeCode: "TERM_LIST_IN_GUIDE_NEW",
                            codeParam: {
                                cParCde: val,
                                // cOperId: user.value.opCde,
                                // cDptCde: user.value.companyId,
                            },
                        })
                    }else{
                         console.log(2,val)
                        freeEditRef.value?.setValue('cProdNo',[]);
                            setFormItem("cProdNo", {
                                typeCode: "",
                                codeParam: {},
                                loadData: [],
                        });
                    }
                 
                },
            },
            {
                prop: "cProdNo",
                inputtype: "rtselect",
                title: "条款",
                clearable: true,
                // typeCode: "TERM_LIST_IN_GUIDE_NEW",
                // params: {
                //     cParCde: "",
                //     cOperId: user.value.opCde,
                //     cDptCde: user.value.companyId,
                // },
            },
            {
                prop: "cInsuredNme",
                inputtype: "rtinput",
                title: "被保人名称",
                clearable: true,
            },
            {
                prop: "cAppNme",
                inputtype: "rtinput",
                title: "投保人名称",
                clearable: true,
            },
            {
                prop: "cPlyNo",
                inputtype: "rtinput",
                title: "保单号",
                clearable: true,
            },
            {
                prop: "tAppTm",
                inputtype: "rtdatepicker",
                title: "投保日期",
                type: "datetimerange",
                format: "YYYY-MM-DD HH:mm:ss",
                valueFormat: "YYYY-MM-DD HH:mm:ss",
                rules: [getRules("required", {})],
                func: (val) => {
                    handleDateChange(val);
                },
            },
        ],
    })
);
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
                } else {
                    Object.assign(item, obj);
                }
            }
        });
    }
}
// 在其他地方使用 codeListMap 时，确保其存在并且是有效的
// if (
//   codeListMap.value[prodNo + grpMrk] &&
//   Array.isArray(codeListMap.value[prodNo + grpMrk])
// ) {
//   const detailOption = codeListMap.value[prodNo + grpMrk].find(
//     (option) => option.value === val
//   );
//   if (detailOption) {
//     row["iddetail"] = detailOption.label;
//     changeRsn({ value: val }, row["cPlyNo"], { value: row["iddetail"] });
//   }
// }
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
        editFlag: true,
        editList: ["id", "iddetail"],
        tableBtnType: "btn",
        tableBtnWidth: 100,
        tableBtnPosition: "right",
        tableBtn: [
            createFreeButtonBase({
                id: "score",
                link: true,
                tooltip: "编辑",
                type: "success",
                size: "large",
                icon: "Edit",
                tableClick: (row) => {
                    // if ("DP" === row.id) {
                    //     ciCoopCorrect(row)
                    // }else{
                    openEdr(row.cAppNo, row.cPlyNo, row.cProdNo, row.cKindNo, row);
                    // }






                    // else if ("DP" === rsnCde.value[selected.value["cPlyNo"]]) {
                    //     ciCoopCorrect(selected.value["cPlyNo"])
                    //     console.log('数据====', result)
                    // }
                },
            }),
            createFreeButtonBase({
                id: "score",
                link: true,
                tooltip: "详情",
                type: "success",
                size: "large",
                icon: "View",
                tableClick: (row) => {
                    showDetails(row.cAppNo, row.cPlyNo, row.cProdNo, row.cKindNo, row);
                },
            }),
        ],
        fromSchema: [
            {
                prop: "cAppNo",
                inputtype: "rtinput",
                title: "申请单号",
                width: 180,
            },
            {
                prop: "cPlyNo",
                inputtype: "rtinput",
                title: "保单号",
                width: 180,
            },
            {
                prop: "cEdrNo",
                inputtype: "rtinput",
                title: "批单号",
                width: 180,
            },
            {
                prop: "cAppNme",
                inputtype: "rtinput",
                title: "投保人",
            },
            {
                prop: "tAppTm",
                inputtype: "rtinput",
                title: "投保日期",
                sortable: "custom",
                width: 160
            },
            {
                prop: "cProdNmeCn",
                inputtype: "rtinput",
                title: "产品",
            },
            {
                prop: "cGrpMrk",
                inputtype: "rtselect",
                title: "是否团单",
                loadData: [
                    { label: "是", value: "1" },
                    { label: "否", value: "0" },
                ],
            },
            {
                prop: "id",
                inputtype: "rtSelectV2",
                title: "批改原因",
                minWidth: 140,
                func: (val, row) => {
                    handleRsnChange(val, row);
                },
            },
            {
                prop: "iddetail",
                inputtype: "rtinput",
                title: "批改原因详细",
                disabled: true,
                minWidth: 140,
            },
        ],
    })
);

const handleDateChange = (value) => {
    let startDate,
        endDate = "";
    startDate = moment(new Date(value[0])).format("YYYY-MM-DD 00:00:00");
    endDate = moment(new Date(value[1]))
        .endOf("day")
        .format("YYYY-MM-DD HH:mm:ss");
};
const handleQuery = (flag = true) => {
    // submitForm(flag);
       freeEditRef.value?.validate().then((isValid) => {
        if (isValid) {
            refreshData(flag);
        }
    });
};

// const submitForm = (flag) => {
//     freeEditRef.value?.validate().then((isValid) => {
//         if (isValid) {
//             refreshData(flag);
//         }
//     });
// };

const refreshData = (reset = true) => {
 
    const formData = freeEditRef.value?.getFromValue();
    if (!formData.cPlyNo) {
        const startTemp =
            formData.tAppTm && formData.tAppTm.length > 1 ? formData.tAppTm[0] : null;
        if (null == startTemp || undefined === startTemp) {
            ElMessage.warning("投保起期不能为空");
            return;
        }
        const start = Date.parse(startTemp);
        const endTemp =
            formData.tAppTm && formData.tAppTm.length > 1 ? formData.tAppTm[1] : null;
        if (null == endTemp || undefined === endTemp) {
            ElMessage.warning("投保止期不能为空");
            return;
        }
        const end = Date.parse(endTemp);
        if (start - end > 0) {
            ElMessage.warning("投保起期不能大于投保止期");
            return;
        }
        if (end - start >= 7 * 1000 * 60 * 60 * 24) {
            ElMessage.warning("投保时间范围请控制在7天以内");
            return;
        }
    }
    // console.log(props.activeName, "=====");
    const r = tableRef.value?.getPartnerPage(reset); //获取分页数据
    const s = freeEditRef.value?.getFromValue(); //获取表单数据
    if (s.cLoadSub == null) {
        s.cLoadSub = "1";
    }
    const obj = {
        sortField: sortField.value,
        sortOrder: sortOrder.value,
        CurrentUser: user["opCde"],
        CurrentUserOrg: user["companyId"],
        cCommodityType: null,
        rsnTyp:
            props.activeName === "一般批改"
                ? "1"
                : props.activeName === "注销"
                    ? "2"
                    : "3",
    };
    const params = Object.assign(s, r, obj);
    sessionStorage.setItem(AppKey.query.pcis_query_endorse, params);
      
    pcisEdrQueryService.qryEndorseList(params).then((res: any) => {
        let{code , data }=res;
 
        pageresult.list =[];
        // if (null != res && null != res["code"]) {
            if (code === 200) {
              
                const pageData = data;
                if (pageData) {
                  
                    pageresult.total = pageData.total;
                    pageData.result.forEach((item) => {
                        changeRsnValue(item);
                    });
                    pageresult.list = pageData.result;
                   
                }
            }
        // }
    });
};
function handleRsnChange(val, row) {
    const grpMrk = row["cGrpMrk"].toString();
    const prodNo = row["cProdNo"];
    const isGrp = grpMrk !== "0" ? "1" : null;
    const isPer = grpMrk === "0" ? "1" : null;
    // const rsnTyp = routeData["rsnTyp"];
    let rsnTyp = "";
    if (props.activeName === "一般批改") {
        rsnTyp = "1";
    } else if (props.activeName === "注销") {
        rsnTyp = "2";
    } else if (props.activeName === "退保") {
        rsnTyp = "3";
    }
    routeData["rsnTyp"] = rsnTyp
    if (val === "FZ") {
        // 如果是非涉费批改
        getListByCode("EDR_RSN_LIST", {
        prodNo: prodNo,
        rsnTyp: rsnTyp,
        isGrp: isGrp,
        isPer: isPer,
        calcMrk: "0",
        ZH: "ZH",
        FZ: "FZ",
    }).then(
        (cde2Res) => {
            cde2Res["data"] = [{ value: 'FZ', label: '非涉费组合批改' }];
            if (!codeListMap.value[prodNo + val + grpMrk]) {
                codeListMap.value[prodNo + val + grpMrk] = cde2Res["data"];
            }

            const detailOption = cde2Res["data"].find(
                (option) => option.value === val
            );

            if (detailOption) {
                row["iddetail"] = [detailOption.label];
                changeRsn({ value: val }, row["cPlyNo"], { value: row["iddetail"] });
            } else {
                row["iddetail"] = '';
            }
        },
        (error) => {
            console.log("出错了", error);
            ElMessage.error("后台服务异常,请联系管理员");
        }
    );
    } else {
        const detailOption = codeListMap.value[prodNo + grpMrk]?.find(
            (option) => option.value === val
        );
        if (detailOption) {
            row["iddetail"] = [detailOption.label];
            changeRsn({ value: val }, row["cPlyNo"], { value: row["iddetail"] });
        }
    }
}
//table的单击事件，这个需要调整，看是否还需要保留这个！！！
const handleRowClick = (row) => {
    selected.value = row;
};

// table表格的双击事件
const handleRowDoubleClick = (row) => {
    openEdr(row.cAppNo, row.cPlyNo, row.cProdNo, row.cKindNo, row);
};
//投保日期的排序事件
const sortChange = (column, prop, order) => {
    console.log(column, prop, order);
};

// 缓存批改原因
const changeRsn = (rsnCdeObj, appNo, rsnDetailObj) => {
    if (appNo) {
        if (!rsnCde.value) {
            rsnCde.value = {};
        }
        if (!rsnDetail.value) {
            rsnDetail.value = {};
        }
        // rsnCde.value[appNo] = rsnCde;
        // rsnDetail.value[appNo] = rsnDetail;
        rsnCde.value[appNo] = rsnCdeObj.value;
        rsnDetail.value[appNo] = rsnDetailObj.value;
    }
};

// 处理批改原因详细
const getDetailRsn = (item) => {
    const grpMrk = item["cGrpMrk"].toString();
    const prodNo = item["cProdNo"];
    const isGrp = grpMrk !== "0" ? "1" : null;
    const isPer = grpMrk === "0" ? "1" : null;
    // const rsnTyp = routeData["rsnTyp"];
    let rsnTyp = "";
    if (props.activeName === "一般批改") {
        rsnTyp = "1";
    } else if (props.activeName === "注销") {
        rsnTyp = "2";
    } else if (props.activeName === "退保") {
        rsnTyp = "3";
    }
    routeData["rsnTyp"] = rsnTyp
    const detail = [];
    if (item["id"] === "FZ") {
        // 如果是非涉费批改
        getListByCode("EDR_RSN_LIST_FZ", {
            prodNo: prodNo,
            rsnTyp: rsnTyp,
            isGrp: isGrp,
            isPer: isPer,
            calcMrk: "0",
            ZH: "ZH",
            FZ: "FZ",
        }).then(
            (cde2Res) => {
                if (!codeListMap.value[prodNo + item["id"] + grpMrk]) {
                    codeListMap.value[prodNo + item["id"] + grpMrk] = cde2Res["data"];
                }
                const detailOption = codeListMap.value[
                    prodNo + item["id"] + grpMrk
                ]?.find((option) => option.value === item["id"]);
                if (detailOption) {
                    detail.push(detailOption.label);
                    setTimeout(() => {
                        item["iddetail"] = detail;
                        changeRsn({ value: item["id"] }, item["cPlyNo"], {
                            value: item["iddetail"],
                        });
                    }, 5);
                }
            },
            (error) => {
                console.log("出错了", error);
                ElMessage.error("后台服务异常,请联系管理员");
            }
        );
    } else {
        // const detailOption = codeListMap.value[prodNo + grpMrk]?.find(
        //     (option) => option.value === item["id"]
        // );
        // if (detailOption) {
        //     detail.push(detailOption.label);
        //     setTimeout(() => {
        //         item["iddetail"] = detail;
        //         changeRsn({ value: item["id"] }, item["cPlyNo"], {
        //             value: item["iddetail"],
        //         });
        //     }, 5);
        // }
        getListByCode("EDR_RSN_LIST_FZ", {
            prodNo: prodNo,
            rsnTyp: rsnTyp,
            isGrp: isGrp,
            isPer: isPer,
            calcMrk: "1",
            ZH: "ZH",
            FZ: "FZ",
        }).then(
            (cde2Res) => {
                if (!codeListMap.value[prodNo + item["id"] + grpMrk]) {
                    codeListMap.value[prodNo + item["id"] + grpMrk] = cde2Res["data"];
                }
                const detailOption = codeListMap.value[
                    prodNo + item["id"] + grpMrk
                ]?.find((option) => option.value === item["id"]);
                if (detailOption) {
                    detail.push(detailOption.label);
                    setTimeout(() => {
                        item["iddetail"] = detail;
                        changeRsn({ value: item["id"] }, item["cPlyNo"], {
                            value: item["iddetail"],
                        });
                    }, 5);
                }
            },
            (error) => {
                console.log("出错了", error);
                ElMessage.error("后台服务异常,请联系管理员");
            }
        );
    }
};

// 批改原因处理
const changeRsnValue = (item) => {
    let detail = [];
    // const rsnTyp = routeData["rsnTyp"];
    let rsnTyp = "";
    let urlStr = 'EDR_RSN_LIST_KIND';
    if (props.activeName === "一般批改") {
        rsnTyp = "1";
        urlStr = 'EDR_RSN_LIST_KIND';
    } else if (props.activeName === "注销") {
        rsnTyp = "2";
        urlStr = 'EDR_RSN_LIST_ZX';
    } else if (props.activeName === "退保") {
        rsnTyp = "3";
         urlStr = 'EDR_RSN_LIST_TB';
    }
    routeData["rsnTyp"] = rsnTyp
    selected.value = item;
    const grpMrk = item["cGrpMrk"].toString();
    const prodNo = item["cProdNo"];
    const isGrp = grpMrk !== "0" ? "1" : null;
    const isPer = grpMrk === "0" ? "1" : null;
//    console.log(rsnTyp,grpMrk,prodNo,codeListMap.value[prodNo + item["id"]])
    if (
        undefined === codeListMap.value[prodNo + grpMrk] ||
        null === codeListMap.value[prodNo + grpMrk]
    ) {
        // 当缓存中无该产品的批改原因时
        if (rsnTyp === "1") {
            // 一般批改
            getListByCode(urlStr, {
                prodNo: prodNo,
                kindNo: prodNo.substring(0, 2),
                rsnTyp: rsnTyp,
                isGrp: isGrp,
                isPer: isPer,
            }).then(
                (cdeRes) => {
                    if (cdeRes && cdeRes["data"] && cdeRes["data"].length > 0) {
                        if (!codeListMap.value[prodNo + grpMrk]) {
                            codeListMap.value[prodNo + grpMrk] = cdeRes["data"];
                        }
                        item["id"] = cdeRes["data"][0]["value"];
                        // 处理批改原因详细
                        getDetailRsn(item);
                        // 将批改原因赋值给表格行的下拉选项
                        setTableFormItem("id", {
                            loadData: cdeRes["data"],
                        });
                    }
                },
                (error) => {
                    console.log("出错了", error);
                    ElMessage.error("后台服务异常,请联系管理员");
                }
            );
        } else {
            // 退保注销
            // getListByCode("EDR_RSN_LIST_KIND", {
            getListByCode(urlStr, {
                kindNo: prodNo.substring(0, 2),
                rsnTyp: rsnTyp,
            }).then(
                (cdeRes) => {
                    if (!!cdeRes && !!cdeRes["data"] && cdeRes["data"].length > 0) {
                        if (!codeListMap.value[prodNo + grpMrk]) {
                            codeListMap.value[prodNo + grpMrk] = cdeRes["data"];
                        }
                        item["id"] = cdeRes["data"][0]["value"];
                        // 处理批改原因详细
                        getDetailRsn(item);
                        // 将批改原因赋值给表格行的下拉选项
                        setTableFormItem("id", {
                            loadData: cdeRes["data"],
                        });
                    }
                },
                (error) => {
                    console.log("出错了", error);
                    ElMessage.error("后台服务异常,请联系管理员");
                }
            );
        }
    } else {
        // 当缓存中有该产品的批改原因时
        item["id"] = item["id"]
            ? item["id"]
            : codeListMap.value[prodNo + grpMrk][0]["value"];


            if (
            undefined === codeListMap.value[prodNo + item["id"] + grpMrk] ||
            null === codeListMap.value[prodNo + item["id"] + grpMrk] 
            || codeListMap.value[prodNo + item["id"] + grpMrk].length ===0
        ) {
            // 当缓存中无该产品批改原因详细时
            // 处理批改原因详细
     
            getDetailRsn(item);
        } else {
            // 当缓存中有该产品批改原因详细时
            if (item["id"] === "FZ") {
                detail.push(
                    codeListMap.value[prodNo + item["id"] + grpMrk][0]["value"]
                );
             
                setTimeout(() => {
                    item["iddetail"] = detail;
                    // 缓存批改原因
                    changeRsn(item["id"], item["cPlyNo"], item["iddetail"]);
                }, 5);
                
            } else {
     
                detail.push(item["id"]);
                setTimeout(() => {
                    item["iddetail"] = detail;
                    // 缓存批改原因
                    changeRsn(item["id"], item["cPlyNo"], item["iddetail"]);
                    
                }, 5);
            }
        }
    }
};
//给表格表单项赋值
function setTableFormItem(key, obj) {
    if (obj && Object.keys(obj).length) {
        tableconfig.fromSchema?.forEach((item) => {
            if (item.prop === key) {
                Object.assign(item, obj);
            }
        });
    }
}

const showDetails = (cAppNo, cPlyNo, cProdNo, cKindNo, data) => {
    if (null == selected.value["cPlyNo"] || "" === selected.value["cPlyNo"]) {
        ElMessage.warning("请选择一条记录");
        return;
    }
    if (!selected.value["cPlyNo"]) return;
    const en = JSON.stringify({
        // scene: SCENE_PLY_APP_READ,
        cAppNo: selected.value["cAppNo"],
        cOrgAppNo: cAppNo,
        cCiMrk: selected.value["cCiMrk"],
        cProdNo: selected.value["cProdNo"],
        cAppTyp: selected.value["cAppTyp"],
        cGrpMrk: selected.value["cGrpMrk"],
        cDptCde: selected.value["cDptCde"],
        cDptCnm: selected.value["cDptCnm"],
        pageType: "readonly",
    });
    router.push({
        path: "/pcis/my-page",
        query: {
            param: en,
        },
    });
};

const openEdr = (cAppNo, cPlyNo, cProdNo, cKindNo, data) => {
    handleRowClick(data);
    if (null == selected.value["cPlyNo"] || "" === selected.value["cPlyNo"]) {
        ElMessage.warning("请选择一条记录");
        return;
    }
    if (
        null == rsnCde.value[selected.value["cPlyNo"]] ||
        "" === rsnCde.value[selected.value["cPlyNo"]]
    ) {
        ElMessage.warning("请选择批改原因");
        return;
    }
    if (
        DEFERRED_CORRECTION === rsnCde.value[selected.value["cPlyNo"]] &&
        "020027" === cProdNo
    ) {
        ElMessage.warning("此产品暂不支持延期批改，请选择通用批改");
        return;
    }
    // if(rsnCde.value[selected.value["cPlyNo"]] == ""){}
    const param = {
        plyNo: cPlyNo,
        edrType: routeData["rsnTyp"],
        prodNo: cProdNo,
        edrRsnCde: rsnCde.value[selected.value["cPlyNo"]],
    };

    pcisEdrQueryService.validEndorse(param).then(
        async (result) => {
            if (200 !== result["code"]) {
                ElMessage.error(result["msg"]);
            } else {
                if (result["data"]) {
                    // debugger
                    // 如果选的批改原因是变更影像上传方式
                    if ("DZ" === rsnCde.value[selected.value["cPlyNo"]]) {
                        modifyImageUploadMode(cPlyNo);
                        return;
                    } else if ("DP" === rsnCde.value[selected.value["cPlyNo"]]) {
                        const cCiMrk = selected.value["cCiMrk"]
                            if (cCiMrk ==='0' || cCiMrk ==='5'){
                                ElMessage.error('非共保或司内联保保单不可以进行补充共保保单编号批改！');
                                return false;
                            }
                             ciCoopCorrect(cAppNo, cPlyNo)
                    } else if ("2" === routeData["rsnTyp"]) {
                        //注销
                        const en = JSON.stringify({
                            cAppNo: selected.value["cPlyNo"],
                            cOrgAppNo: cAppNo,
                            cRsnCde: rsnCde.value[selected.value["cPlyNo"]],
                            cRsnDetailCde: transferRsnDetail(
                                rsnDetail.value[selected.value["cPlyNo"]]
                            ),
                            cProdNo: selected.value["cProdNo"],
                            cCiMrk: selected.value["cCiMrk"],
                            cGrpMrk: selected.value["cGrpMrk"],
                            cJiMrk: selected.value["cJiMrk"],
                            cDptCde: selected.value["cDptCde"],
                            cDptCnm: selected.value["cDptCnm"],
                            cEdrType: '2',
                            pageType: "EDR_APP_NEW_SCENE",
                            cTermNme: selected.value["cTermNme"],
                            cTermNo: selected.value["cTermNo"],
                            cProdNmeCn: selected.value["cProdNmeCn"],
                        });
                        //预留跳转路径
                        router.push({
                            path: "/pcis/my-page",
                            query: {
                                param: en,
                            },
                        });
                    } else if ("3" === routeData["rsnTyp"]) {
                        console.log("退保", selected.value);
                        //退保
                        const en = JSON.stringify({
                            cAppNo: selected.value["cPlyNo"],
                            cOrgAppNo: cAppNo,
                            cRsnCde: rsnCde.value[selected.value["cPlyNo"]],
                            cRsnDetailCde: transferRsnDetail(
                                rsnDetail.value[selected.value["cPlyNo"]]
                            ),
                            cProdNo: selected.value["cProdNo"],
                            cCiMrk: selected.value["cCiMrk"],
                            cGrpMrk: selected.value["cGrpMrk"],
                            cJiMrk: selected.value["cJiMrk"],
                            cDptCde: selected.value["cDptCde"],
                            cDptCnm: selected.value["cDptCnm"],
                            cEdrType: '3',
                            pageType: "EDR_APP_NEW_SCENE",
                            cTermNme: selected.value["cTermNme"],
                            cTermNo: selected.value["cTermNo"],
                            cProdNmeCn: selected.value["cProdNmeCn"],
                        });
                        //预留跳转路径
                        router.push({
                            path: "/pcis/my-page",
                            query: {
                                param: en,
                            },
                        });
                    } else if ("1" === routeData["rsnTyp"]) {
                        //一般批改
                        const en = JSON.stringify({
                            // scene: SCENE_EDR_APP_NEW,
                            cAppNo: selected.value["cPlyNo"],
                            cOrgAppNo: cAppNo,
                            cRsnCde: rsnCde.value[selected.value["cPlyNo"]],
                            cRsnDetailCde: transferRsnDetail(
                                rsnDetail.value[selected.value["cPlyNo"]]
                            ),
                            cProdNo: selected.value["cProdNo"],
                            cCiMrk: selected.value["cCiMrk"],
                            cGrpMrk: selected.value["cGrpMrk"],
                            cJiMrk: selected.value["cJiMrk"],
                            cDptCde: selected.value["cDptCde"],
                            cDptCnm: selected.value["cDptCnm"],
                            cEdrType: '1',
                            pageType: "EDR_APP_NEW_SCENE",
                            cTermNme: selected.value["cTermNme"],
                            cTermNo: selected.value["cTermNo"],
                            cProdNmeCn: selected.value["cProdNmeCn"],
                            tInsrncBgnTm: selected.value["tInsrncBgnTm"],
                            tInsrncEndTm: selected.value["tInsrncEndTm"],
                        });
                        console.log(en);
                        router.push({
                            path: "/pcis/my-page",
                            query: {
                                param: en,
                            },
                        });
                    }
                } else {
                    ElMessage.error(result["msg"]);
                }
            }
        },
        (error) => {
            console.log("err: ", error);
            ElMessage.error("连接失败！" + error);
        }
    );
};

//变更影像上传方式
const modifyImageUploadMode = (plyNo) => {
    dzmodal
        .open(ChangeImageUploadModeComponent, { parameter: { plyNo } })
        .then((res) => {
            if (res.type === "ok") {
            }
        });
};
//联共保批改
const ciCoopCorrect = (cAppNo, cPlyNo) => {
    console.log(3333)
    dzmodal
        .open(changeCiPolicynoComponent, { cAppNo,cPlyNo})
        .then((res) => {
            if (res.type === "ok") {
            }
        });
};
const transferRsnDetail = (rsnDetail) => {
    let str = "";
    rsnDetail.forEach((item) => {
        str = str ? str + "," + item : item;
    });
    return str;
};

onMounted(() => {
   
    freeEditRef.value?.setFormValue({
        tAppTm: [
            moment(new Date(Date.now() - 6 * 1000 * 60 * 60 * 24)).format(
                "YYYY-MM-DD 00:00:00"
            ),
            moment(new Date()).format("YYYY-MM-DD 23:59:59"),
        ],
        cDptCde: "0200000000000",
    });
    setFormItem("cDptCde", {
        loadData: [
            {
                label: "0200000000000永安保险公总司",
                value: "0200000000000",
            },
        ],
    });
    const param = {
        level: 2,
    };
    getProdEnableList(param).then((res: any) => {
        if (res.code === 200) {
            treeNodes.value = res.data;
        } else {
            ElMessage.error(res.msg);
        }
    });

     handleQuery();  //查询
});

watch(dialogVisible, (newValue) => {
    if (!newValue) {
        dialogComponent.value = null;
        dialogData.value = {};
    }
});
</script>

<style scoped lang="scss">
.actived {
    background: #a6dbed;
}

.fc-table-icons {
    i {
        margin-right: 10px;
        cursor: pointer;
    }
}
</style>
