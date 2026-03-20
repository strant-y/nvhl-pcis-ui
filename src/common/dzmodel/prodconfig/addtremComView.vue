<template>
  <div>
    <el-row>
      <el-col :span="12">
        <div style="background-color: var(--cvrg-sub-header-bg-color);line-height: 32px;margin: 0px 0 3px 0;">
          <span style="font-size: 14px; margin-left: 12px">
            必须选择至少一项条款
          </span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="search-btn" style="margin: 0px 0 3px 0;">
          <div class="search-btn-item">
            <rtinput
                v-model="query.main"
                :item="{ placeholder: '请输入主条款名称或编码' }"
            />
            <rtButton
                :item="{
                icon: 'Search',
                func: () => {
                  mainRef.filter(query.main);
                },
              }"
            />
          </div>
        </div>
      </el-col>
      <el-col :span="24">
        <div style="height: 250px; border: var(--rt-border); overflow-y: auto">
          <el-tree
            ref="mainRef"
            style="max-width: 600px"
            :props="dataprops"
            node-key="id"
            show-checkbox
            :check-strictly="true"
            :filter-node-method="mainfilterNode"
            :data="data1"
            :default-expanded-keys="expandedKeys"
            @check-change="selectmainMethod"
          />
        </div>
      </el-col>
      <el-col :span="24">
        <div style="background-color: var(--cvrg-sub-header-bg-color);line-height: 32px;margin: 8px 0 3px 0;">
          <span style="font-size: 14px; margin-left: 12px">已选择的条款</span>
        </div>
      </el-col>
      <el-col :span="24">
        <div style="overflow-y: auto; max-height: 250px;border: var(--rt-border);margin-bottom: 10px">
          <el-tree
            style="max-width: 600px"
            :props="dataprops"
            node-key="id"
            :data="data3"
            :default-expand-all="true"
          >
            <template #default="{ node, data }">
              <div class="custom-tree-node">
                <span
                  v-for="(level, index) in node.level - 1"
                  :key="index"
                  class="tree-indent"
                ></span>
                <span v-if="node.level > 1" class="tree-line"></span>
                <span v-if="node.level > 1" class="tree-line-vertical"></span>
                <span class="node-label">{{ node.label }}</span>
              </div>
            </template>
          </el-tree>
        </div>
      </el-col>
      <el-col :span="24">
        <div style="float: right;">
          <rtButton
            :item="{
              icon: 'RefreshLeft',
              label: '取消',
              func: () => {
                emits('handleClose');
              },
            }"
          />
          <rtButton
            :item="{
              icon: 'Pointer',
              label: '确定',
              type: 'primary',
              func: () => {
                selectOne();
              },
            }"
          />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps } from "vue";
import { qryProdRelTermRiskList, qryRelTermList } from "@/api/prod";
import { useValidator } from "@/typings/useValidator";
import { tremMap } from "@/pcis/prodRef/cvrgRef/trem-map-config.ts";
import { mutualExclusionClause } from "@/pcis/prodRef/cvrgRef/mutualExclusionClause.ts";

const { getRules } = useValidator();
const emits = defineEmits(["handleClose"]);
const isFree = ref(true);
const isCopy = ref(false);
const showMsg = ref("组件预览");
const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
  method: {
    type: Object,
    default: () => ({}),
  },
});

const dataprops = {
  children: "children",
  label: "label",
  disabled: "disabled",
};

const query = ref({
  main: "",
  sub: "",
});

const data1 = ref([]);
const mainRef = ref<InstanceType<typeof ElTree>>();
const expandedKeys = ref<string[]>([]);

let selfTerm = {};
const selectAdditionNodes = ref<any[]>([]);
props.data.data.isselectData?.forEach((item: any) => {
  let seadd: any = {};
  seadd["cRdrTyp"] = item["Term.cRdrTyp"];
  seadd["cTermNo"] = item["Term.cClauseCode"];
  seadd["cRowId"] = item["Term.cRowId"];

  if (item["riskList"] && item["riskList"].length > 0) {
    let list: any[] = [];
    item["riskList"].forEach((risk: any) => {
      list.push({ cRiskNo: risk["TermRisktgt.cLiabCode"] });
      if(risk["TermRisktgt.selfTermRisk"] === false){
        selfTerm[item["Term.cClauseCode"]+"_"+risk["TermRisktgt.cLiabCode"]] = risk;
      }
    });
    seadd["riskList"] = list;
  }
  selectAdditionNodes.value.push(seadd);
});

