<template>
  <div>
    <el-row>
      <el-col :span="7">
        <div style="background-color: #f3f3f3;line-height:43px;">
          <span style="font-size: 18px; margin-left: 15px"
            >必须选择至少一项主条款</span
          >
        </div>
      </el-col>
      <el-col :span="7">
        <div class="search-btn" style="line-height: 45px;">
          <div style="float: right;">
            <div class="inline-block-div" style="width: 75%">
              <rtinput v-model="query.main" :item="{ placeholder: '请输入主条款名称或编码' }" />
            </div>
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
      <el-col :span="10">
        <div class="search-btn" style="display: flex;align-items: center;">
          <span style="font-size: 16px;line-height: 32px;"> 请选择附加条款责任 </span>
          <div style="width: 50%; float: right;flex: 1; display: flex; justify-content: end;">
            <div class="inline-block-div" style="width: 75%">
              <rtinput v-model="query.sub" :item="{ placeholder: '请输入附加条款名称或编码' }" />
            </div>
            <rtButton
              :item="{
                icon: 'Search',
                func: () => {
                  additionalRef.filter(query.sub);
                },
              }"
            />
          </div>
        </div>
      </el-col>
      <el-col :span="12">
        <div style="height: 250px; border: 1px solid #f3f3f3; overflow-y: auto">
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
      <el-col :span="12">
        <div style="height: 250px; border: 1px solid #f3f3f3; overflow-y: auto">
          <el-tree
            ref="additionalRef"
            style="max-width: 600px"
            :props="dataprops"
            node-key="id"
            show-checkbox
            :data="data2"
            :filter-node-method="subfilterNode"
            :check-strictly="true"
            @check-change="selectadditionMethod"
          />
        </div>
      </el-col>
      <el-col :span="24">
        <div style="background-color: #f3f3f3">
          <span style="font-size: 18px; margin-left: 15px">已选择的条款</span>
        </div>
      </el-col>
      <el-col :span="24">
        <div style="overflow-y: auto; max-height: 250px">
          <el-tree
            style="max-width: 600px"
            :props="dataprops"
            node-key="id"
            :data="data3"
            :default-expand-all="true"
          >
            <template #default="{ node, data }">
              <div class="custom-tree-node">
                <span v-for="(level, index) in node.level - 1" :key="index" class="tree-indent"></span>
                <span v-if="node.level > 1" class="tree-line"></span>
                <span v-if="node.level > 1" class="tree-line-vertical"></span>
                <span class="node-label">{{ node.label }}</span>
              </div>
            </template>
          </el-tree>
        </div>
      </el-col>
      <el-col :span="24">
        <div style="float: right; margin-right: 20px">
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
import { tremMap } from "@/pcis/prodRef/cvrgRef/trem-map-config.ts"
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
  disabled: 'disabled',
};

const query =ref({
  main:"",
  sub:""
});

const data1 = ref([]);
const mainRef = ref<InstanceType<typeof ElTree>>();
const additionalRef = ref<InstanceType<typeof ElTree>>();
const expandedKeys = ref<string[]>([]);

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
    });
    seadd["riskList"] = list;
  }

  selectAdditionNodes.value.push(seadd);
});
const data2 = ref([
  // {
  //   id: 1,
  //   label: "保险附加条款1(2024款)",
  //   children: [
  //     {
  //       id: 4,
  //       label: "保险附加责任1-1",
  //       children: [],
  //     },
  //   ],
  // },
]);

const data3 = ref<any>([
  // {
  //   id: 1,
  //   label: "保险附加条款1(2024款)",
  //   children: [
  //     {
  //       id: 4,
  //       label: "保险附加责任1-1",
  //       children: [],
  //     },
  //   ],
  // }
]);

// 绑定方法
const method = {};

// 绑定特殊验证器
const exRules = {};

const mainfilterNode = (value: string, data: Tree) => {
if (!value) return true
  return data.label.includes(value);
}

const subfilterNode = (value: string, data: Tree) => {
if (!value) return true
  return data.label.includes(value);
}

onMounted(async () => {
  const param = props.data.data;
  //添加条款只能查询一条主条款
  if (param.isselectData && param.isselectData.length > 0) {
    param['cTermNo'] = param.isselectData[0]["Term.cClauseCode"];
  }
  qryProdRelTermRiskList(param).then((res: any) => {
    const { code, data, msg } = res;
    if (200 === code) {
      data1.value = data;
      expandedKeys.value = data.map(item => item.id);
      data1.value.forEach((item: any) => { 
        if(tremMap.value[item.cUniqueTermNo]){
          const risks = tremMap.value[item.cUniqueTermNo];
          item.children?.forEach((i: any) => {
              if(risks.includes(i.cRiskNo)){
                i.disabled = param.type !== 'ECargo';
              }
          });
        }
        selectAdditionNodes.value.forEach(v=>{
          if(v.cRowId && v.cTermNo === item.cTermNo){
            item.disabled = param.type !== 'ECargo';
            item.children?.forEach((i: any) => {
              i.disabled = param.type !== 'ECargo';
            });
          }
        })
      });
      nextTick(() => {
        setNode();
      });
    } else {
      ElMessage.error(msg);
    }
  });
});

