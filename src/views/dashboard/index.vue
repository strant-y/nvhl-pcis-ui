<template>
  <div class="dashboard-container">
    <el-row class="mb-2">
      <el-col>
        <home-header ref="homeHeaderRef" @search="shortcutSearch" @msgHandle="msgHandle"/>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/modules/user";
import moment from "moment";

defineOptions({
  name: "Dashboard",
  inheritAttrs: false,
});

const router = useRouter();
const homeHeaderRef = ref();


// 待办跳转
const itemHandle = (item) => {
  const param = JSON.stringify({queryType: item.state});
  router.push({path: item.pageRoute,query: {param: param}});
}


onMounted(() => {
});


const shortcutSearch = (searchParams) => {
  router.push({
    path: `/query/comprehensive`,
    query: {
      param: JSON.stringify({
        queryParam: searchParams
      })
    }
  });
};
</script>

<style lang="scss" scoped>
.dashboard-container {
  position: relative;
  padding: 8px;

  .user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }

  .github-corner {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 1;
    border: 0;
  }
  .user-container{
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .msg-container{
    height: 100%;
    .msg-title{
      display: flex;
      align-items: center;
      cursor: pointer;
      span{
        font-size: 14px;
        color: #fff;
        margin-left: -10px;
      }
      .el-badge{
        margin-left: 10px;
      }
    }

  }
  .user-name {
    font-size: 14px;
    margin-top: 5px;
    color: var(--el-text-color);
  }
  .data-box {
    display: flex;
    justify-content: space-between;
    padding: 20px;
    font-weight: bold;
    color: var(--el-text-color-regular);
    background: var(--el-bg-color-overlay);
    border-color: var(--el-border-color);
    box-shadow: var(--el-box-shadow-dark);
  }

  .svg-icon {
    fill: currentcolor !important;
  }
  .shortcut {
    width: 100%;
    height: 157px;

    padding: 5px;
    border-radius: var(--el-card-border-radius);
    border: 1px solid var(--el-card-border-color);
    background-color: var(--el-card-bg-color);
    overflow: hidden;
    color: var(--el-text-color-primary);
    transition: var(--el-transition-duration);

    --el-card-border-color: var(--el-border-color-light);
    --el-card-border-radius: 4px;
    --el-card-padding: 20px;
    --el-card-bg-color: var(--el-fill-color-blank);

    box-shadow: var(--el-box-shadow-light);
  }

  .shortcut_top {
    padding-top: 5px;
    height: 50px;
    border-bottom: 1px solid var(--el-card-border-color);
    background-color: var(--el-card-bg-color);
  }
  .shortcut_search {
    padding: 10px 2px 2px 2px;
  }

  .shortcut_search_input {
    padding-left: 10px;
    padding-right: 10px;
    width: 100%;
    text-align: end;
  }

  .tag_ {
    cursor: pointer;
  }

  .edit_tag {
    padding-left: 15px;
    border-left: 1px solid var(--el-card-border-color);
    background-color: var(--el-card-bg-color);
  }

  .dialog_ {
    text-align: center;
    align-items: center;
    justify-content: center;
  }

  .dialog_text {
    text-align: center;
    align-items: center;
    justify-content: center;
  }

  .dialog_button {
    width: 100%;
    height: 45px;
    margin-top: 20px;
    border-top: 1px solid var(--el-card-border-color);
    padding-right: 21px;
    text-align: end;
  }

  .drawer-page {
    background-color: rgba(0, 0, 0, 0.5);
  }

  .fast-menu{
    bottom: 7px;
    position: absolute;
    width: 100%;
  }
  :deep(.user-card){
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    background: linear-gradient(to right,var(--el-color-primary),var(--menu-background));
    .el-card__body{
      padding-left: 0;
      padding-right: 0;
      .span_text__{
        width: 93px;
        color: var(--el-text-color);
      }
    }
  }
  :deep(.card-container){
    box-shadow: none  ;
    .el-card__header{
      padding: 0;
    }
    .header-card{
      height: 45px;
      align-items: center;
      padding-left: 10px;
      padding-right: 10px;
      display: flex;
    }

    .bg-color-ready {
      background-color: #C2EAA2 !important;
      &:hover {
        font-weight: bold;
      }
    }

    .bg-color-doing {
      background-color: #F49E60 !important;
      &:hover {
        font-weight: bold;
      }
    }

    .bg-color-complete {
      background-color: #FAE093 !important;
      &:hover {
        font-weight: bold;
      }
    }
  }
  .content-container {
    margin-top: -8px;
    height: 150px;
    overflow: auto;
    -ms-overflow-style: none;
    scrollbar-width: none;
    :deep(.el-card__header){
      padding:0;
    }

    .item-title {
      cursor: pointer;
    }
  }
  .content-container::-webkit-scrollbar {
    display: none;
  }
  // #27d7a8 #9880e0 #e16e67

  .custom-items-content{
    &:hover {
      background-color: rgba(241, 241, 241, 0.51);
      color: var(--el-color-primary);
      font-weight: bold;
    }
  }
}

.custom-hint{
  font-size: 13px;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  text-align: center;
  align-items: center
}

</style>
