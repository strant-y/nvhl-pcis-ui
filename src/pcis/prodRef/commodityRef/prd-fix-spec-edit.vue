<template>
  <el-dialog v-model="dialogVisible" title="编辑特约" width="80%">
    <!-- 特别约定代码 -->
    <div class="form-item">
      <span>特别约定代码：</span>
      <span>{{ rowData.cSpecialCode }}</span>
    </div>
    <!-- 特别约定名称 -->
    <div class="form-item">
      <!-- <span>特别约定名称：</span> -->
      <span>{{ rowData.cSpecialName }}</span>
    </div>
    <el-divider></el-divider>
    <!-- 约定内容 -->
    <div class="form-item">
      <span>约定内容:</span>
      <div class="content-container">
        <div
          v-for="(item, index) in cNmeCnArray"
          :key="index"
          class="content-item"
        >
         <!-- type="number" -->
          <el-input
           
            v-if="item.match(/^\*+$/)"
            v-model="inputValues[index]"
            @input="updateCNmeCn(index, $event)" 
            :class="`input-${index}`"
            placeholder="请输入"
          ></el-input>
          <span v-else>{{ item }}</span>
        </div>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel" class="custom-button">取消</el-button>
        <el-button type="primary" @click="handleSave" class="custom-button"
          >保存</el-button
        >
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted, computed } from "vue";
import { isValidDateFlag } from "@/typings/method-public";
import { dataOpertaor } from "@/store/modules/data-opertaor";
const dialogVisible = ref(true);
const props = defineProps(["data","callback"]);
const rowData = ref(props.data); 
const opertaor = dataOpertaor();
//rowData当前行数据
/**
 * 拿到特约内容字段，通过***分割为数组，然后在html部分直接循环该数组，
 * 如果数组项为***则特换为input输入框，等用户输入完成后，再把数组join合并为实际的特约内容，回显到特约组件
 *
 *
 */
console.log("rowData", rowData);
onMounted(() => {
  // console.log("cNmeCnArray", cNmeCnArray.value);

    if(rowData.value.editList){
      // inputValues.value  = setEditList(inputValues.value,rowData.value.editList)
         inputValues.value  = setEditList( cNmeCnArray.value,rowData.value.editList)
    }
});

// 使用正则表达式分割字符串，保留分隔符 ** 作为单独的数组项

const cNmeCnArray = computed(() => rowData.value.cSpecialContent?.split(/(\*+)/) );
// const inputValues = ref<string[]>([]);
const inputValues = ref( //item.match(/^\*+$/)
  // cNmeCnArray.value.map((item) => (item === "*" ? "*" : item))
   cNmeCnArray.value?.map((item) => (/^\*+$/.test(item)? "" : item))
);

const updateCNmeCn = (index: number, value: string) => {
  inputValues.value[index] = value;
};
const handleCancel = () => {
  dialogVisible.value = false;
};
const handleSave = () => {
  rowData.value.editList = newListValue(cNmeCnArray.value,inputValues.value)
  // rowData.value.cSpecialContent =inputValues.value.join("");
  // const parts = cNmeCnArray.value.map((item, idx) =>
  //   item.match(/^\*+$/) ? inputValues.value[idx] : item
  // );
	// 本保单启运日期为：**年**月**日。
	if(rowData.value.cSpecialCode == "34201709"){
		if(rowData.value.editList[0] != "" && rowData.value.editList[1] != "" && rowData.value.editList[2] != ""){
			let flag = isValidDateFlag(rowData.value.editList[0],rowData.value.editList[1],rowData.value.editList[2])
			if(flag){
				const insrnc = opertaor.getTableRefByKey( "insrnc").getFromValue()
				if(!!insrnc && insrnc["Base.tAppTm"]){
					const BaseAppTm:Date = new Date(insrnc["Base.tAppTm"]);
					BaseAppTm.setHours(0, 0, 0, 0); // 清除时间部分

					let time = `${rowData.value.editList[0] + '-' + rowData.value.editList[1]+'-'+rowData.value.editList[2]}`
					const selected = new Date(time);
					selected.setHours(0, 0, 0, 0);
					if(BaseAppTm > selected) {
            ElMessage.warning("保单启运日期不能早于投保时间")
						return false
          }
				}
				console.log(insrnc);
			} else {
				ElMessage.warning("请输入正确的保单启运日期！");
				return false
			}
		} else {
			ElMessage.warning("本保单启运日期不能为空！");
			return false
		}
	}
  dialogVisible.value = false;
  rowData.value.cSpecialContent = joinWithAsterisks(inputValues.value) 
  // rowData.value.cSpecialContent = parts.join("");
  console.log("提交的数据:", rowData.value);
  props.callback({type: 'ok', data: rowData.value});
};

// 数组拼接
function joinWithAsterisks(arr, replacement = '**') {
  return arr.map(item => 
    item === '' ? replacement : item
  ).join('');
}


// 星号回显赋值
function setEditList(target, source, placeholderPattern = /^\*+$/) {
  const result = [...target]; // 复制目标数组，避免修改原数组
  let sourceIndex = 0; // 源数组的当前索引
  for (let i = 0; i < result.length; i++) {
    const targetItem = result[i];
    
    // 如果当前元素是占位符
    if (placeholderPattern.test(targetItem)) {
      // 如果源数组还有元素，则使用下一个元素进行替换
      if (sourceIndex < source.length) {
        result[i] = source[sourceIndex];
        sourceIndex++;
      }
    }
  }
  return result;
}


// 星号修改赋新值
function newListValue(original, modified, placeholderPattern = /^\*+$/) {
  const result = [];
  for (let i = 0; i < original.length; i++) {
    // 如果原始位置是占位符
    if (placeholderPattern.test(original[i])) {
      // 获取占位符长度（星号数量）
      const placeholderLength = original[i].length;
      
      // 如果该位置已被修改，则使用修改后的值
      // 否则使用占位符本身（保持原始长度）
      const value = modified[i] !== original[i] 
        ? modified[i] 
        : '*'.repeat(placeholderLength);
      result.push(value);
    }
  }
  return result;
}

</script>
<style scoped>
.form-item {
  margin-bottom: 20px;
  font-size: 16px; /* 统一字体大小 */
}

.el-row {
  display: flex;
  align-items: center;
}

.el-col {
  display: flex;
  align-items: center;
}

.el-input {
  font-size: 16px; /* 统一字体大小 */
}

.dialog-footer {
  text-align: right;
  margin-top: 20px;
}

.custom-button {
  font-size: 16px; /* 统一按钮字体大小 */
}
/* 为每个输入框添加不同的边框样式 */
.input-0 .el-input__inner {
  border-color: red; /* 示例颜色 */
}

.input-1 .el-input__inner {
  border-color: blue; /* 示例颜色 */
}
.content-container {
  display: flex;
  flex-wrap: wrap;
}

.content-item {
  display: inline-block;
  margin-right: 5px; /* 调整间距 */
}
</style>
