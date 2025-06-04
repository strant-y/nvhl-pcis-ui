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
                <el-anchor-link v-for="(k, i) in pageConfig?.pageInfo" :key="i"
                  v-show="k.pageKey == 'relatedancillaryInfo' ? iscAffiliatedMrk : true" :href="`#${k.pageKey}`"  >
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
              v-show="k.pageKey === 'ReviewComments' ? isShowReview : true"
              >
                {{ k.pageKey }}
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

    <div class="footer">
       <el-button type="primary" @click="scrollToTop">一键回到顶部</el-button>
      <el-button type="primary" @click="saveAll">保存</el-button>
      <el-button type="primary" @click="saveAllSubmit">保存并提交审核</el-button>
      <el-button type="primary" @click="backClick">返回 </el-button>
      <el-button type="primary" @click="reViewClick">提交 </el-button>

    </div>


  </el-footer>
</div>
</template>

<script setup lang="ts">
import { getProdInfos, saveProInfo, saveCommodityBase, commodityBaseOperatorCheck, saveRule, addProcessUndr,getCommodityBase,processApprove,getProcessInfo } from "@/api/prod";
import { dataOpertaor } from "@/store/modules/data-opertaor";
const opertaor = dataOpertaor();
opertaor.init();

import { useProductStore } from "@/store";
const productStore = useProductStore();
const { iscAffiliatedMrk } = storeToRefs(productStore);
import { useRouter, useRoute } from 'vue-router';
const route = useRoute();
const query = ref(route.query);

const router = useRouter();
let isShowReview = ref(false)

const queryParam = JSON.parse(query.value?.param ? String(query.value.param) : "{}");
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
const tabref = opertaor.getTableRefByKey("commodityBasicInfo");  // 基本信息
const tabref5 = opertaor.getTableRefByKey("ReviewComments");  // 审核信息

  
 
// 审核提交
const reViewClick = ()=>{
// {"CType":"COMMODITY","CRelNo":"S25000067","id":"Process2500192","CUndrStatus":"3","CUndrDesc":"发测试(信息补充)132123123123123"}
  let params  = {
    cType: 'COMMODITY' ,
    cRelNo: tabref.getFromValue().cCommodityNo,
    id: 'Process2500192',
    cUndrStatus: '3',
    cUndrDesc: '发测试(信息补充)132123123123123'
    
  }
  processApprove(param).then((res) => {
    let { code, msg, data } = res;

    console.log('审核 提交 save',res)
    if (code === 200) {}
 
  })
}


