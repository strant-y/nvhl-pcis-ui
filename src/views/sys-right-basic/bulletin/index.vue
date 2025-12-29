<template>
  <div class="app-container">
    <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
    <app-table
        :tableConfig="tableconfig"
        v-model:pageresult="pageresult"
        ref="tableRef"
        @page-change="handleQuery(false)"
      />
  </div>
</template>

<script setup lang="ts">
import { defineComponent, ref, onMounted, reactive, h } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useUserStore } from "@/store/modules/user";
import { AppKey } from '@/constants/api';
import { getListByCode } from '@/api/code-list-service';
import { BulletinService } from '../service/bulletin.service';
import BulletinEditComponent from './bulletin-edit.vue';

import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
} from "@/shared/app-free-edit-config";


import { createFreeButtonBase } from "@/shared/button-config";
import { yesOrNo, size, inputtype } from "@/utils/utilKey";
import {
  AppTableConfig,
  AppTableMethod,
  createTableEditConfig,
} from "@/shared/app-table-config";
import { useDzModal } from "@/common/dzmodel/DzModalService";
const dzmodal = useDzModal();
const freeEditRef = ref<AppFreeEditMethod | null>(null);
const tableRef = ref<AppTableMethod | null>(null);
const userStore = useUserStore();
const bulletinService = new BulletinService()
const user = userStore.user || {};

const codeListMap = ref({
  CStatus: [],
  CReceive: []
});
const addOrEdit = ref('公共信息新增')
const current_pkId = ref('')
const formconfig1 = reactive<AppFreeEditConfig>(
  createAppFreeEditConfig({
    endBtnsPosition: "right",
    endBtns: [
      createFreeButtonBase({
        type: "primary",
        label: "查询",
        func: async () => {
          handleQuery();
        },
      }),
      createFreeButtonBase({
        label: "重置",
        func: () => {
					freeEditRef.value?.resetFields();
					handleQuery();
        },
      }),
    ],
    fromSchema: [
      {
        prop: "CContent",
        inputtype: "rtinput",
        title: "内容",
        clearable: true,
      },
      {
        prop: "CStatus",
        inputtype: "rtselect",
        title: "发布状态",
				loadData: [
					{value: "pub1", label: "暂存"},
					{value: "pub2", label: "发布"}
				],
        clearable: true,
      },
      {
        prop: "CReceive",
        inputtype: "rtselect",
        title: "接收人",
        typeCode: "ROLE_LIST",
        params: {},
        clearable: true,
      },
    ],
  })
);


const pageresult = reactive<Pageresult>({
  result: "",
  /** 数据列表 */
  list: [],
  /** 总数 */
  total: 0,
});

const tableconfig = reactive<AppTableConfig>(
  createTableEditConfig({
    editFlag: true,
    editList: ["cStatus"],
    titleBtns: [
      createFreeButtonBase({
        id: "score",
        label: "新增",
        type: "success",
        icon: "Plus",
        func: function () {
          openEdit('')
        },
      }),
    ],
    tableBtnType: "btn",
    tableBtnWidth: 220,
    tableBtnPosition: "right",
    tableBtn: [
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "编辑",
        type: "success",
        size: "large",
        icon: "Edit",
        tableClick: (row) => {
          openEdit(row.cPkId)
        },
        hideBtns: ((row: any) => {
          if (row.cStatus === 'pub2') return true;
        }),
      }),
      createFreeButtonBase({
        id: "score",
        link: true,
        tooltip: "删除",
        type: "danger",
        size: "large",
        icon: "Delete",
        tableClick: (row) => {
          deleteBulletin(row.cPkId)
        },
        hideBtns: ((row: any) => {
          if (row.cStatus === 'pub2') return true;
        }),
      }),
    ],

    fromSchema: [
      {
        prop: "cContent",
        inputtype: "rtinput",
        title: "内容",
      },
      {
        prop: "cStatus",
        inputtype: "rtswitch",
        title: "状态",
        keymap: {
          y: "pub2",
          n: "pub1",
        },
        activeText: "发布",
        inactiveText: "暂存",
        inlinePrompt: true,
        func: (val, row) => {
          console.log('改变状态的row', row);
          changeStatus(val, row.cPkId)
        },
      },
      {
        prop: "tPublishDate",
        inputtype: "rtinput",
        title: "发布时间",
      },
      {
        prop: "tDeadline",
        inputtype: "rtinput",
        title: "截止时间",
      },
      {
        prop: "cReceive",
        inputtype: "rtinput",
        title: "接收人",
      },
    ],
  })
);


const handleQuery = (flag = true) => {
  refreshData(flag)
}

const refreshData = (reset = false) => {
  const r = tableRef.value?.getPartnerPage(reset); //获取分页数据
  const s = freeEditRef.value?.getFromValue(); //获取表单数据
  const param = Object.assign({}, s, r);

  bulletinService.queryBulletinList(param).then((res: any) => {
		if (res.code === 200) {
			pageresult.total = res.total;
			pageresult.list = res.data;
		} else {
			ElMessage.error(res.msg);
		}
  });
};


const openEdit = (pkId: string | null) => {
  if (!pkId) {
    addOrEdit.value = '公共信息新增'
  } else {
    addOrEdit.value = '公共信息修改'
  }
  current_pkId.value = pkId
  dzmodal.open(BulletinEditComponent, { pkId: current_pkId.value, addOrEdit: addOrEdit.value }).then((res) => {
    if (res.type === "ok") {
      handleQuery(true)
    }
  });
};

const closeDialog = () => {
  refreshData()
}

const deleteBulletin = (id: string) => {
  ElMessageBox.confirm('确认要删除吗？该数据删除之后将无法恢复。', '提示', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    bulletinService.deleteBulletin({ id }).then((res: any) => {
      if (res.code === 200) {
        ElMessage.success(res.msg);
        refreshData();
      } else {
        ElMessage.error(res.msg);
      }
    });
  }).catch(() => {
    //防止报错
  })
};

const changeStatus = (val, id) => {
  const param = {
    id: id,
    CUpdCde: user.opCde,
    newStatus: val
  };
  bulletinService.changeBulletinStatus(param).then((res: any) => {
    if (res.code === 200) {
      ElMessage.success(res.msg);
      refreshData();
    } else {
      ElMessage.error(res.msg);
    }
  });
};

const getReceiveName = (code: string) => {
  const receiveList = codeListMap.value.CReceive;
  const item = receiveList.find((item: any) => item.value === code);
  return item ? item.label : '全部';
};

onMounted(() => {
  refreshData(true);
});

</script>

<style scoped lang="scss">
/* Add your styles here */
</style>
