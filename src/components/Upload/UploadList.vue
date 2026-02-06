<template>
  <div class="right-container radius-md">
    <!-- 文件列表 -->
    <el-table
      ref="tableRef"
      v-if="props.showType === 'table-list'"
      class="u-table"
      @selection-change="handleSelectionChange"
      stripe
      :row-class-name="filterList"
      :data="waitFileList"
      v-show="waitFileList.length > 0"
      width="100%"
      border
    >
      <el-table-column type="selection" align="center" width="50" v-if="!readonly"/>
      <el-table-column
        v-if="type === 'image-upload'"
        prop="name"
        label="文件"
        align="center"
      >
        <template #default="{row}">
          <el-image
            title="点击预览"
            class="row-image"
            :src="row.url"
            :zoom-rate="1.2"
            :max-scale="7"
            :min-scale="0.2"
            :preview-src-list="srcList"
            :initial-index="4"
            fit="contain"
            @click="handle({type: 'preview',data:row})"
          />
        </template>
      </el-table-column>
      <el-table-column
        prop="name"
        label="文件名"
        align="center"
        show-overflow-tooltip
      >
        <template #default="{row}">
          <div >
<!--            <el-input-->
<!--              v-if="!readonly"-->
<!--              v-model="row.name"-->
<!--              placeholder="文件名"-->
<!--              type="text"-->
<!--              @change="updateFileName($event,row)"-->
<!--              :formatter="nameFormatter"-->
<!--              style="width: 80%;"-->
<!--            />-->
<!--            <span v-else>{{row.name.split('\.')[0]}}</span>-->
<!--            <span style="width: 20%;">{{' . '+row.name.split('\.')[1]}}</span>-->
            <el-text truncated>{{row.name}}</el-text>
          </div>
        </template>
      </el-table-column>
<!--      <el-table-column-->
<!--        label="文件大小"-->
<!--        align="center"-->
<!--        show-overflow-tooltip-->
<!--      >-->
<!--        <template #default="{row}">-->
<!--          <el-text>{{(row.size/1024).toFixed(2) + 'kb'}}</el-text>-->
<!--        </template>-->
<!--      </el-table-column>-->
      <el-table-column
        v-if="isClassification"
        label="类型"
        align="center"
      >
        <template #default="{row}">
          <dictionary
            v-if="!readonly"
            v-model="row.cClassification"
            :class="[!!row.correct ? 'select-input-true':'select-input-false']"
            type-code="UploadFileType"
            @dataChange="rowChange($event,row)"
          />
          <span v-else>{{getLabelName('UploadFileType',row.type)}}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="isRemark"
        label="备注"
        align="center"
        show-overflow-tooltip
      >
        <template #default="{row}">
          <el-input
            v-if="!props.readonly"
            v-model="row.cRemark"
            placeholder="备注"
            type="text"
            @change="rowChange($event,row)"
          />
          <el-text v-else>{{row.cRemark}}</el-text>
        </template>
      </el-table-column>
      <el-table-column
        label="状态"
        align="center"
        show-overflow-tooltip
      >
        <template #default="{row}">
          <el-tag type="success" v-if="row.status.includes('success')">已上传</el-tag>
          <el-tag type="info" v-else>未上传</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template #default="{row}">
          <el-button
            v-if="!readonly"
            type="danger"
            link
            size="small"
            @click="handle({type: 'delete', data: row})"
          ><i-ep-delete />删除</el-button
          >
          <el-button
            v-if="row.status.includes('success')"
            type="primary"
            link
            size="small"
            @click="handle({type: 'download', data: row})"
          ><i-ep-bottom />下载</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <div v-if="props.showType === 'card-list'" class="">
      <div
        class="el-upload-list el-upload-list--picture-card"
        v-for="(file,idx) in waitFileList"
      >
        <div v-show="props.filterValue === 'false' || (filterValue === file?.cClassification)">
          <div class="el-upload-list__item is-success">
            <el-image loading="lazy" :lazy="false" class="el-upload-list__item-thumbnail" :src="file.url" fit="contain"/>
            <label class="el-upload-list__item-status-label" v-if="file.status === 'success'">
              <el-icon color="#eee" class="el-icon--upload-success el-icon--check">
                <Check/>
              </el-icon>
            </label>
            <span class="el-upload-list__item-actions">
              <span
                class="el-upload-list__item-preview"
                @click="handle({type: 'preview',data: file})"
              >
                <el-icon><zoom-in /></el-icon>
              </span>
              <span
                v-if="file.status === 'success'"
                class="el-upload-list__item-delete"
                @click="handle({type: 'download', data: file})"
              >
                <el-icon><Download /></el-icon>
              </span>
              <span
                v-if="!readonly"
                class="el-upload-list__item-delete"
                @click="handle({type: 'delete', data: file})"
              >
                <el-icon><Delete /></el-icon>
              </span>
            </span>
          </div>
          <div
            class="card-bottom"
            v-if="isRemark"
          >
            <el-text v-if="readonly">
              {{ file.cRemark }}
            </el-text>
            <el-input
              v-else
              v-model="file.cRemark"
              placeholder="备注"
              type="text"
              @change="rowChange($event,file)"
            />
          </div>
        </div>
      </div>
      <slot name="pushFile"></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {codeListViewStore} from "@/store";
