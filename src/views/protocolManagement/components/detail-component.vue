<template>
  <div class="mypage-app">
    <el-container class="dynamic-container" ref="scrollContainer">
      <el-aside :width="NavigaShow  ? '140px' : '60px'" class="custom-anchor-bg">
        <!-- <el-affix :offset="100"> -->
          <div class="navi_container">
            <div
                v-for="(pageConfig, v) in formPage.config"
                :key="v"
                class="NavigaList_card"
            >
              <el-anchor :bound="120" :offset="60">
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
                      v-show="showComponent(k.pageKey, k.pageCode)"
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
              <div class="toggle-button">
                <el-tooltip
                    effect="dark"
                    :content="NavigaShow ? '收起导航' : '展开导航'"
                    placement="right"
                >
                  <el-button
                      circle
                      @click="NavigaShow = !NavigaShow"
                      class="toggle-nav-button"
                  >
                    <rt-icon
                        :item="{ icon: NavigaShow ? 'DArrowLeft' : 'DArrowRight' }"
                    />
                  </el-button>
                </el-tooltip>
              </div>
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
                v-show="showComponent(k.pageKey, k.pageCode)"
            >
                <!-- {{  k.pageCode}}   ||     {{ k.pageKey }} -->
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
      </el-main>
			<div class="right-btns" v-if="pageLoaded">
        <div class="btns-content" v-if="rightBtnList.length > 0">
          <rt-button
            v-for="(bth, idx) in rightBtnList"
            :item="bth"
            :key="idx"
            :loading="bth.loading"
          />
        </div>
      </div>
    </el-container>
		<el-affix position="bottom">
			<div class="bottom-items">
				<!--          新增的申请单号显示和复制按钮-->
				<div style="margin-right: 5px; width: 100%; display: flex; justify-content: space-between; align-items: center;">
					<div style="padding-left: 10px;display: flex; align-items: center; background: var(--rt-bg-color); border-radius: 4px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);white-space: nowrap;">
						预约协议申请单号:
						<span id="policyNumber" style="margin-left: 5px; margin-right: 5px; font-weight: bold;color: var(--el-color-primary);">
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
  </div>
</template>

<script setup lang="ts">
import {computed} from "vue";
import { iconMap } from './iconMap';
import {scrollByDomId} from "@/utils/common";
import {idxParamKey, useIdxParam} from "@/views/pcis/support/useIdxParam";
import { createFreeButtonBase, FreeButtonBase } from "@/shared/button-config";
import { useDzModal } from "@/common/dzmodel/DzModalService";
const dzmodal = useDzModal();
const props = defineProps({
  bthList: {
    type: Array,
  },
  pageType:String,
	pageWay: String,
	pageParam: Object,
});
let underwriteFlag = ref(false);
const idxParam = inject(idxParamKey, useIdxParam());
const formPage = idxParam?.formPage;
idxParam.handleAnchorClick = handleAnchorClick;

