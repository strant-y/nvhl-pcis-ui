<!-- 用户管理 -->
<template>
  <el-container>
    <el-main>
      <el-container>
        <el-aside width="150px">
          <template v-for="(pageConfig, v) in formconfig1" :key="v">
            <el-affix :offset="150">
              <el-anchor :bound="120" :offset="80">
                <el-anchor-link v-for="(k, i) in pageConfig?.pageInfo" :key="i"    v-show="k.pageKey == 'relatedancillaryInfo' ?iscAffiliatedMrk : true"  :href="`#${k.pageKey}`">
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
              v-show="k.pageKey == 'relatedancillaryInfo' ?iscAffiliatedMrk : true" 
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
    <div class="footer">
      <el-button type="primary" @click="scrollToTop">一键回到顶部</el-button>
      <el-button type="primary" @click="saveAll">保存</el-button>
      <el-button type="primary">保存并提交审核</el-button>
      <el-button type="primary" @click="validateForm">返回（{{iscAffiliatedMrk}}）</el-button>
    </div>
  </el-footer>
</template>

<script setup lang="ts">
import { getProdInfos, saveProInfo } from "@/api/prod";
import { useRoute } from "vue-router";
import { dataOpertaor } from "@/store/modules/data-opertaor";
const opertaor = dataOpertaor();
opertaor.init();

import { useProductStore } from "@/store";
const productStore = useProductStore();
const { iscAffiliatedMrk } = storeToRefs(productStore);


// const tabref2 = opertaor.getTableRefByKey("permissionAllo");


const route = useRoute();
const query = ref(route.query);

const param = JSON.parse(query.value?.param ? String(query.value.param) : "{}");
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
      relatedancillaryInfo: {
        pageKey: "relatedancillaryInfo",
        pageTtile: "关联附属信息",
        pageRef: "relatedancillaryInfo",
      },
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
      // commonProblem: {
      //   pageKey: "commonProblem",
      //   pageTtile: "常见问题配置",
      //   pageRef: "commonProblem",
      // },
    },
  },
]);

const btns = {};


// 全部保存
// const saveAll = ()=>{
//   const tabref = opertaor.getTableRefByKey("commodityBasicInfo");
//   const permissionAllo = opertaor.getTableRefByKey("permissionAllo");
//     console.log(  tabref.getFromValue())
//     // console.log(permissionAllo.getFromValue())
// }


const saveData = (call?) => {
  // 方案基本信息检查
  if (!this.validateForm()) {
    return;
  }
  let param = null;
  if ('1' === this.commodityType) {
    param = Object.assign({
      CCrtCde: this.user.opCde,
      CUpdCde: this.user.opCde
    }, this.baseOfCommodityComponent.getFormData(),
      this.testOfCommodityComponent.getFormData(),
      this.roleOfCommodityComponent.getFormData());
  } else {
    param = Object.assign({
      CCrtCde: this.user.opCde,
      CUpdCde: this.user.opCde
    }, this.baseOfCommodityComponent.getFormData(),
      !!this.elementOfCommodityComponent ? this.elementOfCommodityComponent.getFormData() : {},
      this.testOfCommodityComponent.getFormData(),
      this.roleOfCommodityComponent.getFormData());
  }
  this.commodityService.commodityBaseOperatorCheck({
    checkType: 'saveAll',
    oldDptCde: this.dptCde,
    newDptCde: param.CDptCde,
    CCommodityNo: param.CCommodityNo,
  }).subscribe(chkRes => {
    if (!!chkRes['data']) {
      if (this.dptCde !== param.CDptCde && !!chkRes['data']['updateDpt']) {
        this.msg.error('该商品号存在有效的再保分保配置记录，不能直接切换机构，请联系再保部先对分保配置做无效处理！', { nzDuration: 3000 });
        return;
      }
      if (moment(new Date()).isBefore(moment(this.endDate)) && moment(param.TEndTm).isBefore(moment(new Date()))
        && !!chkRes['data']['commodityIsValid']) {
        this.msg.error('方案号[' + chkRes['data']['commodityIsValid'].map((obj) => obj.CPlanNo).join(', ') + ']存在有效的再保分保配置，不能进行无效操作，若需置为无效，请联系再保部对该方案号的分保配置做无效处理！', { nzDuration: 2500 });
        return;
      } else if (moment(this.endDate).isBefore(moment(new Date())) && moment(new Date()).isBefore(moment(param.TEndTm))
        && !!chkRes['data']['commodityNoValid']) {
        this.msg.warning(
          '方案号[' + chkRes['data']['commodityNoValid'].map((obj) => obj.CPlanNo).join(', ') + ']存在无效的再保分保配置记录，若该类业务需分保，请联系再保部对该方案进行分保配置！'
          , { nzDuration: 3000 });
      }
    }
    this.endDate = param.TEndTm;
    this.save(call, param);
  });


}