import {ElTable} from "element-plus";
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";

const props = defineProps({
  fileList: {
    type: Array,
    default: [],
  },
  selectedFile: {
    type: Array,
    default: [],
  },
  type:{
    type: String,
    default: undefined,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  // table | card
  showType: {
    type: String,
    default: 'card',
  },
  filterValue: {
    type: String,
    default: undefined,
  },
  isRemark: {
    type: Boolean,
    default: false,
  },
  isClassification: {
    type: Boolean,
    default: false,
  },
});

const tableRef = ref(ElTable);
const emits = defineEmits(['update:selectedFile','update:fileList','handle']);
const {selectedFile,fileList} = useVModels(props,emits);
const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const waitFileList = computed(()=>{
  if(!!fileList.value){
    return fileList.value.map((file)=>{
      if(file.correct === undefined || !!file.cClassification){
        file.correct = true;
      }
      return file;
    })
  }else{
    return [];
  }
});

// 开始标签组，表格数据过滤
function filterList({row,rowIndex}){
  if(props.filterValue !== 'false' && row.cClassification !== props.filterValue){
    return 'row-hidden'
  }else{
    return ''
  }
}

// function updateFileName(row) {
//   row.cFileName = row.name;
//   fileList.value =  waitFileList.value.map(file=>{
//     if(row.uid === file.uid){
//       return {...file,row};
//     }else{
//       return file;
//     }
//   })
//   console.log('fileList.value',fileList.value)
// }

const validate = ()=>{
  const flag = ref(true);
  if(!waitFileList.value || waitFileList.value.length === 0) return true;
  waitFileList.value.forEach( rowFile => {
    if(props.isClassification) { //
      const f = !!rowFile.cClassification;
      flag.value = f;
      rowFile.correct = f;
    }
    return rowFile;
  });
  return flag.value;
};

/**
 * 行数据变化
 * */
function rowChange(data,row) {
  if(!!data) handleChange(row);
}

/**
 * 更新行数据
 * @param row
 */
function handleChange(row){
  fileList.value = waitFileList.value.map(item=>{
    if(item.uid === row.uid){
      return {...row,item}
    }else{
      return item;
    }
  })
}

/***
 * 行操作
 * param.type 预览 | 下载 | 删除
 * param.data 行数据
 * */
const handle = (param: any)=> {
  emits('handle', param);
};


// 表格选中的数据
function handleSelectionChange(fileList: any[]) {
  selectedFile.value = fileList;
}

// 获取code值
function getLabelName(code: string,key: string){
  const codeListStore =  codeListViewStore(idxParam.cdeListViewProps);
  return codeListStore.getLabelByValue(code,key);
};

//将方法暴露出去
defineExpose({validate});
</script>

<style lang="scss" scoped>
.right-container {
  .u-header {
    width: 100%;
    padding: 10px;
    .header-font {
      line-height: 32px;
    }
    .right-fun {
      width: 15%;
      .check-menu {
        color: rgb(174, 174, 174);
        font-size: 14px;
      }
    }
    .el-button {
      border-radius: 5px;
    }
  }
  .u-table {
    max-height: 300px;
    overflow-y: auto;
    .el-table__header-wrapper {
      .cell {
        text-align: right;
      }
    }
  }
  .upload-s {
    width: 100%;
  }
  .r-bottom {
    width: 100%;
    position: relative;
    display: flex;
    justify-content: space-between;
    .pa-md{
      padding: 10px;
    }
  }

}

.row-image{
  width: 60px;
  height: 60px;
  &:hover{
    cursor: pointer;
    box-shadow: 0 1px 2px  var(--menu-hover);
  }
}

:deep(.select-input-false) {
    .el-select__wrapper {
      box-shadow: none;
      border: 2px rgba(231, 82, 62, 0.96) solid;
    }
}
:deep(.select-input-true) {
    .el-select__wrapper {
      border: none;
    }
}

:deep(.upload-demo){
  .el-upload-list{
    .el-upload-list__item{
      height: 180px;
      flex-wrap: wrap;
      display: flex;
      align-items: end;
      justify-content: center;
      .el-upload-list__item-thumbnail{
        height: 120px;
      }
    }
    .el-upload--picture-card{
      height: 180px;
    }
  }
}
:deep(.card-bottom){
  width: 95%;
  height: 30px;
  align-items: center;
  display: flex;
  justify-content: center;
  margin-right: 8px;
  margin-bottom: 10px;
  .el-input{
    border-bottom: 1px #eee solid;
    .el-input__wrapper{
      border-radius: 2px;
      background: rgba(223,223,223,0.3);
      border: none;
      box-shadow: none;
      width: 146px;
    }
  }
}
:deep(.el-table) {
  .row-hidden {
    display: none;
  }
}
</style>
