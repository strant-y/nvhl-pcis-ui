<template>
  <div class="header-container">
    <el-card class="card-container">
      <el-row justify="center">
        <el-col :xs="7" :sm="7" :lg="7">
          <el-row class="header-user">
            <el-col class="header-user-image" :offset="2" :xs="6" :sm="6" :lg="6">
              <img v-if="userStore.user.cCssStyle === '2'"
                   class="w-20 h-20 mr-5 rounded-full"
                   src="/src/assets/images/0_.png"
              />
              <img v-else-if="userStore.user.cCssStyle === '1'"
                   class="w-20 h-20 mr-5 rounded-full"
                   src="/src/assets/images/1_.png"
              />
            </el-col>
            <el-col class="header-user-text" :xs="15" :sm="15" :lg="15">
              <div class="user-name">
                <span>{{ greetings }}</span>
              </div>
            </el-col>
          </el-row>
        </el-col>
        <el-col :xs="10" :sm="10" :lg="10">

          <el-row class="" style="margin-top: 10px">
            <el-col>
              <div class="select-input">
                <el-input
                  v-model="shortcutSearchParam"
                  placeholder="任务号，保单号，被保人名称"
                  @keyup.enter="search"
                >
                  <template #suffix>
                    <el-icon
                      class="suffix-icon"
                      size="20"
                      color="#838383"
                      @click="search"
                    >
                      <Search/>
                    </el-icon>
                  </template>
                </el-input>
              </div>
            </el-col>
          </el-row>
          <el-row>
            <div class="fast-menu flex gap-2">
              <i class="flex-center fast-edit">
                <el-button
                  title="修改快捷菜单"
                  type="primary"
                  @click="openShortcutEdit"
                  circle
                  plain
                  icon="Edit"
                  size="small"
                />
              </i>
              <span>快捷菜单：</span>
              <el-tag
                class="fast-menu-text"
                v-for="tag in tags"
                :type="tag.type"
                :key="tag.name"
                @click="$router.push(tag.url)"
              >
                {{tag.name.replace('事故预防','')}}
              </el-tag>
            </div>
          </el-row>
        </el-col>
        <el-col :xs="7" :sm="7" :lg="7">
          <el-row class="header-right">
            <el-col :span="8" :xs="8"></el-col>
            <el-col :span="8" :xs="8" class="msg-title" @click="msgHandle('msg','消息中心')">
              <span class="span_text__">消息</span>
              <el-badge :value="msgSum" color="#f43053">
                <svg-icon icon-class="message" size="28px" />
              </el-badge>
            </el-col>
            <!--v-hasRole="['ROLE_00000000','ROLE_00000003','ROLE_00000004']"-->
            <el-col
              :span="8" :xs="8"
              class="msg-title"
              @click="msgHandle('ready','待办任务')"
            >
              <span class="span_text__">待办</span>
              <el-badge :value="readySumInfo.ready" color="#28be3d">
                <svg-icon icon-class="todolist" size="28px" />
              </el-badge>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
    </el-card>
    <!-- 表单弹窗 -->
    <el-dialog
      class="dialog_"
      v-model="dialog.visible"
      :title="dialog.title"
      width="650px"
    >
      <div class="dialog_">
        <el-transfer
          v-model="transferData"
          :titles="['系统菜单列表', '快捷菜单列表']"
          :data="shortcutDataList"
        />
      </div>
      <div class="dialog_button">
        <el-button @click="dialog.visible = false">取消</el-button>
        <el-button type="primary" @click="transferDataSendTag">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>

import {useSettingsStore, useUserStore} from "@/store";
import {defineProps} from "vue";
import {getShortcutDataList, updateShortRoute} from "@/api/menu";
import {ElMessage} from "element-plus";

const props = defineProps({
  /**
   * 快捷菜单列表
   */
  tags: {
    type: Boolean,
    default: true,
  },
});

const emits = defineEmits(["search","msgHandle"]);
const date: Date = new Date();
const userStore = useUserStore();
const settingsStore = useSettingsStore();
const { fixedHeader, tagsView } = storeToRefs(settingsStore);

// 搜索参数
const shortcutSearchParam = ref();

// 标签类型
const tagType = ["primary", "success", "info", "warning", "danger"];

// 菜单列表
const tags = ref([]);
const shortcutDataList = ref<[]>([]);

// 快捷菜单编辑弹框基本数据
const dialog = reactive({
  title: "",
  visible: false,
});

const transferData = ref([]);
const transferDataOld = ref([]);
const openShortcutEdit = () => {
  dialog.visible = true;
  dialog.title = "快捷菜单标记";
};


