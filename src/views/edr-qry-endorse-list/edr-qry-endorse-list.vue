<template>
    <div class="app-container">
        <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
        <app-table :tableConfig="tableconfig" v-model:pageresult="pageresult" ref="tableRef"
            @page-change="handleQuery(false)" @row-click="handleRowClick" @row-dblclick="handleRowDoubleClick"
            @sort-change="sortChange">
            <!-- policyInfo 列的具名插槽 -->
            <template #column-policyInfo="{ row, column, index }">
                <div class="policy-info-cell">
                    <div v-if="row.cAppNo" class="policy-number-row">
                        <span>{{ row.cAppNo }}</span>
                        <el-icon class="copy-icon" @click="copyText(row.cAppNo)">
                            <DocumentCopy />
                        </el-icon>
                    </div>
                    <div v-if="row.cPlyNo" class="policy-number-row">
                        <span>{{ row.cPlyNo }}</span>
                        <el-icon class="copy-icon" @click="copyText(row.cPlyNo)">
                            <DocumentCopy />
                        </el-icon>
                    </div>
                </div>
            </template>
        </app-table>
    </div>
    <comDialog ref="dialog"></comDialog>
</template>

<script setup lang="ts">
import { defineComponent, ref, reactive, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import moment from "moment";
import DepartmentTree from "@/pcis/prodRef/commodityRef/DepartmentTree.vue";
import ChangeImageUploadModeComponent from "./change-image-upload-mode.vue";
import { DialogMethod } from "@/common/dzmodel/ComDialogConf";
import { PcisEdrQueryService } from "./service/pcis-edr-query-service";
import { getListByCode } from "@/api/code-list-service";
import { useUserStore } from "@/store/modules/user";
import { DocumentCopy } from "@element-plus/icons-vue";
import { AppKey } from "@/constants/api";
import { getProdEnableList, getDelayCount, getNewSysDays, checkCdeptByCdptCde ,checkCancelM1IsOff, queryPayString, qryTerminationDataList} from "@/api/prod/";
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
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";

const dialog = ref<DialogMethod | null>(null);
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const codeListStore = codeListViewStore(idxParam.cdeListViewProps);
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
let cTermNoList = ref<any>([]);  // 条款数据
let cTermNo = '';    // 条款编码
const cPard = ref(null);

// 截取条款请求
function extractCode(str: string) {
    // 匹配 "P+数字" 或 "纯数字"
    const pattern = /^(P\d+|\d+)/;
    return str.match(pattern)?.[0] || "";
}

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
                    freeEditRef.value?.setFormValue({
                        tAppTm: [
                            moment(new Date(Date.now() - 6 * 1000 * 60 * 60 * 24)).format(
                                "YYYY-MM-DD 00:00:00"
                            ),
                            moment(new Date()).format("YYYY-MM-DD 23:59:59"),
                        ],
                        cDptCde: user.value?.companyId,
                    });
                    setFormItem("cDptCde", {
                        loadData: [
                            {
                                label: user.value?.companyId || '' + user.value?.companyCnm || '',
                                value: user.value?.companyId,
                            },
                        ],
                    });
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
                inputtype: "rtselect",
                title: "产品大类",
                typeCode: "KIND_LIST_GRT",
                child: "cProdNo",
                filterable: true,
                clearable: true,
                codeParam: {
                    cOperId: JSON.parse(sessionStorage.getItem("user")).opCde,
                    cDptCde: JSON.parse(sessionStorage.getItem("user")).companyId,
                },
                func: (val) => {
                    setValue("cProdNo", "")
                    cTermNo = "";      // 重置条款编码
                    cPard.value = val;
                    codeListStore
                        .queryCodeList({
                            codeListName: "TERM_LIST_IN_GUIDE_SEARCH",
                            codeListParam: {
                                cParCde: cPard.value,
                                cOperId: JSON.parse(sessionStorage.getItem("user")).opCde,
                                cDptCde: JSON.parse(sessionStorage.getItem("user")).companyId,
                            },
                        })
                        .then((res) => {
                            cTermNoList.value = res;
                            setFormItem("cProdNo", {
                                loadData: res,
                            });
                        });
                },
            },
            {
                prop: "cProdNo",
                inputtype: "rtselect",
                title: "条款名称",
                itemWidth: 1,
                filterable: true,
                clearable: true,
                func: (val: any) => {
                    if (val) {
                        if (cTermNoList.value.length > 0) {
                            cTermNoList.value.forEach((ele) => {
                                if (ele['value'] === val) {
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
                    val[0] = moment(new Date(val[0])).format("YYYY-MM-DD 00:00:00");
                    val[1] = moment(new Date(val[1])).format("YYYY-MM-DD 23:59:59");
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
									if (row.id[1] === "47") {
										if (row.cCiMrk === "5") {
											ElMessage.warning('出单方式为司内联保时,联共保信息不可批改!');
											return;
										}
										let params = {
											policyNo: row.cPlyNo, // 保单号
											endorseNo: row.cEdrNo || '', // 有批单号就传个批单号 没有就为空
										}
										// 实收不能批改
										queryPayString(params).then((res: any) => {
											if (res.rsltCode !== 'C') {
												ElMessage.error(res.rsltMsg || '连接失败！');
												return;
											}

											if (res.rsltStatus !== '0') {
												ElMessage.warning(res.rsltMsg+'不能批改！');
												return;
											}

											openEdr(row.cAppNo, row.cPlyNo, row.cProdNo, row.cKindNo, row);
										})
										.catch((err) => {
											console.error(err);
											ElMessage.error('系统异常，请稍后重试');
										});
									} else if (row.id[1] === "83" && row.cGrpMrk !== "1") {
										ElMessage.error('该申请单不是团单，不能选择此批改原因！');
										return;
									} else {
											openEdr(row.cAppNo, row.cPlyNo, row.cProdNo, row.cKindNo, row);
                    }
                    // if ("DP" === row.id) {
                    //     ciCoopCorrect(row)
                    // }else{

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
                prop: "policyInfo",
                inputtype: "rtinput",
                title: "申请单号/保单号",
                lengthNum: 21,
                lengthIsNumber: true,
                slotName: "policyInfo",
                fixed: true
            },
            // {
            //     prop: "cPlyNo",
            //     inputtype: "rtinput",
            //     title: "保单号",
            //     width: 180,
            // },
            // {
            //     prop: "cEdrNo",
            //     inputtype: "rtinput",
            //     title: "批单号",
            //     width: 180,
            // },
            {
                prop: "cAppNme",
                inputtype: "rtinput",
                title: "投保人",
                align: 'left',
                lengthNum: 12,
            },
            {
                prop: "tAppTm",
                inputtype: "rtinput",
                title: "投保日期",
                sortable: "custom",
                lengthNum: 17,
                lengthIsNumber: true,
            },
            {
                prop: "cProdNmeCn",
                inputtype: "rtinput",
                title: "产品",
                // lengthNum: 13,
                align: 'left',
            },
            {
                prop: "cGrpMrk",
                inputtype: "rtselect",
                title: "是否团单",
                loadData: [
                    { label: "是", value: "1" },
                    { label: "否", value: "0" },
                ],
                lengthNum: 4,
            },
            {
                prop: "id",
                inputtype: "rtcascader",
                title: "批改原因",
                lengthNum: 17,
                checkStrictly: false,
                func: (val, row, codeListMap) => {
                    console.log(row);
                    if (val && val[1] && codeListMap['EDR_RSN_LIST_NEW-1-' + val[0]]) {
                        row["iddetail"] = codeListMap['EDR_RSN_LIST_NEW-1-' + val[0]].find((item: any) => item.value === val[1]);
                    }
                },
                lazyLoad: (node, resolve, row) => {
                    const { level, value } = node;
                    if(row.cTransMrk === '1'){
                        resolve([{c_calc_mrk: "0",label: "数据补全",leaf: true,value: "99"}]);
                    }else if (level !== 0 && !!value) {
                        const list = node.label !== "一般批改" ? codeListMap[`EDR_RSN_LIST_NEW-${level}-${value}`] : '';
                        let codeListParam = {};
                        console.log(value);
                        codeListParam.rsnTyp = value.split('-')[0];
                        codeListParam.kindNo = value.split('-')[1];
                        codeListParam.prodNo = row.cProdNo;
                        codeListParam.cTransMrk = row.cTransMrk;
                        let codeListName = "EDR_RSN_LIST_NEW";
                        if(codeListParam.rsnTyp == '2' || codeListParam.rsnTyp == '3'){
                            codeListName = "EDR_RSN_LIST_CANCEL";
                        }
                        codeListStore.queryCodeList(
                            { codeListName: codeListName,
                            codeListParam: codeListParam, },
                            false, false ).then((res: any) => {
                            res.forEach((e: any) => {
                                e.leaf = level >= 1;
                            });
                            codeListMap[`EDR_RSN_LIST_NEW-${level}-${value}`] = res;
                            resolve(res);
                            })
                            .catch((err) => {
                                console.error(err);
                            });
                    }else {
                        resolve([]);
                    }
                },
            },
            // {
            //     prop: "iddetail",
            //     inputtype: "rtinput",
            //     title: "批改原因详细",
            //     disabled: true,
            //     minWidth: 140,
            // },
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
       // 提取投保日期的开始时间和结束时间
    const tAppTmStart = formData.tAppTm && formData.tAppTm.length > 1 ? formData.tAppTm[0] : null;
    const tAppTmEnd = formData.tAppTm && formData.tAppTm.length > 1 ? formData.tAppTm[1] : null;

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
        // rsnTyp:
        //     props.activeName === "一般批改"
        //         ? "1"
        //         : props.activeName === "注销"
        //             ? "2"
        //             : "3",
    };
    const params = Object.assign(s, r, obj);
    params["cTermNo"] = cTermNo;        // 条款编码
    params["tAppTmStart"] = tAppTmStart; // 投保开始时间
    params["tAppTmEnd"] = tAppTmEnd; // 投保结束时间

    console.log('参数1', params)
    sessionStorage.setItem(AppKey.query.pcis_query_endorse, params);

    pcisEdrQueryService.qryEndorseList(params).then((res: any) => {
        let { code, data } = res;

        pageresult.list = [];
        // if (null != res && null != res["code"]) {
        if (code === 200) {

            const pageData = data;
            if (pageData) {

                pageresult.total = pageData.total;
                pageData.result.forEach((item) => {
                    if(item.cTransMrk !== '1'){
                        setTableFormItem("id", {
                            loadData: [
                                { label: '一般批改', value: `1-${item.cProdNo.slice(0, 2)}` },
                                { label: '注销', value: `2-${item.cProdNo.slice(0, 2)}` },
                                { label: '退保', value: `3-${item.cProdNo.slice(0, 2)}` },
                            ],
                        });
                    }else{
                        setTableFormItem("id", {
                            loadData: [
                                { label: '一般批改', value: `1-${item.cProdNo.slice(0, 2)}` },
                            ],
                        });
                    }
                });
                console.log(pageData.result);
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
            || codeListMap.value[prodNo + item["id"] + grpMrk].length === 0
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
    // if (null == selected.value["cPlyNo"] || "" === selected.value["cPlyNo"]) {
    //     ElMessage.warning("请选择一条记录");
    //     return;
    // }
    // if (!selected.value["cPlyNo"]) return;
    // const en = JSON.stringify({
    //     // scene: SCENE_PLY_APP_READ,
    //     cAppNo: selected.value["cAppNo"],
    //     cOrgAppNo: cAppNo,
    //     cCiMrk: selected.value["cCiMrk"],
    //     cProdNo: selected.value["cProdNo"],
    //     cAppTyp: selected.value["cAppTyp"],
    //     cGrpMrk: selected.value["cGrpMrk"],
    //     cDptCde: selected.value["cDptCde"],
    //     cDptCnm: selected.value["cDptCnm"],
    //     pageType: "readonly",
    // });
    const en = JSON.stringify({
        // scene: SCENE_PLY_APP_READ,
        cAppNo,
        cOrgAppNo: cAppNo,
        cCiMrk: data.cCiMrk,
        cProdNo,
        cAppTyp: data.cAppTyp,
        cGrpMrk: data.cGrpMrk,
        cDptCde: data.cDptCde,
        cDptCnm: data.cDptCnm,
        cTermNme: data.cTermNme,
        cTermNo: data.cTermNo,
        // cProdNmeCn: data.cProdNmeCn,
        cPolicySource: data.cPolicySource,
        pageType: "readonly",
    });
    router.push({
        path: "/pcisapp/myPage",
        query: {
            param: en,
        },
    });
};

const openEdr = async (cAppNo, cPlyNo, cProdNo, cKindNo, data) => {
    handleRowClick(data);
    const rsnTyp = data['id'] && data['id'].length > 0 ? data['id'][0]?.split('-')[0] : null;
    if (null == data["cPlyNo"] || "" === data["cPlyNo"]) {
        ElMessage.warning("请选择一条记录");
        return;
    }
    // if (
    //     null == rsnCde.value[selected.value["cPlyNo"]] ||
    //     "" === rsnCde.value[selected.value["cPlyNo"]]
    // ) {
    //     ElMessage.warning("请选择批改原因");
    //     return;
    // }
    if (!data['id'] || data['id'].length < 2) {
        ElMessage.warning("请选择批改原因");
        return;
    }
    // if (
    //     DEFERRED_CORRECTION === rsnCde.value[selected.value["cPlyNo"]] &&
    //     "020027" === cProdNo
    // ) {
    //     ElMessage.warning("此产品暂不支持延期批改，请选择通用批改");
    //     return;
    // }
    if (
        DEFERRED_CORRECTION === data['id'][1] &&
        "020027" === cProdNo
    ) {
        ElMessage.warning("此产品暂不支持延期批改，请选择通用批改");
        return;
    }

    // 免费延期场景校验
    let isExtensionValid = true; // 校验结果默认通过
    if (data['id'][1] === "M1"  ) {
        console.log(data['id'][1])
        isExtensionValid = await initQuery(cPlyNo, cProdNo, data);
        if (!isExtensionValid) {
            return; // 校验不通过，拦截后续接口逻辑
        }
    }

 
    const param = {
        plyNo: cPlyNo,
        edrType: rsnTyp,
        prodNo: cProdNo,
        edrRsnCde: data['id'][1],
    };
 
    pcisEdrQueryService.validEndorse(param).then(
        async (result) => {
            if (200 !== result["code"]) {
                ElMessage.error(result["msg"]);
            } else {
                if (result["data"]) {
                    // debugger
                    // 如果选的批改原因是变更影像上传方式
                    if ("DZ" === data['id'][1]) {
                        modifyImageUploadMode(cPlyNo);
                        return;
                    } else if ("DP" === data['id'][1]) {
                        const cCiMrk = selected.value["cCiMrk"]
                        if (cCiMrk === '0' || cCiMrk === '5') {
                            ElMessage.error('非共保或司内联保保单不可以进行补充共保保单编号批改！');
                            return false;
                        }
                        ciCoopCorrect(cAppNo, cPlyNo)
                    } else if ("2" === rsnTyp) {
                        //注销
                        const en = JSON.stringify({
                            cAppNo: selected.value["cPlyNo"],
                            cOrgAppNo: cAppNo,
                            cRsnCde: data['id'][1],
                            cRsnDetailCde: data['iddetail'],
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
                            cPolicySource: selected.value["cPolicySource"],
                            nRecRemEstAmt: data?.nRecRemEstAmt || 0,
                            nRecRemPrm: data?.nRecRemPrm || 0,
                        });
                        //预留跳转路径
                        router.push({
                            path: "/pcisapp/myPage",
                            query: {
                                param: en,
                            },
                        });
                    } else if ("3" === rsnTyp) {
                        console.log("退保", selected.value);
                        //退保
                        const en = JSON.stringify({
                            cAppNo: selected.value["cPlyNo"],
                            cOrgAppNo: cAppNo,
                            cRsnCde: data['id'][1],
                            cRsnDetailCde: data['iddetail'],
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
                            cPolicySource: selected.value["cPolicySource"],
                            nRecRemEstAmt: data?.nRecRemEstAmt || 0,
                            nRecRemPrm: data?.nRecRemPrm || 0,
                        });
                        //预留跳转路径
                        router.push({
                            path: "/pcisapp/myPage",
                            query: {
                                param: en,
                            },
                        });
                    } else if ("1" === rsnTyp) {
                        //一般批改
                        const en = JSON.stringify({
                            // scene: SCENE_EDR_APP_NEW,
                            cAppNo: selected.value["cPlyNo"],
                            cOrgAppNo: cAppNo,
                            cRsnCde: data['id'][1],
                            cRsnDetailCde: data['iddetail'],
                            cProdNo: selected.value["cProdNo"],
                            cCiMrk: selected.value["cCiMrk"],
                            cGrpMrk: selected.value["cGrpMrk"],
                            cJiMrk: selected.value["cJiMrk"],
                            cDptCde: selected.value["cDptCde"],
                            cDptCnm: selected.value["cDptCnm"],
                            cEdrType: '1',
                            pageType: "EDR_APP_NEW_SCENE",
                            cTransMrk: selected.value["cTransMrk"],
                            cTermNme: selected.value["cTermNme"],
                            cTermNo: selected.value["cTermNo"],
                            cProdNmeCn: selected.value["cProdNmeCn"],
                            tInsrncBgnTm: selected.value["tInsrncBgnTm"],
                            tInsrncEndTm: selected.value["tInsrncEndTm"],
                            cPolicySource: selected.value["cPolicySource"],
                            nRecRemEstAmt: data?.nRecRemEstAmt || 0,
                            nRecRemPrm: data?.nRecRemPrm || 0,
                        });
                        console.log(en);
                        router.push({
                            path: "/pcisapp/myPage",
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

// 免费延期初始化校验 
const initQuery = async (cPlyNo, cProdNo, data) => {
    console.log('执行免费延期批改校验',); 
    
    try {   
        const countParam = { cPlyNo };
        const resCount = await getDelayCount(countParam); // 处理次数返回结果
        const count = resCount?.code === 200 ? resCount.res : 0;

        console.log('延期批改次数查询结果', resCount, '当前次数', parseInt(count));

        // 2. 校验承保机构分公司编码
        const cDptCde = data.cDptCde; // 从传入的 data 中获取机构编码
        const resCheck = await checkCdeptByCdptCde({ dptCde: cDptCde });
        const subSidiary = resCheck?.code === 200 ? resCheck.data : '';
        console.log( 'code--0',cProdNo,' 分公司编码查询结果 ', resCheck, ' 分公司编码 ', subSidiary);

        const resOff = await qryTerminationDataList({ cPlyNo: cPlyNo, cOperType: 'CancelM1' });
        console.log(666,resOff)
        if(resOff?.data?.[0]?.cAppTyp === 'on'){
             return false; 
        }else{

            if (cProdNo === '043009') {
                // 陕西分公司：次数不限，仅提示
                if (subSidiary === "0261010000000") {
                    
                    ElMessage.warning("陕西分公司免费延期批改次数不限！");
                    return true; 
                } else if (parseInt(count) === 2) {
                    // 第 3 次延期：提示后允许继续
                    ElMessage.warning("每单可延期批改 3 次，此次延期后不再允许免费延期批改！");
                    return true;  
                } else if (parseInt(count) >= 3) {
                    // 超过 3 次：拦截并提示
                    ElMessage.warning("已进行延期批改 3 次，不允许再进行此操作！");
                    return false;  
                }
            } else {
                // 其他产品规则
                if (parseInt(count) === 1) {
                    // 第 2 次延期：提示后允许继续
                    ElMessage.warning("每单可延期批改 2 次，此次延期后不再允许免费延期批改！");
                    return true;  
                } else if (parseInt(count) >= 2) {
                    // 超过 2 次：拦截并提示
                    ElMessage.warning("已进行延期批改 2 次，不允许再进行此操作！");
                    return false; 
                }
            }
        }

        return true;
    } catch (error) {
        // 异常场景：默认拦截，避免报错导致流程混乱
        console.error(' 免费延期校验异常 ', error);
        ElMessage.error("免费延期校验失败，请稍后重试！");
        return false;
    }
};


// //免费延期初始化校验
// const initQuery = async (cAppNo, cPlyNo, cProdNo, cKindNo, data) => {
//     console.log('免费延期批改方法')
//     var plyNo = cPlyNo;
//     var count = 0;
//     var cProdNo = cProdNo;
//     var cust_data = "plyNo=" + plyNo + "###CancelM1=" + 'CancelM1';

//     let countParam = {
//         cPlyNo: plyNo
//     }
//     let resCount = await getDelayCount(countParam);
//     if (resCount && resCount["code"] === 200) {
//         count = data
//     }
//     console.log('返回值1', resCount)

//     //获得当前承保机构的分公司编码。如：北京02、天津27、重庆15.
//     var cDptCde = data.cDptCde  //机构部门
//     var subSidiary = '';  //获取分公司机构代码

//     let resCheck = await checkCdeptByCdptCde({ dptCde: cDptCde });
//     console.log('返回值2', resCheck)
//     if (resCheck && resCheck["code"] === 200) {
//         subSidiary = data
//     }

//     if (false) {

//     } else {
//         if (cProdNo == '043009') {
//             if (subSidiary === "0261010000000") {//陕西分公司免费延期批改最长期限为1年，取消次数限制
//                 ElMessage.warning("陕西分公司免费延期批改次数不限！");
//             } else if (parseInt(count) == 2) {
//                 ElMessage.warning("每单可延期批改3次，此次延期后不再允许免费延期批改！");
//             } else if (parseInt(count) >= 3) {
//                 ElMessage.warning("已进行延期批改3次，不允许再进行此操作！");
//                 // window.close();
//                 return;
//             }
//         } else {
//             if (parseInt(count) == 1) {
//                 ElMessage.warning("每单可延期批改2次，此次延期后不再允许免费延期批改！");
//             } else if (parseInt(count) >= 2) {
//                 ElMessage.warning("已进行延期批改2次，不允许再进行此操作！");
//                 // window.close();
//                 return;
//             }
//         }
//     }

//     // //	tool.alert("延期批改次数方法");	
//     // 	var plyNo = tool.getAttrValue([dw["edrBase"]], "CPlyNo");
//     // 	var count = 0;
//     // 	var cProdNo = tool.getAttrValue([dw["edrBase"]], "CProdNo");
//     // 	var date = tool.getAttrValue([dw["edrBase"]])
//     // 	var cust_data = "plyNo="+plyNo+"###CancelM1="+'CancelM1';
//     // 	if(tool.sendXmlByService([], "endorseAppBizAction", "getDelayCount",plyNo)){
//     // 		count = tool.getResultMsg();
//     // 	}
//     //获得当前承保机构的分公司编码。如：北京02、天津27、重庆15.
//     //     var cDptCde = tool.getAttrValue([dw["edrBase"]], "CDptCde");//机构部门
//     //     var subSidiary ='';  //获取分公司机构代码

//     //     if(tool.sendXmlByServiceNoCheck([], 'policyAppBizAction','checkCdeptByCdptCde',cDptCde)){
//     //         subSidiary = tool.getResultMsg();
//     //     }
//     //     if(tool.sendXmlByService([],"endorseAppBizAction","checkCancelM1IsOff",cust_data)){
//     // //		tool.alert("绕过延期批改次数方法");	
//     // 		//任务表存在数据，则不校验倒签天数。
//     // 	}else{
//     // 		if(cProdNo=='043009'){
//     // 		    if(subSidiary === "0261010000000"){//陕西分公司免费延期批改最长期限为1年，取消次数限制
//     //                 tool.alert("陕西分公司免费延期批改次数不限！");
//     //             }else if(parseInt(count)==2){
//     // 				tool.alert("每单可延期批改3次，此次延期后不再允许免费延期批改！");
//     // 			}else if(parseInt(count)>=3){
//     // 				tool.alert("已进行延期批改3次，不允许再进行此操作！");	
//     // 				window.close();
//     // 				return;
//     // 			}
//     // 		} else {
//     // 			if(parseInt(count)==1){
//     // 				tool.alert("每单可延期批改2次，此次延期后不再允许免费延期批改！");
//     // 			}else if(parseInt(count)>=2){
//     // 				tool.alert("已进行延期批改2次，不允许再进行此操作！");	
//     // 				window.close();
//     // 				return;
//     // 			}
//     // 		}
//     // 	}
// }

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
    console.log(3333);

    dialog.value?.open('changeCiPolicynoComponent',
    { cAppNo, cPlyNo }, {}, { title: "变更联共保保单编号", width: "95" })
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
        cDptCde: user.value?.companyId,
    });
    setFormItem("cDptCde", {
        loadData: [
            {
                label: user.value?.companyId || '' + user.value?.companyCnm || '',
                value: user.value?.companyId,
            },
        ],
    });
    const param = {
			level: 2,
			cOperId: JSON.parse(sessionStorage.getItem("user")).opCde,
			cDptCde: JSON.parse(sessionStorage.getItem("user")).companyId,
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

:deep(.el-table__body .el-table__row .el-table__cell:first-child .cell) {
    white-space: break-spaces;
}

.copy-icon {
    margin-left: 5px;
    cursor: pointer;
    color: #409eff;
}

.policy-info-cell {
    display: flex;
    flex-direction: column;
}

.policy-number-row {
    display: flex;
    align-items: center;
    height: 16px;
}

.policy-number-row span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
}

:deep(.el-table th:nth-child(1) .cell) {
    white-space: pre-line;
}
</style>
