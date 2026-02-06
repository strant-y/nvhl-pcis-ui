<!-- 用户管理 -->
<template>
  <div>
    <el-container>
      <el-main>
        <el-container>
          <el-aside width="150px">
            <template v-for="(pageConfig, v) in formconfig1" :key="v">
              <el-affix :offset="150">
                <el-anchor :bound="120" :offset="80">
                  <!-- k.pageKey == 'relatedancillaryInfo' ? iscAffiliatedMrk : true -->
                  <el-anchor-link v-for="(k, i) in pageConfig?.pageInfo" :key="i"
                    v-show="k.pageKey === 'ReviewComments' ? isShowReview : k.pageKey === 'TestReport' ? isShowTest : true" :href="`#${k.pageKey}`">
                    {{ k.pageTtile }}
                  </el-anchor-link>
                </el-anchor>
              </el-affix>
            </template>
          </el-aside>
          <el-container>
            <el-main>
              <!-- v-show="k.pageKey == 'relatedancillaryinfo' ?iscAffiliatedMrk : true" -->
              <template v-for="(pageConfig, v) in formconfig1" :key="v">
                <div v-for="(k, i) in pageConfig?.pageInfo" :key="i" :id="k.pageKey"
                  v-show="k.pageKey === 'ReviewComments' ? isShowReview : k.pageKey === 'TestReport' ? isShowTest : true">
                  <!-- {{ k.pageKey }} -->
                  <component :ref="(res) => {
                    opertaor.addTableRef(k.pageKey, res);
                  }
                    " :is="k.pageRef + '-ref'" />
                </div>
              </template>
            </el-main>
          </el-container>
        </el-container>
      </el-main>
    </el-container>
    <el-footer>
      <!-- <div class="footer" v-if="queryParam.editType === 'edit' || queryParam.editType === 'add'">
       <el-button type="primary" @click="scrollToTop">一键回到顶部</el-button>
      <el-button type="primary" @click="saveAll">保存</el-button>
      <el-button type="primary" @click="saveAllSubmit">保存并提交审核</el-button>
      <el-button type="primary" @click="backClick">返回 </el-button>
    </div>

    <div class="footer" v-else >
      <el-button type="primary" @click="scrollToTop">一键回到顶部</el-button>
      <el-button type="primary" @click="backClick">返回 </el-button>
    </div> -->

      <div class="footer"
        v-if="queryParam.editType === 'add' || queryParam.editType === 'edit' || queryParam.editType === 'upload'">
        <el-button type="primary" @click="scrollToTop">一键回到顶部</el-button>
        <el-button type="primary" @click="saveAll(false)">保存</el-button>
        <el-button type="primary" @click="saveAllSubmit">保存并提交审核</el-button>
        <el-button type="primary" @click="backClick">返回 </el-button>
      </div>
      <div class="footer" v-else-if="queryParam.editType === 'handle'">
        <el-button type="primary" @click="scrollToTop">一键回到顶部</el-button>
        <el-button type="primary" @click="reViewClick">提交 </el-button>
        <el-button type="primary" @click="backClick">返回 </el-button>
      </div>
      <div class="footer" v-else>
        <el-button type="primary" @click="scrollToTop">一键回到顶部</el-button>
        <el-button type="primary" @click="backClick">返回 </el-button>
      </div>



    </el-footer>
  </div>
</template>

<script setup lang="ts">
import {  saveCommodityBase, commodityBaseOperatorCheck, saveRule, addProcessUndr, getCommodityBase, processApprove, getProcessInfo, getEdrNmeByCde } from "@/api/prod";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import {idxParamKey, IdxParamProps} from "@/views/pcis/support/useIdxParam";

import { useProductStore } from "@/store";
import { descryptParameter } from "@/utils/encipher";
const productStore = useProductStore();
const { iscAffiliatedMrk } = storeToRefs(productStore);
import { useRouter, useRoute } from 'vue-router';
const route = useRoute();
const query = ref(route.query);
const router = useRouter();
let isShowTest = ref(false)  // 用来控制显示审核信息模块
let TestData = ref({});  // 审核状态 返回数据 
let isShowReview = ref(false)  // 用来控制显示审核信息模块
let ProcessData = ref({});  // 审核状态 返回数据 
console.log(1,query.value?.param)
console.log(2,descryptParameter(query.value?.param))

