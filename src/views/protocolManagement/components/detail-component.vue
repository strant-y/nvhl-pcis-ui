<template>
  <div class="mypage-app">
    <el-container class="dynamic-container" ref="scrollContainer">
      <el-aside :width="(NavigaShow ? 200 : 100) + 'px'">
        <!-- <el-affix :offset="100"> -->
          <div class="navi_container">
            <div
                v-for="(pageConfig, v) in formPage.config"
                :key="v"
                class="NavigaList_card"
            >
              <el-anchor :bound="120" :offset="80">
                <el-anchor-link
                    v-if="edrbaseFlag"
                    @click="handleAnchorClick($event, `#edrbase`)"
                    class="isActive"
                >
                  <!-- <rt-icon
                    :item="{ icon: 'Tickets' }"
                  /> -->
                  <i :class="['icon','iconfont',iconMap['edrbase']]"></i>
                  <span class="icon-title" v-if="NavigaShow"
                  >批改信息</span
                  >
                </el-anchor-link>
                <el-anchor-link
                    v-if="edritemFlag"
                    @click="handleAnchorClick($event, `#edritem`)"
                >
                  <!-- <rt-icon
                    :item="{ icon: 'Tickets' }"
                  /> -->
                  <i :class="['icon','iconfont',iconMap['edritem']]"></i>
                  <span class="icon-title" v-if="NavigaShow"
                  >批改比较项</span
                  >
                </el-anchor-link>
                  <el-anchor-link
                      v-for="(k, i) in pageConfig?.pageInfo"
                      :key="i"
                      :custom="true"
                      v-show="k.pageKey !== 'acctinfo' ? ['AgreementCiShare', 'AgreementCi', 'AgreementCiTcp'].includes(k.pageCode) ? isCiJiMrk :acctinfoFlag :true"
                      @click="handleAnchorClick($event, `#${k.pageCode}`)"
                      :class="i === 0 ? 'isActive' : ''"
                  >
                    <!-- <rt-icon
                        style="margin-right: 14px"
                        :item="{ icon: k.icon && k.icon !== 'null' && k.icon !== '' ? k.icon : 'Tickets', }"
                    /> -->
                    <i :class="['icon','iconfont',iconMap[k.pageKey]]"></i>
                    <span class="icon-title" v-if="NavigaShow">
                    <template v-if="k.pageTtile && k.pageTtile.length > 6">
                      <el-tooltip
                          effect="dark"
                          :content="k.pageTtile"
                          placement="top-start"
                      >
                        {{ k.pageTtile.substring(0, 6) + "..." }}
                      </el-tooltip>
                    </template>
                    <template v-else>
                      {{ k.pageTtile }}
                    </template>
                  </span>
                  </el-anchor-link>
                <el-anchor-link
                    v-if="underwriteFlag"
                    @click="handleAnchorClick($event, `#underwriteurl`)"
                    style="opacity: 1;font-weight: 500;"
                >
                  <!-- <rt-icon
                    :item="{ icon: 'Tickets' }"
                  /> -->
                  <i :class="['icon','iconfont',iconMap['underwriteurl']]" style="color: var(--el-color-warning);"></i>
                  <span
                      class="icon-title"
                      style="color: var(--el-color-warning)"
                  >核保处理</span
                  >
                </el-anchor-link>
              </el-anchor>
            </div>
            <!-- <div class="NavigaList_card" style="margin-left: 5px">
              <rt-icon
                  @click="NavigaShow = !NavigaShow"
                  v-if="!NavigaShow"
                  :item="{ icon: 'DArrowRight' }"
              />
              <rt-icon
                  @click="NavigaShow = !NavigaShow"
                  v-if="NavigaShow"
                  :item="{ icon: 'DArrowLeft' }"
              />
            </div> -->
          </div>
        <!-- </el-affix> -->
      </el-aside>
      <el-main>
        <div id="edrbase" v-if="edrbaseFlag" style="margin-bottom: 10px">
          <xyedrbaseRef
              :ref="(res: any) => {
                if(res && res.addProvide){
                  res.addProvide('domId', 'xyedrbase');
                }
                xyedrbase = res
              }"
          />
        </div>
        <div id="edritem" v-if="edritemFlag" style="margin-bottom: 10px">
          <xyedritemRef
            :ref="(res: any) => {
              if(res && res.addProvide){
                res.addProvide('domId', 'xyedritem');
              }
              xyedritem = res
            }"
          />
        </div>
          <template v-for="(pageConfig, v) in formPage.config" :key="v">
            <div
                class="card_"
                v-for="(k, i) in pageConfig?.pageInfo"
                :key="i"
                :id="k.pageCode"
                v-show="k.pageKey !== 'acctinfo' ? ['AgreementCiShare', 'AgreementCi', 'AgreementCiTcp'].includes(k.pageCode) ? isCiJiMrk : acctinfoFlag : true"
            >
              <component
                :ref="(res: any) => {
                  formPage.setComponentRef(k.pageCode, res);
                  if(res && res.addProvide){
                    res.addProvide('domId', k.pageCode);
                  }
                }"
                :is="getConmpName(k)"
                :pageSchema="k.pageSchema"
                :compKey="k.pageKey"
              />
            </div>
          </template>
        <div
            id="underwriteurl"
            v-if="underwriteFlag"
            style="margin-bottom: 10px"
        >
          <auditwriteRef
            :pageData="pageData"
            :ref="(res: any) => {
              if(res && res.addProvide){
                res.addProvide('domId', 'underwrite');
              }
              underwrite = res
            }"
          />
        </div>
        <el-backtop :target="'.el-main'" :right="100" :bottom="150" />
        <el-affix position="bottom" :offset="10">
        <div class="bottom-items">
