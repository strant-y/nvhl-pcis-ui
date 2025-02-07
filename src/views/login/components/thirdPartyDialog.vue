<!-- 第三方登录弹窗 -->
<template>
  <el-dialog
    v-model="dialogShow"
    title="第三方"
    width="800px"
    append-to-body
    :destroy-on-close="true"
    :close-on-click-modal="false"
    @close="closeDialog"
  >
    <el-tabs v-model="activeName" >
      <!-- <el-tabs v-model="activeName" @tab-click="handleClick"> -->
      <el-tab-pane label="被保人" name="individualUsers">
        <el-form ref="cUserformRef" :model="cUserform" :rules="cUserRules" label-width="100px">
          <el-row>
            <el-col :span="12">
              <el-form-item label="证件类型" prop="cUserDocumentType">
                <dictionary
                  v-model="cUserform.cUserDocumentType"
                  :unAuthor="true"
                  :typeCode="cUserform.cUserCode"
                />
              </el-form-item>
            </el-col>
            <el-col :span="1" />
            
            <el-col :span="5" style="text">
              <el-radio-group v-model="cUserform.cUserType" @change="cheangeUserTyp">
                <el-radio value="0">企业</el-radio>
                <el-radio value="1">个人</el-radio>
              </el-radio-group>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="名称" prop="cNume">
                <el-input
                  v-model="cUserform.cNume"
                  placeholder="请输入姓名"
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="证件号码" prop="cIdNumber">
                <el-input
                  v-model="cUserform.cIdNumber"
                  placeholder="请输入证件号码"
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="保单号" prop="cPolicyNo">
                <el-input
                  v-model="cUserform.cPolicyNo"
                  placeholder="请输入保单号"
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-tab-pane>
    </el-tabs>
    <el-row justify="center" style="margin-top: 20px">
      <el-button type="primary" @click="handleSubmit">绑 定</el-button>
    </el-row>
  </el-dialog>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import router, { resetRouter } from "@/router";
import { bindUser } from "@/api/auth";
const props = defineProps({
  dialogShow: {
    type: Boolean,
    default: false,
  },
  username: {
    type: String,
    default: "",
  },
});
const dialogShow = computed({
  get() {
    return props.dialogShow;
  },
  set(val) {
    emits("update:dialogShow", val);
  },
});
const route = useRoute();
const activeName = ref("individualUsers");
const cUserformRef = ref(null);
const cUserform = ref({
  cUserDocumentType: "",
  cIdNumber: '',
  cUserType:'0',
  cNume:'',
  cPolicyNo:'',
  cUserCode:'firmCertificateType'
});
const cheangeUserTyp = (res) => {
  cUserform.value.cUserDocumentType = '';
  if(res === '1'){
    cUserform.value.cUserCode = 'personageCertificateType';
  }else{
    cUserform.value.cUserCode = 'firmCertificateType';
  }
}
const cUserRules = reactive({
  cUserDocumentType: [{ required: true, message: "请输入证件类型", trigger: "change" },],
  cIdNumber: [{ required: true, message: "请输入证件号码", trigger: "change" }],
  cNume: [{ required: true, message: "请输入名称", trigger: "change" }],
  cPolicyNo: [{ required: true, message: "请输入保单号", trigger: "change" }],
});
const total = ref(0);
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
});
const multipleTableRef = ref();
// 表格数据
const tableData = ref([]);
// 查询
const handleQuery = async () => {
};
const resetQuery = () => {
  queryParams.pageNum = 1;
  queryParams.pageSize = 10;
  queryParams.cUserName = "";
  handleQuery();
};
// 切换
const handleClick = () => {};
const bindRes = (res) => {
  const { msg, code, tokenType, token } = res;
  if (200 === code) {
    emits("update:dialogShow", false);
    const userData = res.user;
    sessionStorage.setItem("token", tokenType + token);
    sessionStorage.setItem("opOrg", userData.companyId);
    sessionStorage.setItem("user", JSON.stringify(userData));
    sessionStorage.setItem("returntime", res.returntime);
    const query: LocationQuery = route.query;
    const redirect = (query.redirect as LocationQueryValue) ?? "/";
    const otherQueryParams = Object.keys(query).reduce(
      (acc: any, cur: string) => {
        if (cur !== "redirect") {
          acc[cur] = query[cur];
        }
        return acc;
      },
      {}
    );
    ElMessage.success(msg);
    router.push({ path: redirect, query: otherQueryParams });
  } else {
    ElMessage.error(msg);
  }
};
// 提交
const handleSubmit = () => {
  const { username } = props;
  if (activeName.value === "individualUsers") {
    cUserformRef.value.validate((valid) => {
      if (valid) {
        const params = {
          username,
          usertyp: "1",
          certfCde: cUserform.value.cIdNumber,
          certfCls: cUserform.value.cUserDocumentType,
          cName: cUserform.value.cNume,
          cPolicyNo: cUserform.value.cPolicyNo,
        };
        bindUser(params).then((res) => {
          bindRes(res);
        });
      } else {
        console.log("error submit!!");
        return false;
      }
    });
  } else {
    const array = multipleTableRef.value.getSelectionRows();
    if (array == null || array.length != 1) {
      ElMessage.warning("请选择一条数据");
      return;
    }
    const params = { username, usertyp: "2", partnerCde: array[0].cPartnerCde };
    bindUser(params).then((res) => {
      bindRes(res);
    });
  }
};
const emits = defineEmits(["update:dialogShow"]);
// 关闭弹框
const closeDialog = () => {
  emits("update:dialogShow", false);
};

onMounted(() => {
  // 初始化时,清空由于赋值导致的校验被体现出来
  setTimeout(() => {
      cUserformRef.value.clearValidate();
    },200);
});
</script>