const idxParam: IdxParamProps = {
  opertaorProps: { id: route.name },
  cdeListViewProps: { id: route.name },
  // handleAnchorClick: handleAnchorClick,
};
provide(idxParamKey, idxParam);
const opertaor = dataOpertaor(idxParam.opertaorProps);
opertaor.init();
const queryParam = JSON.parse(   query.value?.param ?  descryptParameter(query.value.param) : "{}");
const formconfig1 = opertaor.getTableConfig();

opertaor.setTableConfig([
  {
    groupId: "",
    showGroupId: false,
    pageInfo: {
      commodityBasicInfo: {
        pageKey: "commodityBasicInfo",
        pageTtile: "商品基本信息",
        pageRef: "commodityBasicInfo",
      },
      // relatedancillaryInfo: {
      //   pageKey: "relatedancillaryInfo",
      //   pageTtile: "关联附属信息",
      //   pageRef: "relatedancillaryInfo",
      // },
      choosePlan: {
        pageKey: "choosePlan",
        pageTtile: "选择方案",
        pageRef: "choosePlan",
      },

      // relatedHealthNotify: {
      //   pageKey: "relatedHealthNotify",
      //   pageTtile: "关联健康告知",
      //   pageRef: "relatedHealthNotify",
      // },
      // fileList: {
      //   pageKey: "fileList",
      //   pageTtile: "文件上传",
      //   pageRef: "fileList",
      // },
      permissionAllo: {
        pageKey: "permissionAllo",
        pageTtile: "出单权限分配",
        pageRef: "permissionAllo",
      },
      InsuranceRules: {
        pageKey: "InsuranceRules",
        pageTtile: "投保规则",
        pageRef: "InsuranceRules",
      },
      TestReport: {
        pageKey: "TestReport",
        pageTtile: "测试报告",
        pageRef: "TestReport",
      },
      ReviewComments: {
        pageKey: "ReviewComments",
        pageTtile: "审核意见",
        pageRef: "ReviewComments",
      },


      // commonProblem: {
      //   pageKey: "commonProblem",
      //   pageTtile: "常见问题配置",
      //   pageRef: "commonProblem",
      // },
    },
  },
]);

const btns = {};


// 审核提交
const reViewClick = async () => {
  const tabref5 = opertaor.getTableRefByKey("ReviewComments");  // 审核信息
  const isValid = await validateSingleForm(tabref5);
  if (!isValid) {
    ElMessage.error('请填写审核信息!');
    return false;
  }

  let params = {
    cType: ProcessData.value?.cType,
    cRelNo: ProcessData.value?.cRelNo,
    id: ProcessData.value?.cPkId,
    ...tabref5.getFromValue()
  }

  processApprove(params).then((res) => {
    let { code, msg, data } = res;
    if (code === 200) {
      ElMessage.success('审核成功');
      router.go(-1)
    }

  })
}

