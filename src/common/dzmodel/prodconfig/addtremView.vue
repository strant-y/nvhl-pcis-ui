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
            @check-change="selectMainTerm"
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
            @check-change="selectAdditionTerm"
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
  console.log(param);
  qryProdRelTermRiskList(param).then((res: any) => {
    const { code, data, msg } = res;
    if (200 === code) {
      data1.value = data;
      setTimeout(() => {
        setNode();
      }, 50);
    } else {
      ElMessage.error(msg);
    }
  });
});

function setNode() {
  const addMainKey: any[] = [];
  if (props.data.data.isselectData && props.data.data.isselectData.length > 0) {
    props.data.data.isselectData.forEach((item: any) => {
      if (item["Term.cRdrTyp"] === "0") {
        if (item["riskList"] && item["riskList"].length > 0) {
          item["riskList"].forEach((risk: any) => {
            const k = item["Term.cClauseCode"] + risk["TermRisktgt.cLiabCode"];
            addMainKey.push(k);
          });
        }
        addMainKey.push(item["Term.cClauseCode"]);
      }
    });
  }
  console.log(addMainKey);
  mainRef.value?.setCheckedKeys(addMainKey, false);
}
function selectMainTerm(isselect = true) {
  const tree = mainRef.value?.getCheckedNodes(false, true);
  let selectNode: any[] = [];
  let selectMainTerm: any[] = [];
  tree?.forEach((item: any) => {
    // 获取选中的主条款信息
    if (item.cTermNo) {
      let seterm = Object.assign({}, item);
      let childnode: any[] = [];
      selectMainTerm.push(item.cTermNo);
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
    let additionStr = selectMainTerm.join("@&");
    qryRelTermList({ cTermNo: additionStr }).then((res: any) => {
      const { code, data, msg } = res;
      if (200 === code) {
        data2.value = data;
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
  if (props.data.data.isselectData && props.data.data.isselectData.length > 0) {
    props.data.data.isselectData.forEach((item: any) => {
      if (item["Term.cRdrTyp"] === "1") {
        if (item["riskList"] && item["riskList"].length > 0) {
          item["riskList"].forEach((risk: any) => {
            const k = item["Term.cClauseCode"] + risk["TermRisktgt.cLiabCode"];
            addMainKey.push(k);
          });
        } else {
          addMainKey.push(item["Term.cClauseCode"]);
        }
      }
    });
  }
  additionalRef.value?.setCheckedKeys(addMainKey, false);
}

function selectAdditionTerm() {
  selectMainTerm(false);
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