const isCiJiMrk = computed(() => !!idxParam.ciJiMrk && idxParam.ciJiMrk !== '0');
const acctinfoFlag = computed(() => !!(idxParam.param.acctinfoFlag));
const pageData = ref({}); // 页面数据
const getConmpName = (k: any) => {
  return k.pageCode + '-ref';
}
const showComponent = (compKey: string, compCode: string): boolean => {
  if(['AgreementCiShare', 'AgreementCi', 'AgreementCiTcp'].includes(compCode)) {
    return isCiJiMrk.value
  }else if(['AgreementAcctinfo'].includes(compCode)) {
    return ['2', '3'].includes(idxParam?.param?.cEdrType) // 注销 退保显示账户组件
  }
  return true;
};
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
const pageLoaded = ref(false);
const rightBtnList = ref<Array<FreeButtonBase>>([]);
// 任务痕迹
const TaskListVestige = defineAsyncComponent(
  () => import("@/views/pcis-new-udr-list/common/TaskListVestige.vue")
);
// 核保信息
const UndrOpnList = defineAsyncComponent(
	() => import("@/views/comprehensive-query/modal/UndrOpnList.vue")
);
onMounted(() => {
  if (props.pageType === "audit") {
    underwriteFlag.value = true;
  } else {
    underwriteFlag.value = false;
  }
  if(props.pageType === "EDR_APP_NEW_SCENE"){
    edrbaseFlag.value =true
    edritemFlag.value =true
    if (
        (props.pageType === "EDR_APP_NEW_SCENE" &&
            (idxParam.param.cEdrType == "3" || idxParam.param.cEdrType == "2"))
    ) {
      edritemFlag.value = false;
    }
	} else {
		// 协议审核批单展示批改信息和批改比较项，不能修改
		if ((props.pageType === "audit" || props.pageType === "view") && idxParam.param.cAppTyp == 'E') {
			edrbaseFlag.value =true
    	edritemFlag.value =true
		} else {
			edrbaseFlag.value =false
			edritemFlag.value =false
		}
	}
	if (props.pageParam.rightbtns) {
		nextTick(() => {
			pageLoaded.value = true;
			rightBtnList.value = [
				createFreeButtonBase({
					label: "任务痕迹",
					type: "primary",
					id: "taskVestige",
					// svgIcon: "track", // 使用本地图标库
					// iconSize: "20", // 设置图标大小
					icon: "SetUp",
					func: () => {
						dzmodal
							.open(TaskListVestige, {
								type: "Issuer",
								data: { objId: props.pageParam?.cEcAgrAppNo, sysType: props.pageParam?.sysType },
							})
							.then((res: any) => {
								if (res.type === "ok") {
								}
							});
					},
				}),
				createFreeButtonBase({
					label: "核保信息",
					type: "primary",
					id: "undrInfo",
					// svgIcon: "Agree", // 使用本地图标库
					// iconSize: "25", // 设置图标大小
					icon: "DocumentChecked",
					func: () => {
						dzmodal
							.open(UndrOpnList, { type: "", CAppNo: props.pageParam?.cEcAgrAppNo })
							.then((res: any) => {
								if (res.type === "ok") {
								}
							});
					},
				}),
			]
		})
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
function getxyedrbaseValidate(key:any,val:any){
  return xyedrbase.value?.validate()
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
  getxyedrbaseValidate,
  getxyedritemValue,
  getUnderwriteRef,
  getUnderwriteValue,
  setxyedrbaseRefData,
  setxyedrbaseRefValue,
  getxyedrbaseRefValue
});
</script>
<style lang="scss" scoped>
@import "@/styles/custom-index";

$btn-icon-color-1: #ff3e00;
$btn-icon-color-2: #0060ff;
$btn-icon-color-3: #4500ff;
$btn-icon-color-4: #ffb200;
$btn-icon-color-5: #00ff31;
$btn-icon-bg-color-1: rgb(253, 222, 212);
$btn-icon-bg-color-2: rgb(238, 244, 254);
$btn-icon-bg-color-3: rgb(234, 227, 253);
$btn-icon-bg-color-4: rgb(255, 242, 212);
$btn-icon-bg-color-5: rgb(230, 251, 234);
.bottom-items {
  height: 45px;
  background-color: var(--rt-bg-color);
  display: flex;
  justify-content: end;
  align-items: center;
  padding-right: 10px;
  border-top: 1px var(--el-mypage-right-menu-border-color) solid;
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

.right-btns {
	// padding: 0 3rem;
	margin: 5px 5px 0 0;
	// min-width: calc(150px + 6rem);
	.btns-content {
		margin-top: 5px;
		background: var(--rt-bg-color);
		border: var(--rt-border);
		padding: 10px;
		border-radius: 5px;
		display: flex;
		flex-direction: column;
		align-items: start;
		// width: 150px;
		:deep(.el-button) {
			margin: 0 0 12px 0;
			border: none;
			background-color: transparent!important;
			color: var(--el-text-color);
			padding: 0;
			.el-icon {
				width: 32px;
				height: 32px;
				padding: 6px;
				border-radius: 2px;
				margin-right: 10px!important;
				svg {
					width: 20px;
					height: 20px;
				}
			}
			&:last-child {
				margin-bottom: 0;
			}
			&:nth-child(5n + 1) {
				.el-icon {
					background-color: $btn-icon-bg-color-1;
					svg {
						color: $btn-icon-color-1;
					}
				}
			}
			&:nth-child(5n + 2) {
				.el-icon {
					background-color: $btn-icon-bg-color-2;
					svg {
						color: $btn-icon-color-2;
					}
				}
			}
			&:nth-child(5n + 3) {
				.el-icon {
					background-color: $btn-icon-bg-color-3;
					svg {
						color: $btn-icon-color-3;
					}
				}
			}
			&:nth-child(5n + 4) {
				.el-icon {
					background-color: $btn-icon-bg-color-4;
					svg {
						color: $btn-icon-color-4;
					}
				}
			}
			&:nth-child(5n + 5) {
				.el-icon {
					background-color: $btn-icon-bg-color-5;
					svg {
						color: $btn-icon-color-5;
					}
				}
			}
		}
	}
}
</style>