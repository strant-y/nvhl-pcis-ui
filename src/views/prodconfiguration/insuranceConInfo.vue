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
                v-for="(k, i) in pageConfig?.pageInfo"
                :key="i"
                :id="k.pageKey"
              >
                <component
                  :ref="
                    (res) => {
                      opertaor.addTableRef(k.pageKey, res);
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
import { useRoute } from "vue-router";
import { getProdInfos } from "@/api/prod";
import { dataOpertaor } from "@/store/modules/data-opertaor";
import { ref, onMounted } from "vue";

const opertaor = dataOpertaor();
opertaor.init();

const route = useRoute();
const query = ref(route.query);

const param = JSON.parse(query.value?.param ? String(query.value.param) : "{}");
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
