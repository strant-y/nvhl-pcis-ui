<!-- 用户管理 -->
<template>
  <el-container>
    <el-main>
      <el-container>
        <el-aside width="150px">
          <template v-for="(pageConfig, v) in formconfig1" :key="v">
            <el-affix :offset="150">
              <el-anchor :bound="120" :offset="80">
                <el-anchor-link
                  v-for="(k, i) in pageConfig?.pageInfo"
                  :key="i"
                  :href="`#${k.pageKey}`"
                >
                  {{ k.pageTtile }}
                </el-anchor-link>
              </el-anchor>
            </el-affix>
          </template>
        </el-aside>
        <el-container>
          <el-main>
            <template v-for="(pageConfig, v) in formconfig1" :key="v">
              <div
                v-for="(k, i, index) in pageConfig?.pageInfo"
                :key="i"
                :id="k.pageKey"
              >
                <component
                  v-if="currentIndex >= index"
                  :ref="
                    (res) => {
                      opertaor.addTableRef(k.pageCode, res);
                    }
                  "
                  :is="k.pageRef + '-ref'"
                />
              </div>
            </template>
          </el-main>
        </el-container>
      </el-container>
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { getProdInfos } from "@/api/prod";
import { useRoute } from "vue-router";
import { dataOpertaor } from "@/store/modules/data-opertaor";
const opertaor = dataOpertaor();
opertaor.init();

const route = useRoute();
const router = useRouter();
const query = ref(route.query);

const param = JSON.parse(query.value?.param ? String(query.value.param) : "{}");
const formconfig1 = opertaor.getTableConfig();
// 当前加载的组件索引
const currentIndex = ref(0);

opertaor.setTableConfig([
  {
    groupId: "",
    showGroupId: false,
    pageInfo: {
      prodaudit: {
        pageKey: "prodaudit",
        pageTtile: "产品审核",
        pageRef: "prodaudit",
      },
      prodInfo: {
        pageKey: "prodInfo",
        pageTtile: "产品基本信息",
        pageRef: "prodInfo",
      },
      relatedMainInsurance: {
        pageKey: "relatedMainInsurance",
        pageTtile: "关联主条款",
        pageRef: "relatedMainInsurance",
      },
      factoryrelatedAdditionalIns: {
        pageKey: "factoryrelatedAdditionalIns",
        pageTtile: "关联附加条款",
        pageRef: "factoryrelatedAdditionalIns",
      },
      specialAgreement: {
        pageKey: "specialAgreement",
        pageTtile: "关联特别约定",
        pageRef: "specialAgreement",
      },
      healthNotice: {
        pageKey: "healthNotice",
        pageTtile: "关联健康告知",
        pageRef: "healthNotice",
      },
      relatedInsuranceLiability: {
        pageKey: "relatedInsuranceLiability",
        pageTtile: "关联条款责任",
        pageRef: "relatedInsuranceLiability",
      },
      relatedBusinessRules: {
        pageKey: "relatedBusinessRules",
        pageTtile: "关联业务规则",
        pageRef: "relatedBusinessRules",
      },
      relatedPremCalcuRules: {
        pageKey: "relatedPremCalcuRules",
        pageTtile: "关联保费计算规则",
        pageRef: "relatedPremCalcuRules",
      },
      relatedPayOrderConf: {
        pageKey: "relatedPayOrderConf",
        pageTtile: "关联见费出单配置",
        pageRef: "relatedPayOrderConf",
      },
      planConfigration: {
        pageKey: "planConfigration",
        pageTtile: "计划配置",
        pageRef: "planConfigration",
      },
      rateConfiguration: {
        pageKey: "rateConfiguration",
        pageTtile: "费率配置",
        pageRef: "rateConfiguration",
      },
      InstituTaxRateAllocat: {
        pageKey: "InstituTaxRateAllocat",
        pageTtile: "机构税率配置",
        pageRef: "InstituTaxRateAllocat",
      },
      assoCorrPreCalculFormula: {
        pageKey: "assoCorrPreCalculFormula",
        pageTtile: "关联批改保费计算公式",
        pageRef: "assoCorrPreCalculFormula",
      },
      prodComponent: {
        pageKey: "prodComponent",
        pageTtile: "页面组件绑定",
        pageRef: "prodComponent",
      },
    },
  },
]);

const btns = {};
onMounted(() => {
  renderComponents();
});

function renderComponents() {
  const interval = setInterval(() => {
    if (currentIndex.value < 15) {
      currentIndex.value++;
    } else {
      loadAfter(); //页面加载完成之后,再加载后续所需的事件
      clearInterval(interval);
    }
  }, 100); // 延迟组件渲染,增加页面响应效率
}
function loadAfter() {
  if (param.editType === "edit") {
    nextTick(() => {
      getProdInfos(param)
        .then((res) => {
          const { code, data, msg } = res;
          if (200 === code) {
            setTimeout(() => {
              setData(data.data);
            }, 100);
          } else {
            ElMessage.error(msg);
          }
        })
        .finally(() => {});
    });
  }
}
function setData(datas: any) {
  Object.keys(datas).forEach((k) => {
    const ref = opertaor.getTableRefByKey(k);
    console.log(ref);
    ref.setFormValue(datas[k]);
  });
}
</script>

<style scoped></style>
