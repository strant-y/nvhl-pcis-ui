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
  <el-footer>
    <div class="footer">
      <el-button type="primary" @click="scrollToTop">一键回到顶部</el-button>
      <el-button type="primary">保存</el-button>
      <el-button type="primary">保存并提交审核</el-button>
      <el-button type="primary">返回</el-button>
    </div>
  </el-footer>
</template>

<script setup lang="ts">
import { getProdInfos } from "@/api/prod";
import { useRoute } from "vue-router";
import { dataOpertaor } from "@/store/modules/data-opertaor";
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
      commodityBasicInfo: {
        pageKey: "commodityBasicInfo",
        pageTtile: "商品基本信息",
        pageRef: "commodityBasicInfo",
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
      commonProblem: {
        pageKey: "commonProblem",
        pageTtile: "常见问题配置",
        pageRef: "commonProblem",
      },
    },
  },
]);

const btns = {};
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
    .finally(() => {});
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
