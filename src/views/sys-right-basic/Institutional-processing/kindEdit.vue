<!-- 配置 -->
<template>
  <el-dialog v-model="dialogVisible" width="80%" title="机构列表" class="system-dialog-scroll">
    <div>
      <el-row :gutter="20">
        <el-col :span="24" class="col-md-6">
          <el-form ref="freeEditRef" :model="formconfig1" >
            <el-form-item label="机构搜索" prop="companyId">
              <el-input v-model="formconfig1.companyId" style="flex: 1;"></el-input>
              
              <el-button-group class="ml-4">
                <el-button icon="Search" @click="handleQuery()"/>
                <el-button icon="Refresh" @click="resetForm(true)"/>
              </el-button-group>
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="12" class="col-md-6">
          <el-card :bordered="false" class="index-blk">
            <span>机构列表</span>
            <el-button-group class="ml-4">
              <el-button v-model="isExpand" @click="toggleExpandAll(isExpand)">
                {{ isExpand ? '展开全部' : '收起全部' }}
              </el-button>
              <el-button v-model="isExpand" @click="toggleCheckAll(isCheck)">
                {{ isCheck ? '全选' : '取消全选' }}
              </el-button>
            </el-button-group>
            <div style="height: 25rem; width: 100%; overflow: scroll; overflow-x: scroll;">
              <el-tree ref="treeRef"
                :data="nodes"
                node-key="id"
                :default-expanded-keys="expandedKeys"
                :props="defaultProps"
                :show-line="true"
                :show-checkbox="true"
                @node-expand="handleNodeExpand"
                @node-collapse="handleNodeCollapse"
                @check="handleCheck"
                @check-change="handleCheckChange"
              ></el-tree>
            </div>
          </el-card>
        </el-col>
        <el-col :span="12" class="col-md-18">
          <span>选中项</span>
          <el-button-group class="ml-4">
            <el-button :disabled="pageresult.list.length === 0" @click="handleRemove()">删除</el-button>
            <el-button :disabled="pageresult.list.length === 0" @click="handleCheckAll(selectList.length == pageresult.list.length)">
              {{
                pageresult.list.length==0 || (selectList.length < pageresult.list.length) ? '选中全部' : '反选全部'
              }}
            </el-button>
            <el-button :disabled="pageresult.list.length === 0" @click="handleDeleteAll()">删除全部</el-button>
          </el-button-group>
          <!-- <app-table 
            :tableConfig="tableconfig"
            v-model:pageresult="pageresult"
            ref="tableRef"
            @selection-change="handleSelectionChange"
          /> -->
          <div class="table-container">
            <div v-for="(item, index) in pageresult.list" :key="index">
              <el-checkbox v-model="item.checked" @change="handleItemChange(item,index)">
                <p>{{ item.label }}</p>
              </el-checkbox>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
    <div style="margin-top: 20px" :style="{ textAlign: 'right' }">
      <rt-button
        :item="{
          type: 'primary',
          label: '返回',
          func: () => {
            dialogVisible = false;
          },
        }"
      />
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();

import { ref } from "vue";
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";

const freeEditRef = ref<AppFreeEditMethod | null>(null);
import { createFreeButtonBase } from "@/shared/button-config";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { getBasicKindList } from "@/api/prod";
import { useDzModal } from "@/common/dzmodel/DzModalService";
const dzmodal = useDzModal();
const tableRef = ref<AppTableMethod | null>(null);
const selectList = ref<any>([]);
const dialogVisible = ref(true);
const formconfig1 = ref({
  companyId: '',
})
const isExpand = ref(true); // 是否展开
const isCheck = ref(true); // 是否全选中
const treeRef = ref<InstanceType<typeof ElTree>>() as any; // 树形控件
const treeList = ref([]); // 树形选择数据
const expandedKeys = ref<any>([]); // 展开的节点
const allExpanded = ref(false); // 是否全部展开
const allNodes = ref([]); // 所有节点
const nodes = ref<Array<any>>([]);
const defaultProps = {
  children: 'children',
  label: 'label',
  isLeaf: 'leaf',
};
const props = defineProps({
	data: {
		type: Object,
		default: () => ({}),
	},
})

