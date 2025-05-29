<template>
  <div>
    <el-row>
      <el-col :span="24">
        <div style="background-color: #f3f3f3">
          <span style="font-size: 18px; margin-left: 15px"
            >必须选择至少一项主条款</span
          >
        </div>
      </el-col>
      <el-col :span="12">
        <div class="search-btn">
          <div style="width: 50%; float: right">
            <div class="inline-block-div" style="width: 75%">
              <rtinput :item="{ placeholder: '请输入主条款名称或编码' }" />
            </div>
            <rtButton
              :item="{
                icon: 'Search',
              }"
            />
          </div>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="search-btn">
          <span style="font-size: 16px"> 请选择附加条款责任 </span>
          <div style="width: 50%; float: right">
            <div class="inline-block-div" style="width: 75%">
              <rtinput :item="{ placeholder: '请输入附加条款名称或编码' }" />
            </div>
            <rtButton
              :item="{
                icon: 'Search',
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
            :data="data1"
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
        <div style="overflow-y: auto; max-height: 150px">
          <el-tree
            style="max-width: 600px"
            :props="dataprops"
            node-key="id"
            :data="data3"
            :default-expand-all="true"
          />
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
import { qryProdRelTermRiskList, qryRelTermList } from "@/api/prod";
import { useValidator } from "@/typings/useValidator";

const { getRules } = useValidator();
import { ref, defineProps } from "vue";
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
};

const data1 = ref([]);
const mainRef = ref<InstanceType<typeof ElTree>>();
const additionalRef = ref<InstanceType<typeof ElTree>>();

const selectAdditionNodes = ref<any[]>([]);
props.data.data.isselectData?.forEach((item: any) => {
  let seadd: any = {};
  seadd["cRdrTyp"] = item["Term.cRdrTyp"];
  seadd["cTermNo"] = item["Term.cClauseCode"];

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

onMounted(async () => {
  const param = props.data.data;
  qryProdRelTermRiskList(param).then((res: any) => {
    const { code, data, msg } = res;
    if (200 === code) {
      data1.value = data;
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
  mainRef.value?.setCheckedKeys(addMainKey, false);
}

function selectmainMethod(a: any, b: any, c: any) {
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
      if (!b) {
        a.children?.forEach((child: any) => {
          addMainKey = addMainKey.filter((node: any) => node !== child.id);
        });
      }
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
      if (200 === code) {
        data2.value = data;
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

  data3.value = selectNode;
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
    data3.value.push(...selectNode);
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
  data3.value.push(...selectNode);
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
</style>