// save(call, param) {
//     const btn = this.baseOfCommodityComponent.config.getBtnById('baseSave');
//     const saveBtn = this.getBtn('btn010101');
//     const saveBtn2 = this.getBtn('btn010102');
//     saveBtn.beginLoading();
//     saveBtn2.beginLoading();
//     btn.beginLoading();
//     // 提交核保时修改状态
//     if (!!call) {
//         if ('0' === param['CStatus']) {
//             param['CStatus'] = '1'; // 一级审核
//         } else {
//             param['CStatus'] = '4'; // 二级审核
//         }
//     }
//     const saveProdData = this.commodityService.saveCommodityBase(param);
//     saveProdData.subscribe((res: any) => {
//         saveBtn.endLoading();
//         saveBtn2.endLoading();
//         btn.endLoading();
//         if (null != res && null != res['code']) {
//             if (res['code'] === 200) {
//                 const data = res['data'];
//                 if ('1' === data['code']) { // 保存成功
//                     this.msg.success(data['message'], {nzDuration: 3000});
//                     // 回显保存后生成的信息
//                     this.baseOfCommodityComponent.form._loadData(data['data']);
//                     this.roleOfCommodityComponent.form._loadData(data['data']);
//                     this.dptCde = data['data'].CDptCde; // 更新 当前出单机构
//                     // 险类和险种信息保存后就不可更改了
//                     this.baseOfCommodityComponent.freeEdit.controls['CKindNo'].readOnly = true;
//                     this.baseOfCommodityComponent.freeEdit.controls['CProdNo'].readOnly = true;
//                     this.baseOfCommodityComponent.freeEdit.controls['CAffiliatedMrk'].readOnly = true;
//                     this.baseOfCommodityComponent.form.detectChanges();
//                     this.roleOfCommodityComponent.form.detectChanges();
//                     // 保存关联信息
//                     if (!!data['data'] && !!data['data']['CCommodityNo']) {
//                         // "产品承保限制" 选 "是" 才保存投保规则
//                         if (!!data['data']['CPolicyLimit'] && '1' === data['data']['CPolicyLimit']) {
//                             this.ruleOfCommodityComponent.saveData();
//                         }
//                         if (!!call) {
//                             call(data['data']['CCommodityNo'], data['data']['CStatus']);
//                         }
//                     }
//                 } else {
//                     this.msg.error(data['message'], {nzDuration: 3000});
//                 }
//             }
//         }
//     });
// }