const pageresult = reactive<Pageresult>({
  result: "",
  /** 数据列表 */
  list: [],
  /** 总数 */
  total: 0,
});

const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    isPage: false,
    showSelection: true,
    maxHeight: 350,
    fromSchema: [
      {
        prop: "label",
        inputtype: "rtinput",
        title: "选择项",
        minWidth: 180,
      },
    ],
  })
);

onMounted(async () => {
  loadTree();
});

watch(
  () => props.data,
  (newTableConfig) => {
    pageresult.list = [
      { names: "张三", text: "核保意见" },
      { names: "李四", text: "核保意见" },
    ];
    pageresult.total = 2;
  },
  { deep: true }
);

// 绑定方法
const method = {
  func1: () => {
    console.log(getRules);
  },
};

function loadTree() {
  nodes.value = [];
  nextTick(() => {
    nodes.value = [
      { 
        id: 1, label: '一级 1', 
        children: [
          { checked:false, id: 11, label: '二级 1-1' },{ checked:false, id: 12, label: '二级 1-2' }
        ]
      },
      { id: 2, label: '一级 2', children: [{ checked:false, id: 21, label: '二级 2-1' }] },
    ]
  })
}

// 展开 收起 全部
function toggleExpandAll(type: any) {
  isExpand.value = !type;
  if(type){
    Object.values(treeRef.value.store.nodesMap).forEach((v: any)=>{
      const i = expandedKeys.value.indexOf(v.data.id)
      if(i === -1) {
        if(v.data.children && v.data.children.length > 0) expandedKeys.value.push(v.data.id);
        v.expand();
      }
    });
    // return;
  }else{
    Object.values(treeRef.value.store.nodesMap).forEach((v: any)=>v.collapse());
    expandedKeys.value = [];
  }
  checkAllExpanded()
}

// 全选 取消全选
function toggleCheckAll(type: any) {
  isCheck.value = !type;
  if(type){
    Object.values(treeRef.value.store.nodesMap).forEach((v: any)=>v.setChecked(true));
    return;
  }else{
    Object.values(treeRef.value.store.nodesMap).forEach((v: any)=>v.setChecked(false));
  }
}

/** 查询 */
function handleQuery(flag?: boolean) {
  const r = tableRef.value?.getPartnerPage(flag); //获取分页数据
  const s = formconfig1; //获取表单数据
  const param = Object.assign(s, r);
  getBasicKindList(param)
    .then((res) => {
      const { code, data, msg } = res;
      if (200 === code) {
        pageresult.list = [];
        pageresult.list = data.result;
        pageresult.total = data.total;
        pageresult.list = [
          { cKindNo: "01", cNmeCn: "货物运输险", cNmeEn: "Cargo", cStatus: "1", type: null },
          { cKindNo: "02", cNmeCn: "货物运输险", cNmeEn: "Cargo", cStatus: "1", type: null },
          { cKindNo: "03", cNmeCn: "货物运输险", cNmeEn: "Cargo", cStatus: "1", type: null },
          { cKindNo: "04", cNmeCn: "货物运输险", cNmeEn: "Cargo", cStatus: "1", type: null },
        ]
      } else {
        ElMessage.error(msg);
      }
    })
    .finally(() => {});
}

function resetForm(flag?: boolean) {
  formconfig1.value.companyId = '';
  handleQuery(flag);
}

// 获取所有节点
const getAllNodes = () => {
  allNodes.value = [];
  const traverse = (nodes) => {
    nodes.forEach(node => {
      allNodes.value.push(node);
      if (node.children) {
        traverse(node.children);
      }
    });
  };
  traverse(nodes.value); // 注意：这里用的是 treeData.value 因为它是响应式的引用对象
};

// 树形节点被展开
const handleNodeExpand = (data: any, node: any, treeNode: any) => {
  const i = expandedKeys.value.indexOf(data.id);
  if(i === -1) expandedKeys.value.push(data.id); // 添加已展开的key
  checkAllExpanded();
};