<!--          新增的申请单号显示和复制按钮-->
          <div style="margin-right: 5px; width: 100%; display: flex; justify-content: flex-end; align-items: center;">
            <div style="display: flex; align-items: center; background: #fff; border-radius: 4px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);white-space: nowrap;">
              预约协议申请单号:
              <span id="policyNumber" style="margin-left: 5px; margin-right: 5px; font-weight: bold;">
              {{ getNo }}
              </span>
              <el-tooltip :content="`点击复制预约协议申请单号`" placement="top">
                <el-button @click="copyPolicyNumber" circle size="small" style="color: red;margin-right: 0;">
                  <rt-icon :item="{ icon: 'DocumentCopy' }" style="font-size: 22px;" />
                </el-button>
              </el-tooltip>
            </div>
          </div>
          <rt-button
              v-for="(bth, idx) in props.bthList"
              :item="bth"
              :key="idx"
              :loading="bth.loading"
              :ref="(res: any) => {
                formPage.setButtonRef(bth?.id as string, res);
              }"
          />
        </div>
      </el-affix>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import {computed} from "vue";
import { iconMap } from './iconMap';
import {scrollByDomId} from "@/utils/common";

const props = defineProps({
  bthList: {
    type: Array,
  },
  pageType:String
});
let underwriteFlag = ref(false);
const idxParam = inject<any>('idxParam', {});
const formPage = idxParam?.formPage;
idxParam.handleAnchorClick = handleAnchorClick;