// 反显查询
function handleQuery() {
  const tabref = opertaor.getTableRefByKey("commodityBasicInfo");  // 基本信息
  const tabref2 = opertaor.getTableRefByKey("choosePlan");  // 选择方案
  const tabref3 = opertaor.getTableRefByKey("permissionAllo");  // 出单权限分配
  const tabref4 = opertaor.getTableRefByKey("InsuranceRules");  // 投保规则


  console.log("param", tabref);
  const newparam = { cCommodityNo: queryParam.cCommodityNo };
  getCommodityBase(newparam)
    .then((res) => {
      const { code, data, msg } = res;
      console.log('数据',res)
      if (200 === code) {
        // freeEditRef?.value?.setFormValue(data['result'][0]);
        tabref.setFormValue(data['result'][0])
        tabref3.setFormValue(data['result'][0])
        // freeEditRef.value?.setDisabledAll();
      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => { });
}


// 全部保存
const saveAll = async (call?) => {
  const tabref = opertaor.getTableRefByKey("commodityBasicInfo");  // 基本信息
  const tabref2 = opertaor.getTableRefByKey("choosePlan");  // 选择方案
  const tabref3 = opertaor.getTableRefByKey("permissionAllo");  // 出单权限分配
  const tabref4 = opertaor.getTableRefByKey("InsuranceRules");  // 投保规则

  console.log(44,)
  console.log(tabref3.getFromValue().cDptCde)
  console.log(tabref4.getFromValue())
  let isValid = await validateForm();

  console.log(111, isValid)
  // validateForm
  // 方案基本信息检查
  if (!isValid) {

    console.log('验证不通过')
    return;
  } else {


    // const newParam = {
    //   ...formData,
    //   cCrtCde: user.opCde,
    //   cUpdCde: user.opCde,

    // const tabref = opertaor.getTableRefByKey("commodityBasicInfo");
    // const permissionAllo = opertaor.getTableRefByKey("permissionAllo");
    //   console.log(  tabref.getFromValue())
    // console.log(permissionAllo.getFromValue())

const user = JSON.parse(sessionStorage.getItem("user"));
    let param = null;
    param = Object.assign({
      cCrtCde: user.opCde,
      cUpdCde: user.opCde,
    }, tabref.getFromValue(),
      tabref3.getFromValue(),
      // tabref4.getFromValue()
    );


    // if ('1' === this.commodityType) {
    //   param = Object.assign({
    //     CCrtCde: user.opCde,
    //     CUpdCde: user.opCde,
    //   }, tabref.getFormData(),
    //     this.testOfCommodityComponent.getFormData(),
    //     this.roleOfCommodityComponent.getFormData());
    // } else {
    //   param = Object.assign({
    //     CCrtCde: this.user.opCde,
    //     CUpdCde: this.user.opCde
    //   }, this.baseOfCommodityComponent.getFormData(),
    //     !!this.elementOfCommodityComponent ? this.elementOfCommodityComponent.getFormData() : {},
    //     this.testOfCommodityComponent.getFormData(),
    //     this.roleOfCommodityComponent.getFormData());
    // }

    const chkParam = {
      cCommodityNo: tabref.getFromValue().cCommodityNo,
      checkType: 'saveAll',
      //           oldDptCde: this.dptCde,
      newDptCde: tabref3.getFromValue().CDptCde,
    };

    // checkType: 'saveAll',
    //           oldDptCde: this.dptCde,
    //           newDptCde: param.CDptCde,
    //           CCommodityNo: param.CCommodityNo,


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
    if ('0' === param['cStatus']) {
      param['cStatus'] = '1'; // 一级审核
    } else {
      param['cStatus'] = '4'; // 二级审核
    }
  }

  console.log('参数-----',param)
  saveCommodityBase(param).then((res) => {
    let { code, msg, data } = res;

    console.log('保存后返回的 save',res)
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
  // const v = this.freeEdit.validateForm(); 
  // if (v) {
  //     this.msg.warning('表单验证失败,请修正', { nzDuration: 3000 });
  //     return;
  // }

  const param = Object.assign({
    cCrtCde: user.opCde,
    cUpdCde: user.opCde,
    cCommodityNo: tabref.getFromValue().cCommodityNo,
  }, tabref4.getFromValue());
  // if (!!this.CCommodityNo) {
  //     param['CCommodityNo'] = this.CCommodityNo;
  // }
  // const saveProdData = this.commodityService.saveRule(param);
  // saveProdData.subscribe((res: any) => {
  //     console.log('resresresresres', res);
  //     if (null != res && null != res['code']) {
  //         if (res['code'] === 200) {
  //             this.msg.success(res['msg'], { nzDuration: 3000 });
  //             // 回显保存后生成的信息
  //             this.form._loadData(res['data']);
  //         } else {
  //             this.msg.error(res['msg'], {nzDuration: 3000});
  //         }
  //     }
  // });

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

  console.log(111, isValid)

  // 方案基本信息检查
  if (!isValid) {

    console.log('验证不通过')
    return;
  } else {

    const call = (commodityNo, status) => {

      const param = {
        cUndrStatus: status, // 目标审核状态
        cUndrDesc: '提交审核',
        cType: 'COMMODITY',
        cRelNo: commodityNo
      };


      // const saveProdData = this.commodityService.addProcessUndr(param);
      // saveProdData.subscribe((res: any) => {
      //   if (null != res && null != res['code']) {
      //     if (res['code'] === 200) {
      //       const data = res['data'];
      //       if ('1' === data['code']) { // 保存成功
      //         this.msg.success(data['message'], { nzDuration: 3000 });
      //         if (!!this.from) {
      //           this.router.navigate([this.from]);
      //         }
      //       } else {
      //         this.msg.error(data['message'], { nzDuration: 3000 });
      //       }
      //     }
      //   }
      // });

      // addProcessUndr
      addProcessUndr(param).then((res) => {
        let { code, data, msg } = res;
        console.log('')
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


  console.log('校验', tabref2.getTableValue())
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
        console.log('长度', choosePlanList)
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
      console.error(`验证第${i + 1}个表单时出错:`, error)
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


const backClick = ()=>{
      //返回上个页面
      router.go(-1)
}

onMounted(async () => {
  
  console.log('queryParam',queryParam)
  // getProdInfos(queryParam)
  //   .then((res) => {
  //     const { code, data, msg } = res;
  //     if (200 === code) {
  //       setTimeout(() => {
  //         setData(data.data);
  //       }, 100);
  //     } else {
  //       ElMessage.error(msg);
  //     }
  //   })
  //   .finally(() => { });
  // console.log(param);
  if (queryParam.editType === "edit" || queryParam.editType === 'view' ||queryParam.editType === 'review' ) {

    handleQuery();
  }
  
  if(queryParam.editType === 'review'){
    console.log(queryParam.cPkId)
  getProcessInfo({id:queryParam.cPkId})
    .then((res) => {
      const { code, data, msg } = res;

       console.log('商品配置流程',   res)
      if (200 === code) {
        
      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => { });
  }
});

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