// 树形节点被关闭
const handleNodeCollapse = (data, { node, treeNode }) => {
  const index = expandedKeys.value.indexOf(data.id);
  if (index > -1) {
    expandedKeys.value.splice(index, 1); // 从数组中移除已折叠的key
  }
  checkAllExpanded();
};

// 检查是否所有节点都已展开
const checkAllExpanded = () => {
  const expandedList = ref<any>([]);;
  Object.values(treeRef.value.store.nodesMap).forEach((v: any)=>{
    if(v.childNodes && v.childNodes.length > 0) expandedList.value.push(v.data.id);
  });
  isExpand.value = expandedList.value.length === expandedKeys.value.length?false:true;
};

// 树形复选框选中事件
const handleCheck = (checkedKeys, { checkedNodes, checkedHalfNodes }) => {
  // checkedKeys // 所有展开的节点keys
  // checkedNodes // 所有展开的节点对象数组
  getAllNodes();
  nextTick(() => {
    isCheck.value = allNodes.value.length !== checkedNodes.length?true:false; // 检查是否所有节点都已展开
  })
};

// 树形复选框选中事件
const handleCheckChange = (data: any,checked: boolean,indeterminate: boolean) => {
  const arr = treeRef.value.getCheckedNodes();
  pageresult.list = arr.filter((item: any) => !item.children);
  // 原有数据选中不变，新加入默认不选中
  pageresult.list.forEach((item: any) => {
    const i = selectList.value.findIndex((v: any) => v.id === item.id);
    if (i === -1) {
      item.checked = false;
    }
  });
  pageresult.list = [...pageresult.list];
};

// 表格每行多选事件
function handleItemChange(item: any, index: any) {
  item.checked = !item.checked;
  pageresult.list[index].checked = !pageresult.list[index].checked;
  pageresult.list = [...pageresult.list];
  const i = selectList.value.findIndex((v: any) => v.id === item.id);
  if (i === -1) {
    selectList.value.push(item);
  } else {
    selectList.value.splice(i, 1);
  }
}

// 表格删除
function handleRemove() {
  if (selectList.value.length == 0) {
    ElMessage.warning("请选择一条数据");
    return;
  }
  // 删除对应表格中，以及选中列表中数据】
  selectList.value.forEach((item: any) => {
    const i = pageresult.list.findIndex((v: any) => v.id === item.id);
    if (i !== -1) {
      pageresult.list.splice(i, 1);
      // 对应树结构中选中数据反选
      treeRef.value.setChecked(item.id, false, true);
    }
  });
  selectList.value = [];
  pageresult.list = [...pageresult.list];
  isCheck.value = true; // 改变树按钮状态
}

// 表格选择全部 | 取消全部
function handleCheckAll(type: any) {
  pageresult.list.forEach((item: any) => {
    item.checked = !type?true:false;
    if(!type) {
      const i = selectList.value.findIndex((v: any) => v.id === item.id);
      if(i === -1) selectList.value.push(item);
    }
  })
  if(type) selectList.value = [];
  pageresult.list = [...pageresult.list];
}

// 表格删除全部
function handleDeleteAll() {
  // 对应树结构中选中数据反选
  pageresult.list.forEach((item: any) => {
    treeRef.value.setChecked(item.id, false, true);
  });
  selectList.value = pageresult.list = [];
  isCheck.value = true; // 改变树按钮状态
}

</script>

<style scoped>
.system-dialog-scroll :deep(.el-dialog__body) {
  max-height: 400px;
  overflow: auto;
}

.table-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 20px;
}
.table-container > div {
  flex: 100%;
  border: 1px solid #ccc;
  border-bottom: none;
  padding: 10px;
}
.table-container >>> p {
  padding-left: 10px;
}
.table-container > div:last-child {
  border-bottom: 1px solid #ccc;
}
:deep(.el-tree-node__expand-icon) {
  font-size: 18px;
}
</style>