const data3 = ref<any>([]);

// 绑定方法
const method = {};

// 绑定特殊验证器
const exRules = {};

const mainfilterNode = (value: string, data: Tree) => {
  if (!value) return true;
  return data.label.includes(value);
};

const subfilterNode = (value: string, data: Tree) => {
  if (!value) return true;
  return data.label.includes(value);
};

onMounted(async () => {
  const param = props.data.data;
  //添加条款只能查询一条主条款
  param["cTermNo"] = param["mainTerm"];
  param["cDptCde"] = JSON.parse(sessionStorage.getItem("user") || '{}')?.companyId;
  let res = null;
  if (param.showType === "main") {
    res = await qryProdRelTermRiskList(param);
  } else {
    res = await qryRelTermList(param);
  }
  const { code, data, msg } = res;
  if (200 === code) {
    if(param.showMethod === 'edit'){
      const rr = data?.forEach((item: any) => {
        let nch = [];
        item.children?.forEach((it: any) => {
          const r = param.commonconf.termRisk?.filter((rt: any) => {
            return it.cRiskNo === rt.cRiskNo && rt.cIsCommon !=='1';
          });
          if(r.length > 0){
            nch.push(it);
          }
        });
        item.children = nch;
      });
      data1.value = data;
    }else{
      data1.value = data;
    }
    expandedKeys.value = data.map((item) => item.id);
    data1.value.forEach((item: any) => {
        item.children?.forEach((i: any) => {
          i.disabled = param.type !== "ECargo" && i.cIsDissel === '1';
        });
      selectAdditionNodes.value.forEach((v) => {
        if (v.cRowId && v.cTermNo === item.cTermNo) {
          item.disabled = param.type !== "ECargo";
          item.children?.forEach((i: any) => {
            i.disabled = param.type !== "ECargo";
          });
        }
      });
    });
    nextTick(() => {
      setNode();
    });
  } else {
    ElMessage.error(msg);
  }
});

function setNode() {
  const addMainKey: any[] = [];
  const param = props.data.data;
  if (param.showType === "main" || param.showMethod === "add" ) {
    addMainKey.push(param['mainTerm']);
  } else {
    if (selectAdditionNodes.value && selectAdditionNodes.value.length > 0) {
      selectAdditionNodes.value.forEach((item: any) => {
        addMainKey.push(item["cTermNo"]);
        if (item["riskList"] && item["riskList"].length > 0) {
          item["riskList"].forEach((risk: any) => {
            const k = item["cTermNo"] + risk["cRiskNo"];
            addMainKey.push(k);
          });
        }
      });
    }
  }
  ignoreCheckChange = true;
  mainRef.value?.setCheckedKeys(addMainKey, false);
  nextTick(() => {
    ignoreCheckChange = false;
  });
}