function setNode() {
  const addMainKey: any[] = [];
  if (selectAdditionNodes.value && selectAdditionNodes.value.length > 0) {
    selectAdditionNodes.value.forEach((item: any) => {
      if (item["cRdrTyp"] === "0") {
        if (item["riskList"] && item["riskList"].length > 0) {
          item["riskList"].forEach((risk: any) => {
            const k = item["cTermNo"] + risk["cRiskNo"];
            addMainKey.push(k);
          });
        }
        addMainKey.push(item["cTermNo"]);
      }
    });
  }
  ignoreCheckChange = true;
  mainRef.value?.setCheckedKeys(addMainKey, false);
  nextTick(()=>{
    ignoreCheckChange = false;
  })
}

let ignoreCheckChange = false;

function selectmainMethod(a: any, b: any, c: any) {
  const param = props.data.data;
  let mc = null;
  if(b){  // 先判断选中的责任,是否挂在互斥条款下
    data1.value.forEach((d: any) => {
      d.children?.forEach((child: any) => {
        if (child.id === a.id) {
          mc = d;
        }
      });
    });
  }
  if(mc && mutualExclusionClause.value.includes(mc.cUniqueTermNo) && param.type !== 'ECargo'){  //对应主条款存在互斥条款
    let addkey: any[] = [];
    // 先全量获取已选中数据
    const tree = mainRef.value?.getCheckedNodes(false, true);
    tree.forEach((t: any) => {
      if (addkey.indexOf(t.id) === -1) {  
        addkey.push(t.id);
      }
    });
    // 筛选出,所有互斥条款,并反选
    data1.value.forEach((d: any) => {
      if(d.cUniqueTermNo === mc.cUniqueTermNo){
        d.children?.forEach((child: any) => {
          if(child.id !== a.id){
            addkey = addkey.filter((node: any) => child.id !== node );
          }
        });
      }
    });
    mainRef.value?.setCheckedKeys(addkey, false);
  }
  // 重新判断,如果勾选责任,自动勾选主条款,如果主条款被反选,自动取消对应责任反选
  let addMainKey: any[] = [];
  const tree = mainRef.value?.getCheckedNodes(false, true);
  if ( !ignoreCheckChange && tree && tree.length > 0) {
    tree.forEach((t: any) => {
      if (addMainKey.indexOf(t.id) === -1) {
        addMainKey.push(t.id);
      }
    });
    if (a.cTermNo) {
      a.children?.forEach((child: any) => {
        if(b){
          addMainKey.push(child.id);
        }else{
          addMainKey = addMainKey.filter((node: any) => node !== child.id);
        }
      });
      mainRef.value?.setCheckedKeys(addMainKey, false);
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
    selectMainTerm(true);
  });
}
function selectMainTerm(isselect = true) {
  const tree = mainRef.value?.getCheckedNodes(false, true);

  let selectNode: any[] = [];
  let selectmainterm: any[] = [];
  tree?.forEach((item: any) => {
    // 获取选中的主条款信息
    if (item.cTermNo) {
      let seterm = Object.assign({}, item);
      let childnode: any[] = [];
      selectmainterm.push(item.cTermNo);
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
      seterm.cRdrTyp = "0";
      seterm.children = childnode;
      selectNode.push(seterm);
    }
  });
  if (isselect) {
    let additionStr = selectmainterm.join("@&");
    qryRelTermList({ cTermNo: additionStr }).then((res: any) => {
      const { code, data, msg } = res;
      const cClauseCategoryMap = {
        "1": "扩展类",
        "2": "限制类",
        "3": "规范类",
      }
      if (200 === code) {
        data2.value = data;
        data2.value.forEach((item: any) => {
          // 00425000166 00425000169附加条款不可用，设置为不可选择
          if(item.cTermNo === "00425000166" || item.cTermNo === "00425000169") {
            item.disabled = true;
          }
          const cClauseCategory = item.cClauseCategory ? cClauseCategoryMap[item.cClauseCategory] : "";
          item.label = cClauseCategory ? item.label + '_' + cClauseCategory : item.label;
          selectAdditionNodes.value.forEach(v=>{
            // 如果选中数据中有00425000169 00425000169，则移除
            if(v.cTermNo === "00425000166" || v.cTermNo === "00425000169") {
              selectAdditionNodes.value.splice(selectAdditionNodes.value.indexOf(v), 1)
            }
            if(v.cRowId && v.cTermNo === item.cTermNo){
              item.disabled = props.data.data.type !== 'ECargo';
              item.children?.forEach((i: any) => {
                i.disabled = props.data.data.type !== 'ECargo';
              });
            }
          })
        });
        const addtree = additionalRef.value?.getCheckedNodes(false, true);
        if (addtree && addtree.length !== 0) {
          selectAdditionNodes.value = addtree;
        };
        setTimeout(() => {
          setAdditionNode();
        }, 50);
      } else {
        ElMessage.error(msg);
      }
    });
  }

  // data3.value = selectNode;
  flushSelectData();
}

