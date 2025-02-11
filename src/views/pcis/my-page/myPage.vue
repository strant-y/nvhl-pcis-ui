<!-- 用户管理 -->
<template>
  <el-container>
    <el-main>
      <el-container>
        <el-aside :width="(NavigaShow ? 200 : 100) + 'px'">
          <el-affix :offset="150">
            <div class="navi_container">
              <div
                v-for="(pageConfig, v) in formconfig1"
                :key="v"
                class="NavigaList_card"
              >
                <el-anchor :bound="120" :offset="80">
                  <el-anchor-link
                    v-for="(k, i) in pageConfig?.pageInfo"
                    :key="i"
                    :href="`#${k.pageKey}`"
                  >
                    <rt-icon
                      style="margin-right: 14px"
                      :item="{
                        icon:
                          k.icon && k.icon !== 'null' && k.icon !== ''
                            ? k.icon
                            : 'Tickets',
                      }"
                    />
                    <span style="font-size: 15px" v-if="NavigaShow">
                      {{ k.pageTtile }}
                    </span>
                  </el-anchor-link>
                </el-anchor>
              </div>
              <div class="NavigaList_card" style="margin-left: 5px">
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
              </div>
            </div>
          </el-affix>
        </el-aside>
        <el-container>
          <el-header height="60px">
            <el-affix :offset="90"> 信息展示预留 </el-affix>
          </el-header>
          <el-main>
            <template v-for="(pageConfig, v) in formconfig1" :key="v">
              <div
                class="card_"
                v-for="(k, i) in pageConfig?.pageInfo"
                :key="i"
                :id="k.pageKey"
              >
                <component
                  v-if="currentIndex >= i"
                  :ref="
                    (res) => {
                      opertaor.addTableRef(k.pageKey, res);
                    }
                  "
                  :is="k.pageType === 'custom' ? k.pageCode : k.pageKey + '-ref'"
                  :pageSchema="k.pageSchema"
                />
              </div>
            </template>
          </el-main>
        </el-container>
      </el-container>
    </el-main>
    <el-footer>
      <el-affix position="bottom" :offset="10">
        <div class="bottom-items">
          <rt-button v-for="(bth, idx) in bthList" :item="bth" :key="idx" />
        </div>
      </el-affix>
    </el-footer>
  </el-container>
</template>

<script setup lang="ts">
import {createFreeButtonBase, FreeButtonBase} from "@/shared/button-config";
import {getProductPage} from "../../../api/prod/index";
import {getAppPlyInfoByAppNo, saveAppPlyInfo,} from "../../../api/query/index";
import {dataOpertaor} from "@/store/modules/data-opertaor";

const opertaor = dataOpertaor();
opertaor.init();

const props = defineProps({
  param: {
    type: Object,
  },
});

// 当前加载的组件索引
const currentIndex = ref(0);
const NavigaShow = ref(true);
const formconfig1 = opertaor.getTableConfig();
const bthList = ref<Array<FreeButtonBase>>([]);

onBeforeMount(() => {
  console.log("路由参数props.param", props.param);
  initPage();
});
/**
 * 数据初始化
 * @param data
 */
const initPage = async () => {
  console.log(props.param);
  const getProductRes = await getProductPage({
    CProdNo: props.param.cProdNo,
    CGrpMrk: props.param.cGrpMrk,
  });
  // 页面初始化
  const formconfig11 = JSON.parse(getProductRes.data);
  opertaor.setTableConfig(formconfig11);
  renderComponents();
};

/**
 * 逐个渲染组件
 */
function renderComponents() {
  const interval = setInterval(() => {
    if (currentIndex.value < formconfig1[0]?.pageInfo.length - 1) {
      currentIndex.value++;
    } else {
      loadAfter(); //页面加载完成之后,再加载后续所需的事件
      clearInterval(interval);
    }
  }, 100); // 延迟组件渲染,增加页面响应效率
}

/**
 * 页面加载后
 */
async function loadAfter() {
  console.log("setPage");
  console.log(props.param);
  // page.getRefTab("base").setFormValue(lowercaseKeys(props.param));
  if (props.param.pageType === "app") {
    bthList.value.push(
      createFreeButtonBase({
        label: "提交",
        type: "primary",
        func: () => {
          savePlyInfo();
        },
      })
    );
  } else if (props.param.pageType === "readonly") {
    // 查询数据
    const getAppPlyInfoRes = await getAppPlyInfoByAppNo({
      CAppNo: props.param.cAppNo,
    });
    console.log("getAppPlyInfoRes", getAppPlyInfoRes);
    const data = getAppPlyInfoRes.data;
    nextTick(() => {
      console.log(data);
      opertaor.setDataAll(data);
      // set
      // page.getRefTab("base").setFormValue(lowercaseKeys(data["base"]));
      // let cvrgList = data["cvrg"];
      // cvrgList = cvrgList.map((item) => {
      //   item.nTgtNumFld8 = 10;
      //   return lowercaseKeys(item);
      // });
      // page.getRefTab("cvrg").setFormValue(cvrgList);
      // page.getRefTab("tgt").setFormValue(lowercaseKeys(data["tgt"]));
      // page
      //   .getRefTab("applicant")
      //   .setFormValue(lowercaseKeys(data["applicant"]));
    });
  }

  bthList.value.push(
    createFreeButtonBase({
      label: "返回",
      func: () => {
        history.back();
      },
    })
  );
}

const savePlyInfo = () => {
  const param = page.getAllValue();
  saveAppPlyInfo({ data: param }).then((res) => {
    console.log("saveAppPlyInfo-res", res);
    ElMessage.success(res.msg);
    history.back();
  });
};

// 将对象的属性首字母转换为小写
function lowercaseKeys<T extends object>(
  obj: T
): { [K in keyof T as Uncapitalize<string & K>]: T[K] } {
  // 创建一个新的对象
  const newObj = {} as { [K in keyof T as Uncapitalize<string & K>]: T[K] };
  // 遍历原始对象的属性
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      // 将属性名的首字母转换为小写，并赋值
      const newKey = (key.charAt(0).toLowerCase() +
        key.slice(1)) as Uncapitalize<string & K>;
      newObj[newKey] = obj[key];
    }
  }
  return newObj;
}
</script>

<style scoped>
.bottom-items {
  height: 50px;
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
</style>