let ignoreCheckChange = false;
function selectmainMethod(a: any, b: any, c: any) {
  const param = props.data.data;
  let mc = null;
  if (b) {
    // 先判断选中的责任,是否挂在互斥条款下
    data1.value.forEach((d: any) => {
      d.children?.forEach((child: any) => {
        if (child.id === a.id) {
          mc = d;
        }
      });
    });
  }
  // 该模式下, 主条款只能选择一个,针对主条款进行互斥处理
  if(mc && mc.cRdrTyp === '0'){
    let addkey: any[] = [];
    // 选择主线之后,限定了选择范围,不在范围内的信息,全部直接反选
    let seKey : any[] = []; // 临时存储,选中的范围
    seKey.push(mc.id);
    mc.children?.forEach((child: any) => {
      seKey.push(child.id);
    });
    // 先全量获取已选中数据
    const tree = mainRef.value?.getCheckedNodes(false, true);
    tree.forEach((t: any) => {
      if (addkey.indexOf(t.id) === -1) {  
        addkey.push(t.id);
      }
    });
    if(addkey && addkey.length > 0){  // 将选中的数据,不在选中范围内的数据,全部反选
      addkey = addkey.filter((node: any) => seKey.indexOf(node) !== -1);
    }
    mainRef.value?.setCheckedKeys(addkey, false);
  }
  // 重新判断,如果勾选责任,自动勾选主条款,如果主条款被反选,自动取消对应责任反选
  let addMainKey: any[] = [];
  const tree = mainRef.value?.getCheckedNodes(false, true);
  if (tree && tree.length > 0) {
    tree.forEach((t: any) => {
      if (addMainKey.indexOf(t.id) === -1) {
        addMainKey.push(t.id);
      }
    });
    if (a.cTermNo) {
      a.children?.forEach((child: any) => {
        if (b) {
          addMainKey.push(child.id);
        } else {
          addMainKey = addMainKey.filter((node: any) => node !== child.id);
        }
      });
      if(!(ignoreCheckChange && param.showMethod === "edit")){
        mainRef.value?.setCheckedKeys(addMainKey, false);
      }
    } else {
      if (b) {
        data1.value.forEach((d: any) => {
          d.children?.forEach((child: any) => {
            if (child.id === a.id) {
              if (addMainKey.indexOf(d.id) === -1) {
                addMainKey.push(d.id);
              }
            }
          });
        });
        mainRef.value?.setCheckedKeys(addMainKey, false);
      }
    }
  }
  nextTick(() => {
    flushSelectData();
  });
}
function flushSelectData() {
  let selectNode: any[] = [];

  const tree = mainRef.value?.getCheckedNodes(false, true);
  tree?.forEach((item: any) => {
    // 获取选中的主条款信息
    if (item.cTermNo) {
      let seterm = Object.assign({}, item);
      let childnode: any[] = [];

      item.children?.forEach((child: any) => {
        const issel = childnode?.filter(
          (node: any) => node.cRiskNo === child.cRiskNo
        );
        if (issel != null && issel.length > 0) {
          return;
        }
        const f = tree?.filter(
          (child2: any) => child2.cRiskNo === child.cRiskNo
        );
        if (f !== null && f.length > 0) {
          childnode.push(...f);
        }
      });
      seterm.cRdrTyp = seterm.cRdrTyp;
      seterm.children = childnode;
      selectNode.push(seterm);
    }
  });

  data3.value = selectNode;
}

async function selectOne() {
  if(selfTerm && Object.keys(selfTerm).length > 0){
    Object.keys(selfTerm).forEach((termKey: any) => { 
      const t_r = termKey.split("_");
      data3.value.forEach((d: any) => { 
        if(t_r[0] === d.cTermNo){
          d.children.push({cRiskNo:t_r[1]});
        }
      });
    });
  }
  props.method.isOk(data3.value);
  emits("handleClose");
}

function fail() {
  emits("handleClose");
}
</script>

<style lang="scss" scoped>
@import "src/styles/custom-index";

:deep(.search-btn) {
  background: var(--cvrg-sub-header-bg-color);
  .search-btn-item {
    height: 32px;
    display: flex;
    align-items: center;
    @extend .rt-input__btn;
    @extend .rt-custom-input;
  }
}
.custom-tree-node {
  display: flex;
  align-items: center;
  position: relative;
}

.tree-indent {
  width: 24px;
  height: 1px;
}

.tree-line {
  position: absolute;
  left: 0;
  top: 50%;
  width: 24px;
  height: 1px;
  border-top: 1px solid #ccc;
}

.tree-line-vertical {
  position: absolute;
  left: 0;
  top: 0;
  width: 1px;
  height: 100%;
  border-left: 1px solid #ccc;
}

.node-label {
  margin-left: 8px;
}
:deep(.el-tree-node__expand-icon) {
  font-size: 18px;
}
</style>
