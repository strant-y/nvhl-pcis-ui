<template>
  <el-button type="danger" @click="showDialog"> 点击出现弹框,使用时请删除这个按钮，这个是模拟的 </el-button>
  <el-dialog v-model="visible" :show-close="true" width="90%">
    <template #header="{ titleId, titleClass }">
      <div class="my-header">
        <span :id="titleId" :class="titleClass">团清单导入</span>
        <div class="tipsSty">
          <el-icon color="rgb(237.5, 189.9, 118.5)">
            <WarningFilled />
          </el-icon>
          导入数据量较大时，处理时间会较长，您可以关闭当前页面，后续可在“被保险人导入数据管理”查看
        </div>
      </div>
    </template>
    <div class="importBox">
      <div class="mb10">
        <span>模板信息：</span> {{ templateName }}
      </div>
      <div class="mb10">
        <span class="uploadTxt">上传文件：</span>
        <el-upload v-model:file-list="fileList" class="upload-demo"
          action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15" :on-preview="handlePreview"
          :on-remove="handleRemove" list-type="picture">
          <el-button type="danger" :icon="Upload">上传文件</el-button>
          <!-- <template #tip>
            <div class="el-upload__tip">
              jpg/png files with a size less than 500kb
            </div>
          </template> -->
        </el-upload>
      </div>
      <app-table :tableConfig="tableconfig" v-model:pageresult="pageresult" ref="tableRef"
        @page-change="handleQuery(false)" />
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { Upload, Refresh } from '@element-plus/icons-vue'
import { createFreeButtonBase } from "@/shared/button-config";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";

const templateName = ref('被保险人模板下载')
const fileList = ref([])
const totalPeople = ref('-')
const _dataSet = ref([]); // 数据集合
const _loading = ref(false); // 加载中
const _current = ref(1); // 当前页
const _pageSize = ref(10);  // 每页显示条数
const _total = ref(1); // 总数

const visible = ref(false)

const pageresult = reactive<Pageresult>({
  result: "",
  /** 数据列表 */
  list: [],
  /** 总数 */
  total: 0,
});

const title = ref(`批次导入列表   总人数合计: ${totalPeople.value}`)

const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    title: title,
    titleBtns: [
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "手动刷新查看导入数据",
        type: "danger",
        size: "large",
        label: "手动刷新查看导入数据",
        icon: "Refresh",
        func: () => {
          handleQuery(true)
        },
      }),
    ],
    fromSchema: [
      {
        prop: "",
        inputtype: 'rtinput',
        title: "序号",
        width: '55',
        showIndex: true,
      },
      {
        prop: "cDptCnm",
        inputtype: 'rtinput',
        title: "批次号",
      },
      {
        prop: "cDptCnm",
        inputtype: 'rtinput',
        title: "业务单号",
      },
      {
        prop: "cDptCnm",
        inputtype: 'rtinput',
        title: "文件名称",
      },
      {
        prop: "cDptCnm",
        inputtype: 'rtinput',
        title: "导入完成时间",
      },
      {
        prop: "cDptCnm",
        inputtype: 'rtinput',
        title: "耗时",
      },
      {
        prop: "cDptCnm",
        inputtype: 'rtinput',
        title: "总条数",
      },
      {
        prop: "cDptCnm",
        inputtype: 'rtinput',
        title: "成功条数",
      },
      {
        prop: "cDptCnm",
        inputtype: 'rtinput',
        title: "失败条数",
      },
      {
        prop: "cDptCnm",
        inputtype: 'rtinput',
        title: "任务状态",
      },
      {
        prop: "cDptCnm",
        inputtype: 'rtinput',
        title: "导入进度",
      },
      {
        prop: "cDptCnm",
        inputtype: 'rtinput',
        title: "导入类型",
      },
      {
        prop: "cDptCnm",
        inputtype: 'rtinput',
        title: "导入人员",
      },
    ],
  })
);



const showDialog = () => {
  visible.value = true
}

const handleRemove = (uploadFile, uploadFiles) => {
  console.log(uploadFile, uploadFiles)
}

const handlePreview = (file) => {
  console.log(file)
}

const handleQuery = (flag) => {
  refreshData(flag)
}

const refreshData = (flag = false) => {
  if (flag && _current.value !== 1) {
    _current.value = 1;
  }
  _loading.value = true;
};

onMounted(() => {
  console.log('onMounted')
})

</script>

<style scoped lang="scss">
.importBox {
  text-align: left;
  color: #606266;
  margin: 20px 10px;

  .mb10 {
    margin-bottom: 10px;
  }

  .uploadTxt {
    vertical-align: text-bottom;
  }

  .upload-demo {
    display: inline-block;
  }

  .tableTitleSty {
    .title {
      font-size: 16px;
      color: #000;
      margin-right: 30px;
    }

    .total {
      color: #606266;
    }
  }
}

.my-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 16px;

  .tipsSty {
    border: 1px solid rgb(242.5, 208.5, 157.5);
    border-radius: 4px;
    background: rgb(250, 236.4, 216);
    padding: 3px 10px;
    font-size: 12px;
  }
}
</style>
