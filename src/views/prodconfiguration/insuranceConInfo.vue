<!-- 条款配置 -->
<template>
  <el-container>
    <el-main>
      <el-container>
        <!-- <el-aside width="150px">
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
        </el-aside> -->
        <el-container>
          <el-main>
            <template v-for="(pageConfig, v) in formconfig1" :key="v">
              <div
                v-for="(k, i) in pageConfig?.pageInfo"
                :key="i"
                :id="k.pageKey"
              >
                <component
                  v-if="
                    k.pageKey !== 'relatedAdditionalIns' || showRelatedAdditionalIns
                  "
                  :ref="
                    (res) => {
                      opertaor.addTableRef(k.pageKey, res);
                    }
                  "
                  :is="k.pageRef + '-ref'"
                  @clause-type-change="handleClauseTypeChange"
                  @term-data-loaded="handleTermDataLoaded"
                  @term-saved="handleTermSaved"
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
import { dataParam } from "@/store/modules/dataParam";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { ref, onMounted } from "vue";
import {idxParamKey, IdxParamProps} from "@/views/pcis/support/useIdxParam";
import {useRoute} from "vue-router";
import { saveTermRiskRel, saveTermRel } from "@/api/prod";

const props = defineProps({
  param: {
    type: Object,
  },
});
const route = useRoute();

const paramparam = dataParam();
paramparam.setParam(props.param);
const idxParam: IdxParamProps = {
  opertaorProps: { id: route.name },
  cdeListViewProps: { id: route.name },
  // handleAnchorClick: handleAnchorClick,
};
provide(idxParamKey, idxParam);
const opertaor = dataOpertaor(idxParam.opertaorProps);
const formconfig1 = opertaor.getTableConfig();


opertaor.setTableConfig([
  {
    groupId: "",
    showGroupId: false,
    pageInfo: {
      clauseConfBasicInfo: {
        pageKey: "clauseConfBasicInfo",
        pageTtile: "条款基本信息",
        pageRef: "clauseConfBasicInfo",
      },
      // inruranceTypeBasicInfo: {
      //   pageKey: "inruranceTypeBasicInfo",
      //   pageTtile: "险别基本信息",
      //   pageRef: "inruranceTypeBasicInfo",
      // },
      relatedRespons: {
        pageKey: "relatedRespons",
        pageTtile: "关联责任",
        pageRef: "relatedRespons",
      },
      // relatedTerms: {
      //   pageKey: "relatedTerms",
      //   pageTtile: "关联条款",
      //   pageRef: "relatedTerms",
      // },
      relatedAdditionalIns: {
        pageKey: "relatedAdditionalIns",
        pageTtile: "关联附加条款",
        pageRef: "relatedAdditionalIns",
      },
    },
  },
]);
const showRelatedAdditionalIns = ref(false);

const handleClauseTypeChange = (val: string) => {
  showRelatedAdditionalIns.value = val === "0"; // 0 表示主条款，主条款时显示关联附加条款
};

/**
 * 复制模式下，条款基本信息数据加载完成后触发
 * 先用原始 cTermNo 查询关联责任和关联附加条款，实现数据回显
 * 查询完成后再清空 cTermNo
 */
function handleTermDataLoaded() {
  // 查询关联责任
  const relatedResponsRef = opertaor.getTableRefByKey("relatedRespons");
  if (relatedResponsRef && typeof relatedResponsRef.handleQuery === 'function') {
    relatedResponsRef.handleQuery();
  }
  // 查询关联附加条款
  const relatedAdditionalInsRef = opertaor.getTableRefByKey("relatedAdditionalIns");
  if (relatedAdditionalInsRef && typeof relatedAdditionalInsRef.handleQuery === 'function') {
    relatedAdditionalInsRef.handleQuery();
  }
  // 关联查询发起后，清空条款代码
  const clauseConfBasicInfoRef = opertaor.getTableRefByKey("clauseConfBasicInfo");
  if (clauseConfBasicInfoRef && typeof clauseConfBasicInfoRef.clearCopyTermNo === 'function') {
    clauseConfBasicInfoRef.clearCopyTermNo();
  }
}
/**
 * 复制模式下，条款基本信息保存成功后触发
 * 用新 cTermNo 将关联责任和关联附加条款数据重新保存绑定
 * @param newTermNo 保存后返回的新条款代码
 */
function handleTermSaved(newTermNo: string) {
  const opCde = JSON.parse(sessionStorage.getItem("user")).opCde;

  // 保存关联责任数据
  const relatedResponsRef = opertaor.getTableRefByKey("relatedRespons");
  if (relatedResponsRef && typeof relatedResponsRef.getTableData === 'function') {
    const riskList = relatedResponsRef.getTableData();
    if (riskList && riskList.length > 0) {
      const rel = riskList.map((item: any) => {
        item.cCrtCde = opCde;
        item.cUpdCde = opCde;
        item.cTermNo = newTermNo;
        return item;
      });
      saveTermRiskRel({ cTermNo: newTermNo, rel }).then((res: any) => {
        if (res.code !== 200) {
          ElMessage.error(res.msg || "关联责任保存失败");
        }
      });
    }
  }

  // 保存关联附加条款数据
  const relatedAdditionalInsRef = opertaor.getTableRefByKey("relatedAdditionalIns");
  if (relatedAdditionalInsRef && typeof relatedAdditionalInsRef.getTableData === 'function') {
    const termRelList = relatedAdditionalInsRef.getTableData();
    if (termRelList && termRelList.length > 0) {
      const rel = termRelList.map((item: any) => {
        item.cCrtCde = opCde;
        item.cUpdCde = opCde;
        item.cTermRdrCde = item.cTermNo;
        item.cTermNo = newTermNo;
        item.cRdrTyp = "1";
        return item;
      });
      saveTermRel({ cTermNo: newTermNo, rel }).then((res: any) => {
        if (res.code !== 200) {
          ElMessage.error(res.msg || "关联附加条款保存失败");
        }
      });
    }
  }
}

const btns = {};
onMounted(async () => {
  // getProdInfos(param)
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
  //   .finally(() => {});
});
function setData(datas: any) {
  Object.keys(datas).forEach((k) => {
    const ref = opertaor.getTableRefByKey(k);
    ref.setFormValue(datas[k]);
  });
}
</script>

<style scoped></style>