const msgSum = ref(0)
const readySumInfo = ref({
  ready:0,
  doing:0
})
// 右边抽屉
const drawer = reactive({
  title: "",
  type: "msg",
  visible: false,
});


onMounted(()=>{
  initShortRoute();
});



const msgHandle = (type,title) => {
  drawer.visible = true;
  drawer.title = title;
  drawer.type = type;
  emits("msgHandle", drawer);
};

function search(){
  emits("search", shortcutSearchParam.value);
}



const init = ref(true);
const initShortRoute = () => {
  transferData.value = [];
  getShortcutDataList().then((res) => {
    if(res.code == 200){
      shortcutDataList.value = res.data;
      res.data.forEach(d => {
        if(d.select){
          transferData.value.push(d.key);
        }
      })
      transferDataSendTag();
    }
  }).finally(()=>{
    init.value = false;
  })
}
const transferDataSendTag = () => {
  const list = [];
  let i = 0 ;
  if(transferData.value.length > 5){
    transferData.value = transferDataOld.value;
    ElMessage({
      message: "选择过多,无法正常显示,最多5个！",
      type: "warning",
    });
    return ;
  }
  shortcutDataList.value.forEach((obj) => {
    transferData.value.forEach(tr => {
      if (obj.key === tr) {
        list.push({
          name: obj.label,
          type: tagType[(i % 5) + 1],
          url: obj.url,
        });
        i++;
      }
    })
    transferDataOld.value = transferData.value;
  });
  tags.value = list;
  if(!init.value){
    updateShortRoute({shortRoute: transferData.value}).then((res => {
      dialog.visible = false;
    }))
  }
};

const greetings = computed(() => {
  const hours = date.getHours();
  if (hours >= 6 && hours < 8) {
    return "晨起披衣出草堂，轩窗已自喜微凉🌅！";
  } else if (hours >= 8 && hours < 12) {
    return "上午好，" + userStore.user.opCnm + "！";
  } else if (hours >= 12 && hours < 18) {
    return "下午好，" + userStore.user.opCnm + "！";
  } else if (hours >= 18 && hours < 24) {
    return "晚上好，" + userStore.user.opCnm + "！";
  } else if (hours >= 0 && hours < 6) {
    return "偷偷向银河要了一把碎星，只等你闭上眼睛撒入你的梦中，晚安🌛！";
  }
});

const updateMsgCount = () => {
}


defineExpose({
  updateMsgCount
})

</script>

<style lang="scss" scoped>
.header-container{
  //position: sticky;
  //width: 100%;
  //top: 0;
  //z-index: 5;
}
.select-input{
  border: 1px solid #e5e5e5;
  height: 40px;
  background-color: rgba(111,111,111,0.1);
  border-radius: 20px;
  flex-wrap: nowrap;
  transition: border-color 0.3s ease;

  .el-input{
    margin-top: 5px;
  }
  &:focus-within{
    border-color: var(--menu-hover);
  }
}

.suffix-icon{
  margin-right: 15px;
  &:active{
    color: var(--menu-active-text);
  }
  &:hover{
    cursor: pointer;
    color: var(--menu-hover);
  }
}
.fast-menu{
  margin-top: 10px;
  //margin-bottom: 5px;
  padding-left: 5px;
  font-size: 13px;
  color: var(--el-text-color);
}
.fast-menu-text{
  cursor: pointer;
  height: 18px;
  font-size: 12px;
  &:hover{
    color: var(--menu-active-text);
  }
}
.fast-edit{
  margin-top: -5px;
  .el-button{
    width: 20px;height: 20px;
  }
}


:deep(.el-input) {
  .el-input__wrapper {
    padding: 0 0 0 15px;
    background-color: transparent;
    box-shadow: none;
    &.is-focus,
    &:hover {
      box-shadow: none !important;
    }
    input:-webkit-autofill {
      /* 通过延时渲染背景色变相去除背景颜色 */
      transition: background-color 1000s ease-in-out 0s;
    }
  }
}

.header-right{
  height: 100%;
  width: 100%;
  .msg-title{
    display: flex;
    align-items: center;
    cursor: pointer;
    span{
      font-size: 14px;
    }
    .el-badge{
      margin-left: 10px;
    }
  }
}

.header-user{
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  .header-user-image{
    text-align: center;
  }
  .header-user-text{
    font-size: 15px;
    color: var(--menu-active-text);
    padding-right: 5px;
  }
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

:deep(.card-container){
  box-shadow: none;
  .el-card__body{
    padding: 0;
    padding-top: 10px;
    padding-bottom: 10px;
  }
}
</style>