function setAdditionNode() {
  const addMainKey: any[] = [];
  if (selectAdditionNodes.value && selectAdditionNodes.value.length > 0) {
    selectAdditionNodes.value.forEach((item: any) => {
      if (item["cRdrTyp"] === "1") {
        if (item["riskList"] && item["riskList"].length > 0) {
          item["riskList"].forEach((risk: any) => {
            const k = item["cTermNo"] + risk["cRiskNo"];
            addMainKey.push(k);
          });
        }
        addMainKey.push(item["cTermNo"]);
      }
    });
  }
  additionalRef.value?.setCheckedKeys(addMainKey, false);
  nextTick(() => {
    const tree = additionalRef.value?.getCheckedNodes(false, true);

    let selectNode: any[] = [];
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
        seterm.cRdrTyp = "1";
        seterm.children = childnode;
        selectNode.push(seterm);
      }
    });
    // data3.value.push(...selectNode);
    flushSelectData();
  });
}

function selectadditionMethod(a: any, b: any, c: any) {
  // 重新判断,如果勾选责任,自动勾选附加条款,如果附加条款被反选,自动取消对应责任反选
  let addMainKey: any[] = [];
  const tree = additionalRef.value?.getCheckedNodes(false, true);
  if (tree && tree.length > 0) {
    tree.forEach((t: any) => {
      if (addMainKey.indexOf(t.id) === -1) {
        addMainKey.push(t.id);
      }
    });
    if (a.cTermNo) {
      if (!b) {
        a.children?.forEach((child: any) => {
          addMainKey = addMainKey.filter((node: any) => node !== child.id);
        });
      }
      additionalRef.value?.setCheckedKeys(addMainKey, false);
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
        additionalRef.value?.setCheckedKeys(addMainKey, false);
      }
    }
  }
  nextTick(() => {
    selectAdditionTerm();
  });
}
function selectAdditionTerm() {
  selectMainTerm(false);
  const tree = additionalRef.value?.getCheckedNodes(false, true);

  const addMainKey: any[] = [];
  // 重新判断,如果勾选责任,自动勾选主条款
  data2.value.forEach((item: any) => {
    item.children?.forEach((child: any) => {
      if (tree && tree.length > 0) {
        tree.forEach((t: any) => {
          if (t.id === child.id) {
            addMainKey.push(item.id);
            addMainKey.push(t.id);
          }
        });
      }
    });
  });
  if (tree && tree.length > 0) {
    tree.forEach((t: any) => {
      if (t.cTermNo) {
        addMainKey.push(t.id);
      }
    });
  }

  additionalRef.value?.setCheckedKeys(addMainKey, false);

  let selectNode: any[] = [];
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
      seterm.cRdrTyp = "1";
      seterm.children = childnode;
      selectNode.push(seterm);
    }
  });
  // data3.value.push(...selectNode);
  flushSelectData();
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
      seterm.cRdrTyp = "0";
      seterm.children = childnode;
      selectNode.push(seterm);
    }
  });

  const addtree = additionalRef.value?.getCheckedNodes(false, true);

  addtree?.forEach((item: any) => {
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
        const f = addtree?.filter(
          (child2: any) => child2.cRiskNo === child.cRiskNo
        );
        if (f !== null && f.length > 0) {
          childnode.push(...f);
        }
      });
      seterm.cRdrTyp = "1";
      seterm.children = childnode;
      selectNode.push(seterm);
    }
  });

  // selectNode.push(addtree);

  data3.value = selectNode;
}

async function selectOne() {
  // const isselectData = props.data.data.isselectData;
  // let Key: any[] = [];
  // let isuse: any[] = [];
  // const r = Object.keys(isselectData);
  // if (isselectData && r.length > 0) {
  //   r.forEach((item: any) => {
  //     Key.push(isselectData[item]["Term.cClauseCode"]);
  //   });
  //   data3.value.forEach((item: any) => {
  //     if (Key.includes(item.cTermNo)) {
  //       isuse.push(item.label);
  //     }
  //   });
  // }
  // if (isuse && isuse.length > 0) {
  //   let showMsg = `${isuse.join(",")}条款已存在，请重新选择!`;
  //   ElMessage.warning(showMsg);
  // } else {

  // }
  props.method.isOk(data3.value);
  emits("handleClose");
}

function fail() {
  emits("handleClose");
}
</script>

<style scoped>
.inline-block-div {
  display: inline-block;
}
.search-btn {
  width: 100%;
  height: 45px;
  background-color: #f3f3f3;
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

</style>