// 表单验证
const validateForm = async () => {
  const tabref = opertaor.getTableRefByKey("commodityBasicInfo");  // 基本信息
  // const tabref2 = opertaor.getTableRefByKey("choosePlan");  // 选择方案
  const tabref3 = opertaor.getTableRefByKey("permissionAllo");  // 出单权限分配
  // const tabref4 = opertaor.getTableRefByKey("InsuranceRules");  // 投保规则
  // const tabref5= opertaor.getTableRefByKey("commonProblem");  // 常见问题配置
  let v = false; // 没有错误  validate
  //  ;
  //          tabref.validate().then((vvv) => {
  //           console.log(  33,vvv )
  //           ElMessage.success("保存成功");
  //           ab = vvv
  //           return false;
  //           // if(vvv){}

  //         })

  // let bb =  tabref.validate();


  // ElMessage.success("保存成功2");
  const formRefs = [tabref, tabref3]

  for (let i = 0; i < formRefs.length; i++) {
    const formRef = formRefs[i]

    try {
      // 执行表单验证
      const isValid = await new Promise<boolean>((resolve) => {
        formRef.validate().then((valid) => {
          resolve(valid)
        })
        // formRef.value?.validate((valid) => {
        //   resolve(valid)
        // })
      })

      if (!isValid) {
        // 验证失败，显示对应表单的错误提示
        if (i === 0) {
          ElMessage.error('商品基本信息表单验证失败,请修正');
        } else if (i === 1) {
          ElMessage.error('出单权限分配表单验证失败,请修正');
          // ElMessage.error('未关联附属信息！');
          // ElMessage.error('未关联方案信息！');
          // ElMessage.error('出单权限分配表单验证失败,请修正');

        }

        // 滚动到第一个验证失败的表单
        // formRef.value?.$el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        return false // 终止验证过程
      }
    } catch (error) {
      // 处理验证过程中的异常
      console.error(`验证第${i + 1}个表单时出错:`, error)
      ElMessage.error(`验证过程出错，请重试`)
      return false
    }
  }

  

  return false;
  // 基本信息
  v = this.baseOfCommodityComponent.form.validateForm();

  if (v) {
    this.baseOfCommodityComponent.form.detectChanges();
    this.msg.warning('商品基本信息表单验证失败,请修正', { nzDuration: 3000 });
    return false;
  }
  // 附属信息
  if ('1' === this.CAffiliatedMrkValue) {
    const attachedLength = this.attachedOfCommodityComponent._dataSet.length;
    console.log('附属信息', this.attachedOfCommodityComponent._dataSet);
    if (0 === attachedLength) {
      this.msg.warning('未关联附属信息！', { nzDuration: 3000 });
      return false;
    }
  }

  // 方案
  const planLength = this.planOfCommodityComponent._dataSet.length;
  console.log('方案信息', this.planOfCommodityComponent._dataSet);
  if (0 === planLength) {
    this.msg.warning('未关联方案信息！', { nzDuration: 3000 });
    return false;
  }
  // 页面要素验证
  /*if ('1' !== this.commodityType) {
      const  elementOfCommodity =  this.elementOfCommodityComponent.getFormData();
      if ('' === elementOfCommodity['CCommodityElement']) {
          this.msg.warning('页面要素表单验证失败,请修正', { nzDuration: 3000 });
          return false;
      }
  }*/
  // 出单权限信息
  v = this.roleOfCommodityComponent.form.validateForm();
  if (v) {
    this.roleOfCommodityComponent.form.detectChanges();
    this.msg.warning('出单权限分配表单验证失败,请修正', { nzDuration: 3000 });
    return false;
  }
  const formData = this.planOfCommodityComponent._dataSet;
  if (!!formData && formData.length > 0) {
    for (let i = 0; i < formData.length; i++) {
      const cPlanNo = formData[i]['cPlanNo'];
      const cSaleName = formData[i]['cSaleName'];
      if (cSaleName === '' || cSaleName == null) {
        this.msg.warning('方案号：' + cPlanNo + '，对应的销售名称为空，请补充！', { nzDuration: 3000 });
        return false;
      }
    }
  }

  return true;
}
const initInfo = () => {
        
}

onMounted(async () => {
  getProdInfos(param)
    .then((res) => {
      const { code, data, msg } = res;
      if (200 === code) {
        setTimeout(() => {
          // setData(data.data);
        }, 100);
      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => { });
  console.log(param);
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