// 根据cpkid 查询审核状态   审核时请求
const processinfoQuery = () => {
  const tabref5 = opertaor.getTableRefByKey("ReviewComments");  // 审核信息
  getProcessInfo({ id: queryParam.cPkId })
    .then((res) => {
      const { code, data, msg } = res;
      if (200 === code) {
        let cUndrStatus = data['data'].cUndrStatus;
        if (data['data']) {
          ProcessData.value = data['data']
          tabref5.setFormItem('cUndrStatus', {
            loadData: [
              { value: '6', label: '已发布' },
            ],
          })

          switch (cUndrStatus) {
            case '1': // 一级审核
              tabref5.setFormItem('cUndrStatus', {
                loadData: [
                  { value: '2', label: '发测试' },
                  { value: '3', label: '发测试(信息补充)' },
                  { value: '0', label: '驳回' }
                ],
              })


              break;
            case '4': // 二级审核
              tabref5.setFormItem('cUndrStatus', {
                loadData: [
                  { value: '5', label: '提交发布' },
                  { value: '2', label: '驳回至测试' },
                  { value: '3', label: '驳回至测试(信息补充)' },
                ],
              })

              break;
            case '5': // IT审核
              tabref5.setFormItem('cUndrStatus', {
                loadData: [
                  { value: '6', label: '已发布' },
                ],
              })
              break;
          }

          if (queryParam.editType === 'review') {
            tabref5.setFormValue(data['data'])
            tabref5.setDisabledAll()
          }
        }
      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => { });
}


// 反显查询
function handleQuery() {
  const tabref = opertaor.getTableRefByKey("commodityBasicInfo");  // 基本信息
  const tabref2 = opertaor.getTableRefByKey("choosePlan");  // 选择方案
  const tabref3 = opertaor.getTableRefByKey("permissionAllo");  // 出单权限分配
  const tabref4 = opertaor.getTableRefByKey("InsuranceRules");  // 投保规则
  const tabref6 = opertaor.getTableRefByKey("TestReport");  // 测试规则
  const newparam = { cCommodityNo: queryParam.cCommodityNo };
  getCommodityBase(newparam)
    .then((res) => {
      const { code, data, msg } = res;
      if (200 === code) {
        let dataS = data['result'][0];
        let cStatus = data['result'][0]['cStatus'];
        tabref.setFormValue(data['result'][0])

        //  出单权限分配 数据回显
        getNmeByCde(dataS.cPertainDptCde, "cPertainDptCde", "permissionAllo")
        tabref3.setValue('cPertainDptCde', dataS.cPertainDptCde);
        tabref3.setValue('cBsnsTyp', dataS.cBsnsTyp);
        tabref3.setValue('cChaType', dataS.cChaType);
        tabref3.setValue('cChaSubType', dataS.cChaSubType);
        getNmeByCde(dataS.cDptCde, "cDptCde", "permissionAllo")
        tabref3.setValue('cDptCde', dataS.cDptCde);

        // 出单员
        tabref3.setValue('cOperId', dataS.cOperId);
        let cOperNme =  dataS.cOperNme? dataS.cOperNme:'';
            tabref3.setFormItem("cOperId", {
                    loadData: [
                      {
                        label:dataS.cOperId + cOperNme ,
                        value: dataS.cOperId,
                      },
                    ],
                  });
        // tabref3.setValue('cSlsGroup', dataS.cSlsGroup);

        // 业务员/产险专员
        tabref3.setValue('cSlsId', dataS.cSlsId);
        let cSlsNme =  dataS.cSlsNme? dataS.cSlsNme:'';
        tabref3.setFormItem("cSlsId", {
                  loadData: [
                    {
                      label: dataS.cSlsId + cSlsNme,
                      value: dataS.cSlsId,
                    },
                  ],
                });          

        // 代理人/经纪人
        tabref3.setValue('cBrkrCde', dataS.cBrkrCde);
        let cBrkrName =  dataS.cBrkrName?dataS.cBrkrName: '' 
          tabref3.setFormItem("cBrkrCde", {
                  loadData: [
                    {
                      label: dataS.cBrkrCde +cBrkrName ,
                      value: dataS.cBrkrCde,
                    },
                  ],
                });        


        tabref3.setValue('cAgtAgrNo', dataS.cAgtAgrNo);
        tabref3.setValue('nPropFeeRate', dataS.nPropFeeRate);
        tabref3.setValue('cBusinessTel', dataS.cBusinessTel);
        tabref3.setValue('cEvenJointTel', dataS.cEvenJointTel);
        
        // 业务员
         tabref3.setValue('cBrkSlsCde', dataS.cBrkSlsCde);
         let cBrkSlsName = dataS.cBrkSlsName? dataS.cBrkSlsName : ''
        tabref3.setFormItem("cBrkSlsCde", {
                        loadData: [
                          {
                            label:  dataS.cBrkSlsCde + cBrkSlsName ,
                            value:  dataS.cBrkSlsCde
                          },
                        ],
                      });
   
        
        TestData.value = data['result'][0];

        //  测试报告说明
        tabref6.setValue('cTestReport', dataS.cTestReport)
        if (queryParam.editType === "edit") {
          isShowTest.value = cStatus == '3' || cStatus == '6' || cStatus == '2' ? true : false;
        } else if (queryParam.editType === "upload") {
          isShowTest.value = true
        } else {
          isShowTest.value = cStatus == '2' || cStatus == '3' || cStatus == '4' || cStatus == '5' || cStatus == '6' ? true : false;
          tabref6.setDisabledAll()
        }
      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => { });
}


// 全部保存
const saveAll = async (call) => {
  const tabref = opertaor.getTableRefByKey("commodityBasicInfo");  // 基本信息
  const tabref2 = opertaor.getTableRefByKey("choosePlan");  // 选择方案
  const tabref3 = opertaor.getTableRefByKey("permissionAllo");  // 出单权限分配
  const tabref4 = opertaor.getTableRefByKey("InsuranceRules");  // 投保规则
  const tabref6 = opertaor.getTableRefByKey("TestReport");  // 测试规则
  let isValid = await validateForm();
  // 方案基本信息检查
  if (!isValid) {
    return;
  } else {

    const user = JSON.parse(sessionStorage.getItem("user"));
    let param = null;
    param = Object.assign({
      cCrtCde: user.opCde,
      cUpdCde: user.opCde,
    }, tabref.getFromValue(), tabref3.getFromValue(), tabref6.getFromValue());
    const chkParam = {
      cCommodityNo: tabref.getFromValue().cCommodityNo,
      checkType: 'saveAll',
      //           oldDptCde: this.dptCde,
      newDptCde: tabref3.getFromValue().CDptCde,
    };

    await commodityBaseOperatorCheck(chkParam).then((res) => {
      let { code, msg, data } = res;
      if (code === 200) {
        if (data.data.length > 0) { // 有 则中断
          ElMessage.error('该方案号存在有效的再保分保配置，不能进行无效操作，若需置为无效，请联系再保部对该方案号的分保配置做无效处理！');
          return;
        } else {

          save(call, param)  // 保存接口
        }
      } else {
        ElMessage.error(msg)
      }
    });
  }

}

//  保存接口
const save = (call, param: any) => {
  const tabref = opertaor.getTableRefByKey("commodityBasicInfo");  // 基本信息
  if (!!call) {
    // return false;
    if ('0' === param['cStatus']) {
      param['cStatus'] = '1'; // 一级审核
    } else {
      param['cStatus'] = '4'; // 二级审核
    }
  }
  saveCommodityBase(param).then((res) => {
    let { code, msg, data } = res;
    console.log('保存后返回的 save', res)
    if (code === 200) {
      ElMessage.success(msg);   // 保存成功

      // 补分功能不可修改
      tabref.setFormItem('cKindNo', {
        disabled: true,
      })
      tabref.setFormItem('cProdNo', {
        disabled: true,
      })
      tabref.setFormItem('cAffiliatedMrk', {
        disabled: true,
      })

      // "产品承保限制" 选 "是" 才保存投保规则
      if (tabref.getFromValue()['cPolicyLimit']) {
        InsuranceSaveData();
      }
      // 保存并提交
      if (!!data['data'] && !!data['data']['cCommodityNo']) {
        if (!!call) {
          call(data['data']['cCommodityNo'], data['data']['cStatus']);
        }
      }
    }
  })
}

// 投保规则 保存
const InsuranceSaveData = () => {
  const user = JSON.parse(sessionStorage.getItem("user"));
  const tabref = opertaor.getTableRefByKey("commodityBasicInfo");  // 基本信息
  const tabref4 = opertaor.getTableRefByKey("InsuranceRules");  // 投保规则

  const param = Object.assign({
    cCrtCde: user.opCde,
    cUpdCde: user.opCde,
    cCommodityNo: tabref.getFromValue().cCommodityNo,
  }, tabref4.getFromValue());
  saveRule(param).then((res) => {
    let { code, data, msg } = res;
    if (code === 200) {
      ElMessage.success(msg);
    } else {
      ElMessage.error(msg);
    }

  })
}

// 保存并提交按钮
const saveAllSubmit = async () => {

  let isValid = await validateForm();
  // 方案基本信息检查
  if (!isValid) {
    return;
  } else {

    const call = (commodityNo, status) => {

      const param = {
        cUndrStatus: status, // 目标审核状态
        cUndrDesc: '提交审核',
        cType: 'COMMODITY',
        cRelNo: commodityNo
      };
      addProcessUndr(param).then((res) => {
        let { code, data, msg } = res;
        if (code === 200) {
          ElMessage.success(msg); // 保存成功

          // 跳转
          //返回上个页面
          router.go(-1)

        } else {
        }
      })
    }
    saveAll(call);

  }
}


// 校验单个表单的辅助函数
const validateSingleForm = (formRef: any) => {
  return new Promise((resolve) => {
    // formRef.validate().then((valid) => resolve(valid));
    formRef.validate().then((valid: any) => {
      resolve(valid)
    })
  });
};

// 表单验证
const validateForm = async () => {
  const tabref = opertaor.getTableRefByKey("commodityBasicInfo");  // 基本信息
  const tabref2 = opertaor.getTableRefByKey("choosePlan");  // 选择方案
  const tabref3 = opertaor.getTableRefByKey("permissionAllo");  // 出单权限分配
  const tabref4 = opertaor.getTableRefByKey("InsuranceRules");  // 投保规则
  let choosePlanList = tabref2.getTableValue()
  // const tabref4 = opertaor.getTableRefByKey("InsuranceRules");  // 投保规则
  // const tabref5= opertaor.getTableRefByKey("commonProblem");  // 常见问题配置


  let v = false; // 没有错误  
  const formRefs = [tabref, tabref2, tabref3, tabref4]

  for (let i = 0; i < formRefs.length; i++) {
    const formRef = formRefs[i]

    try {
      if (i === 0) {
        const isValid = await validateSingleForm(formRef)
        if (!isValid) {
          ElMessage.error('商品基本信息表单验证失败,请修正');
          return false;
        }
        if (choosePlanList.length < 1) {
          ElMessage.error('未关联附属信息！');
          return false;
        }
        continue;
      }


      const isValid = await validateSingleForm(formRef);
      if (!isValid) {
        if (i === 1) {
        } else if (i === 2) {
          ElMessage.error('出单权限分配表单验证失败,请修正');
        }
        return false;
      }

    } catch (error) {
      // 处理验证过程中的异常
      ElMessage.error(`验证过程出错，请重试`)
      return false
    }
  }
  if (choosePlanList.length > 0) {
    for (let i = 0; i < choosePlanList.length; i++) {
      const cPlanNo = choosePlanList[i]['cPlanNo'];
      const cSaleName = choosePlanList[i]['cSaleName'];
      if (cSaleName === '' || cSaleName == null) {
        ElMessage.warning('方案号：' + cPlanNo + '，对应的销售名称为空，请补充！');
        return false;
      }
    }
  }


  return true;
}
const initInfo = () => {

}


const backClick = () => {
  //返回上个页面
  router.go(-1)
}

onMounted(async () => {
  // 商品  编辑  查看   处理  查看 queryParam.editType === "edit" || queryParam.editType === 'view' || queryParam.editType === 'handle' ||  queryParam.editType === 'review'
  if (queryParam.editType !== 'add' && queryParam.editType) {
    handleQuery();
  }
  if (queryParam.editType === 'handle' || queryParam.editType === 'review') {
    isShowReview.value = true;
    processinfoQuery()

    // if( queryParam.editType === 'review'){
    //   const tabref5 = opertaor.getTableRefByKey("ReviewComments");  // 审核信息
    //    tabref5.setDisabledAll()
    // }    
  }
});
// 根据机构编码获取机构名称
const getNmeByCde = async(val:any, key: string, pageKey: string) => {
  if(val) {
    const tabref = opertaor.getTableRefByKey(pageKey);
    await getEdrNmeByCde({
      code: "orgDpt",
      val: val
    }).then((res:any) => {
      if (res.code === 200 && res.data && res.data.data) {
        tabref.setFormItem(key, {
          loadData: [
            { value: val, label: val+res.data.data }
          ],
        });
      }
    });
  }
}

function setData(datas: any) {
  Object.keys(datas).forEach((k) => {
    const ref = opertaor.getTableRefByKey(k);
    ref.setFormValue(datas[k]);
  });
}
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.el-main {
  flex: 1;
}

.el-footer {
  margin-top: auto;
  background-color: #f5f7fa;
  padding: 10px;
  text-align: right;
}

.footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.footer .el-button {
  margin-left: 10px;
}
</style>