const isCiJiMrk = computed(() => !!idxParam.ciJiMrk && idxParam.ciJiMrk !== '0');
const acctinfoFlag = computed(() => !!(idxParam.param.acctinfoFlag));
const pageData = ref({}); // 页面数据
const getConmpName = (k: any) => {
  return k.pageCode + '-ref';
}
const NavigaShow = ref(true);
const underwrite = ref(null);
const xyedrbase = ref(null)
const xyedritem = ref(null)
let edrbaseFlag = ref(false);
let edritemFlag = ref(false);
const getNo = computed(() => {
  const agreementBaseRef = formPage?.getFormDataById('AgreementBase')
  return (agreementBaseRef && agreementBaseRef['ECargoBase.cEcAgrAppNo']) ? agreementBaseRef['ECargoBase.cEcAgrAppNo'] : '暂无'
})
onMounted(()=>{
  if (props.pageType === "audit") {
    underwriteFlag.value = true;
  } else {
    underwriteFlag.value = false;
  }
  if(props.pageType === "EDR_APP_NEW_SCENE"){
    edrbaseFlag.value =true
    edritemFlag.value =true
  }else {
    edrbaseFlag.value =false
    edritemFlag.value =false
  }
})
// 复制申请单号
const copyPolicyNumber = () => {
  const policyNumberElement = document.getElementById("policyNumber");
  if (!policyNumberElement) return;

  if(navigator.clipboard) {
    const text = policyNumberElement.innerText;
    navigator.clipboard.writeText(text).then(res => {
      ElMessage.success( '预约协议申请单号已成功复制到剪贴板！');
    }).catch(err => {
      ElMessage.error('预约协议申请单号已成功复制到剪贴板！' + "复制失败，请手动复制。");
    })
  } else {
    const range = document.createRange();
    range.selectNodeContents(policyNumberElement);

    const selection = window.getSelection();
    if (!selection) return;

    selection.removeAllRanges();
    selection.addRange(range);

    try {
      const successful = document.execCommand("copy");
      if (successful) {
        ElMessage.success('预约协议申请单号已成功复制到剪贴板！');
      } else {
        ElMessage.error('预约协议申请单号复制失败，请手动复制。');
      }
    } catch (err) {
      ElMessage.error("当前浏览器不支持自动复制功能，请手动复制。");
    }

    // 清除选中内容
    selection.removeAllRanges();
  }
};
function  getUnderwriteRef (){
  return  underwrite.value?.validate()
}
function getUnderwriteValue(){
  return underwrite.value?.getFromValue()
}
function setxyedrbaseRefData(val:any){
  return xyedrbase.value?.setFormValue(val)
}
function setxyedrbaseRefValue(key:any,val:any){
  return xyedrbase.value?.setValue(key,val)
}
function getxyedrbaseRefValue(key:any,val:any){
  return xyedrbase.value?.getFromValue()
}
function getxyedritemValue(){
  return xyedritem.value?.handleQuery()
}
/**
 * 锚点点击事件重写
 * 避免触发路由
 */
function handleAnchorClick(event: any, targetId: string) {
  // 阻止默认的路由跳转行为
  if(event) {
    event.preventDefault();
  }
  // 获取目标元素的ID
  if (targetId) {
    scrollByDomId(targetId, "start");
  }
  if(document.querySelectorAll('.el-anchor__item') && document.querySelectorAll('.el-anchor__item').length > 0) {
    document.querySelectorAll('.el-anchor__item').forEach((item:any) => {
      item.classList.remove('isActive')
    })
  }
  if(event) {
    event.currentTarget.classList.add('isActive')
  }
}
defineExpose({
  getxyedritemValue,
  getUnderwriteRef,
  getUnderwriteValue,
  setxyedrbaseRefData,
  setxyedrbaseRefValue,
  getxyedrbaseRefValue
});
</script>
<style lang="scss" scoped>
.bottom-items {
  height: 45px;
  background-color: #fff;
  display: flex;
  justify-content: end;
  align-items: center;
  padding-right: 20px;
}
.NavigaList_card {
  display: inline-block; /* 设置为行内块元素 */
  vertical-align: middle; /* 垂直居中 */
}
.card_ {
  margin-bottom: 10px;
}

/* 用于包含行内块元素的容器 */
.navi_container {
  line-height: 50px; /* 与容器的高度相同，实现垂直居中 */
}
:deep(.el-main) {
  padding: 10px 10px 10px 10px;
}
.publicStyle {
  color: red;
}
.mypage-app {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: absolute;
  width: 100%;
}
.dynamic-container {
  height: calc(100vh - $navbar-height - 60px - 90px);
  overflow: auto;
}

.mypage-aside {
  background: var(--el-color-primary);
}
.el-anchor {
  background: transparent;
  :deep(.el-anchor__list) {
    padding: 20px 10px;
  }
  .el-anchor__item {
    margin-bottom: 20px;
    padding-left: 0;
    opacity: .6;
    &.isActive,&:hover {
      opacity: 1;
    }
    :deep(a) {
      display: flex;
      flex-direction: row;
      align-items: center;
      color: #FFFFFF;
      padding: 0;
      .el-icon {
        font-size: 3rem!important;
        margin: 0 0 10px 0;
      }
      .iconfont {
        font-size: 1.2rem;
        color: #FFF;
        margin-right: 5px;
      }
      .icon-title {
        font-size: 14px;
      }
    }
  }
}
.el-aside {
  width: auto;
  background: var(--el-color-primary);
}

</style>