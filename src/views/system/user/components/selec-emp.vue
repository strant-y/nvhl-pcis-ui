<script setup lang="ts">
import { ref, defineProps } from 'vue'
import { getEmpList } from "@/api/dict/index";
import { UserQuery, UserPageVO } from '@/api/user/types';
import { codeListViewStore } from '@/store';
import {idxParamKey, IdxParamProps, useIdxParam} from "@/views/pcis/support/useIdxParam";

const emits = defineEmits(['ok','cancel'])
const props = defineProps({
   data: Object,
   dialog: {
    default:{
        title:'弹窗',
    }
   }
});
const dialogVisible = ref(true)
const isUpper = ref(false)
const datas = ref<Record<string, any>[]>([])
const loading = ref(false); //  加载状态
const pageData = ref<UserPageVO[]>([]); // 用户分页数据
const user = JSON.parse(sessionStorage.getItem("user") || "{}") as Record<
  string,
  any
>;
const total = ref(0); // 数据总数
const cCtfctTyp = ref<OptionType[]>([]);
const sex = ref<OptionType[]>([]);

function getValue(type:any,code: any ) {
    if(type === 'ctfc'){
       const r = cCtfctTyp.value.filter(item => item.value === code);
       if(r!=null && r.length > 0){
        return r[0].label;
       }
    }
    if(type === 'sex'){
        const r = sex.value.filter(item => item.value === code);
       if(r!=null && r.length > 0){
        return r[0].label;
       }
    }
}
const queryParams = reactive<UserQuery>({
  pageNum: 1,
  pageSize: 5,
  subordinate: '1',
  companyId : user.companyId || ""
});

const idxParam: IdxParamProps = inject(idxParamKey, useIdxParam());
const codeListStore = codeListViewStore(idxParam.cdeListViewProps);

onMounted(()=>{
    codeListStore.queryCodeListByCode('allCertificateType',false,true)
      .then((res: OptionType[]) => cCtfctTyp.value = res).catch((err: unknown) => {
        console.error(err);
        cCtfctTyp.value = [];
    });
    codeListStore.queryCodeListByCode('SexType',false,true)
      .then((res: OptionType[]) => sex.value = res).catch((err: unknown) => {
        console.error(err);
        sex.value = [];
    });
})

function handleQuery(){
    loading.value = true;
    getEmpList(queryParams)
  .then(( res ) => {
    pageData.value = res.data.result;
    total.value = res.data.total;
  })
  .finally(() => {
    loading.value = false;
  });
}
function handleSelectionChange(i: UserPageVO){
    emits('ok',{res:i});
    dialogVisible.value = false;
}

function closeDialog(){
    emits('cancel',{});
    dialogVisible.value = false;
}

</script>

<template>
    <!-- 弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialog.title"
      style="width: 1000px;"
      class="system-dialog-scroll"
      append-to-body
      @close="closeDialog"
    >
    <div class="search-container">
        <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item prop="companyId" label="归属机构" >
              <dept v-model="queryParams.companyId"/>
           </el-form-item>
           <el-form-item label="是否包含下级" prop="subordinate" >
            <el-radio-group v-model="queryParams.subordinate" >
              <el-radio :value="'1'">是</el-radio>
              <el-radio :value="'0'">否</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item >

          </el-form-item>
          <el-form-item label="工号" prop="opCde">
              <el-input
                v-model="queryParams.opCde"
                placeholder="工号"
                clearable
              />
            </el-form-item>
             <el-form-item label="姓名" prop="opCnm">
              <el-input
                v-model="queryParams.opCnm"
                placeholder="姓名"
                clearable
              />
            </el-form-item>
        </el-form>
        <div class="search-button">
            <el-button type="primary" @click="handleQuery"
            ><i-ep-search />搜索</el-button>
        </div>
    </div>
    <el-table
        v-loading="loading"
        :data="pageData"
        border
        empty-text="无数据"
        @row-dblclick="handleSelectionChange"
      >
        <el-table-column
          key="opCde"
          label="员工工号"
          align="center"
          prop="opCde"
        />
        <el-table-column
          key="opCnm"
          label="员工名称"
          align="center"
          prop="opCnm"
        />
        <el-table-column
          label="归属机构"
          align="center"
          prop="cDptCnm"
        />
        <el-table-column
          label="性别"
          align="center"
          prop="cSex"
        >
        <template #default="scope">
            {{ getValue('sex',scope.row.cSex) }}
          </template>
        </el-table-column>
        <el-table-column
          label="联系方式"
          align="center"
          prop="cMobile"
        />
        <el-table-column
          label="证件类型"
          align="center"
          prop="cCtfctTyp"
        >
        <template #default="scope">
            {{ getValue('ctfc',scope.row.cCtfctTyp) }}
          </template>
        </el-table-column>
        <el-table-column
          label="证件号码"
          width="200"
          align="center"
          prop="cCtfctNo"
        />
      </el-table>
    
      <pagination
        v-if="total > 0"
        v-model:total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        layout='prev, pager, next'
        @pagination="handleQuery"
      />
    </el-dialog>
</template>

<style scoped>
.system-dialog-scroll :deep(.el-dialog__body) {
  max-height: 400px;
  overflow: auto;
}

.search-container {
    padding: 25px 20px 15px 10px;
    background-color: var(--el-bg-color-overlay);
    border: 1px solid var(--el-border-color-light);
    border-radius: 5px;
}
.search-container > .el-form{
    display: grid;
    grid-template-columns: repeat(3, 1fr);
}
.search-container > .el-form > .el-form-item > .el-form-item__label{
    width: 100px;
}
  .search-container > .search-button{
    text-align: end;
}
</style>
