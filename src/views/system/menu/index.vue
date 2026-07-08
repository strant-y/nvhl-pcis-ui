<template>
  <div class="app-container">
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="菜单名称" prop="keywords">
          <el-input
            v-model="queryParams.keywords"
            placeholder="菜单名称"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <!-- <el-form-item label="是否包含下级" prop="subordinate" @keyup.enter="handleQuery">
          <el-radio-group v-model="queryParams.subordinate" @change="onMenuTypeChange">
            <el-radio :value="true">是</el-radio>
            <el-radio :value="false">否</el-radio>
          </el-radio-group> -->
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery"
            ><template #icon><i-ep-search /></template>搜索</el-button
          >
          <el-button @click="resetQuery">
            <template #icon><i-ep-refresh /></template>
            重置</el-button
          >
        </el-form-item>
      </el-form>
    </div>

    <el-card shadow="never" class="table-container">
      <template #header>
        <el-button
          v-hasPerm="['sys:menu:add']"
          type="success"
          @click="openDialog('0')"
        >
          <template #icon><i-ep-plus /></template>
          新增</el-button
        >
      </template>

      <el-table
        border
        v-loading="loading"
        :data="menuList"
        highlight-current-row
        row-key="cOpCde"
        :expand-row-keys="['1']"
        @row-click="onRowClick"
        :tree-props="{
          children: 'children',
          hasChildren: 'hasChildren',
        }"
      >
        <el-table-column label="菜单名称" min-width="200">
          <template #default="scope">
            <svg-icon :icon-class="scope.row.cOpImg" />
            {{ scope.row.cOpCnm }}
          </template>
        </el-table-column>

        <el-table-column label="类型" align="center" width="80">
          <template #default="scope">
            <el-tag
              v-if="scope.row.cOpType === MenuTypeEnum.CATALOG"
              type="warning"
              >目录</el-tag
            >
            <el-tag
              v-if="scope.row.cOpType === MenuTypeEnum.MENU"
              type="success"
              >菜单</el-tag
            >
            <el-tag
              v-if="scope.row.cOpType === MenuTypeEnum.BUTTON"
              type="danger"
              >权限标识</el-tag
            >
            <el-tag
              v-if="scope.row.cOpType === MenuTypeEnum.EXTLINK"
              type="info"
              >外链</el-tag
            >
          </template>
        </el-table-column>

        <el-table-column
          label="路由路径"
          align="left"
          width="150"
          prop="cOpRouteCde"
        />

        <el-table-column
          label="组件路径"
          align="left"
          width="250"
          prop="cOpAct"
        />

        <el-table-column
          label="权限标识"
          align="center"
          width="200"
          prop="cPerm"
        />

        <el-table-column label="状态" align="center" width="80">
          <template #default="scope">
            <el-tag v-if="scope.row.cDisplayStatus === '1'" type="success"
              >显示</el-tag
            >
            <el-tag v-else type="info">隐藏</el-tag>
          </template>
        </el-table-column>

        <el-table-column fixed="right" align="center" label="操作" width="220">
          <template #default="scope">
            <el-tooltip
              class="box-item"
              effect="light"
              content="新增"
              placement="top-start"
            >
              <span style="margin-right: 12px">
                <el-button
                  v-if="
                    scope.row.cOpType == 'CATALOG' ||
                    scope.row.cOpType == 'MENU'
                  "
                  v-hasPerm="['sys:menu:add']"
                  type="success"
                  link
                  size="small"
                  @click.stop="openDialog(scope.row.cOpCde)"
                  ><i-ep-plus
                /></el-button>
              </span>
            </el-tooltip>
            <el-tooltip
              class="box-item"
              effect="light"
              content="编辑"
              placement="top-start"
            >
              <el-button
                v-hasPerm="['sys:menu:edit']"
                type="primary"
                link
                size="small"
                @click.stop="openDialog(scope.row.cOpCde, scope.row, 'update')"
                ><i-ep-edit
              /></el-button>
            </el-tooltip>
            <el-tooltip
              class="box-item"
              effect="light"
              content="删除"
              placement="top-start"
            >
              <el-button
                v-hasPerm="['sys:menu:delete']"
                type="danger"
                link
                size="small"
                @click.stop="handleDelete(scope.row.cOpCde)"
                ><i-ep-delete
              /></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      destroy-on-close
      class="system-dialog-scroll"
      append-to-body
      width="1000px"
      @close="closeDialog"
      top="5vh"
    >
      <el-form
        ref="menuFormRef"
        :model="formData"
        :rules="rules"
        label-width="160px"
      >
        <el-form-item label="父级菜单" prop="cParentCde" class="!w-[560px]">
          <el-tree-select
            v-model="formData.cParentCde"
            placeholder="选择上级菜单"
            :data="menuOptions"
            filterable
            check-strictly
            :render-after-expand="false"
          />
        </el-form-item>

        <el-form-item label="菜单名称" prop="cOpCnm" class="!w-[560px]">
          <el-input v-model="formData.cOpCnm" placeholder="请输入菜单名称" />
        </el-form-item>
        <el-form-item label="菜单编码" prop="cOpCde" class="!w-[560px]">
          <el-input v-model="formData.cOpCde" disabled />
        </el-form-item>

        <el-form-item label="菜单类型" prop="cOpType">
          <el-radio-group v-model="formData.cOpType" @change="onMenuTypeChange">
            <el-radio value="CATALOG">目录</el-radio>
            <el-radio value="MENU">菜单</el-radio>
            <el-radio value="BUTTON">权限标识</el-radio>
            <el-radio value="EXTLINK">外链</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          v-if="formData.cOpType == 'EXTLINK'"
          label="外链地址"
          prop="cSkipRoute"
        >
          <el-input
            v-model="formData.cSkipRoute"
            placeholder="请输入外链完整路径"
          />
        </el-form-item>

        <el-form-item
          v-if="
            formData.cOpType == MenuTypeEnum.CATALOG ||
            formData.cOpType == MenuTypeEnum.MENU
          "
          label="路由路径"
          prop="cOpRouteCde"
          class="!w-[860px]"
        >
          <el-input
            v-if="formData.cOpType == MenuTypeEnum.CATALOG"
            v-model="formData.cOpRouteCde"
            placeholder="system"
          />
          <el-input v-else v-model="formData.cOpRouteCde" placeholder="user" />
        </el-form-item>

        <!-- 组件页面完整路径 -->
        <el-form-item
          v-if="formData.cOpType == MenuTypeEnum.MENU"
          label="页面路径"
          prop="cOpAct"
        >
          <el-input
            v-model="formData.cOpAct"
            placeholder="system/user/index"
            style="width: 90%"
          >
            <template v-if="formData.cOpType == MenuTypeEnum.MENU" #prepend
              >src/views/</template
            >
            <template v-if="formData.cOpType == MenuTypeEnum.MENU" #append
              >.vue</template
            >
          </el-input>
        </el-form-item>

        <el-form-item
          v-if="formData.cOpType !== MenuTypeEnum.BUTTON"
          prop="cDisplayStatus"
          label="显示状态"
        >
          <el-radio-group v-model="formData.cDisplayStatus">
            <el-radio :value="'1'">显示</el-radio>
            <el-radio :value="'0'">隐藏</el-radio>
          </el-radio-group>
        </el-form-item>

        <!--        <el-form-item v-if="formData.cOpType === MenuTypeEnum.CATALOG" label="根目录始终显示">-->
        <!--          <template #label>-->
        <!--            <div>-->
        <!--              根目录始终显示-->
        <!--              <el-tooltip placement="bottom" effect="light">-->
        <!--                <template #content-->
        <!--                  >是：根目录只有一个子路由显示目录-->
        <!--                  <br />否：根目录只有一个子路由不显示目录，只显示子路由-->
        <!--                </template>-->
        <!--                <i-ep-QuestionFilled class="inline-block" />-->
        <!--              </el-tooltip>-->
        <!--            </div>-->
        <!--          </template>-->

        <!--          <el-radio-group v-model="formData.alwaysShow">-->
        <!--            <el-radio :label="1">是</el-radio>-->
        <!--            <el-radio :label="0">否</el-radio>-->
        <!--          </el-radio-group>-->
        <!--        </el-form-item>-->

        <!--        <el-form-item-->
        <!--          v-if="formData.cOpType === MenuTypeEnum.MENU"-->
        <!--          label="是否缓存"-->
        <!--        >-->
        <!--          <el-radio-group v-model="formData.keepAlive">-->
        <!--            <el-radio :label="1">是</el-radio>-->
        <!--            <el-radio :label="0">否</el-radio>-->
        <!--          </el-radio-group>-->
        <!--        </el-form-item>-->

        <el-form-item label="排序" prop="nOpOrder">
          <el-input-number
            v-model="formData.nOpOrder"
            style="width: 100px"
            controls-position="right"
            :min="0"
          />
        </el-form-item>

        <!-- 权限标识 -->
        <el-form-item
          v-if="formData.cOpType == MenuTypeEnum.BUTTON"
          label="权限标识"
          prop="cPerm"
        >
          <el-input v-model="formData.cPerm" placeholder="sys:user:add" />
        </el-form-item>
        <!-- 级别 -->
        <el-form-item label="权限级别" prop="cOpLevl" class="!w-[460px]">
          <el-input v-model="formData.cOpLevl" placeholder="权限级别" />
        </el-form-item>

        <el-form-item
          v-if="formData.cOpType !== MenuTypeEnum.BUTTON"
          label="图标"
          prop="icon"
          class="!w-[460px]"
        >
          <!-- 图标选择器 -->
          <icon-select v-model="formData.cOpImg" />
        </el-form-item>

        <el-form-item
          v-if="formData.cOpType == MenuTypeEnum.CATALOG"
          label="跳转路由"
        >
          <el-input v-model="formData.cSkipRoute" placeholder="跳转路由" />
        </el-form-item>

        <el-form-item label="菜单说明" class="!w-[860px]">
          <el-input v-model="formData.cOpMemo" placeholder="说明" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="closeDialog">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.system-dialog-scroll :deep(.el-dialog__body) {
  max-height: 400px;
  overflow: auto;
}
</style>

<script setup lang="ts">
defineOptions({
  // eslint-disable-next-line vue/no-reserved-component-names
  name: "Menu",
  inheritAttrs: false,
});

import { MenuQuery, MenuForm, MenuVO } from "@/api/menu/types";
import {
  addMenu,
  deleteMenu,
  updateMenu,
  listMenusApi,
  listMenusOptionsApi,
} from "@/api/menu";

import { MenuTypeEnum } from "@/enums/MenuTypeEnum";

const handleType = ref("add");

const queryFormRef = ref(ElForm);
const menuFormRef = ref(ElForm);

const loading = ref(false);
const dialog = reactive({
  title: "",
  visible: false,
});

const queryParams = reactive<MenuQuery>({
  subordinate: false,
});
const menuList = ref<MenuVO[]>([]);

const menuOptions = ref<OptionType[]>([]);

const formData = reactive<MenuForm>({
  cParentCde: "0",
  cDisplayStatus: "1",
  nOpOrder: 1,
  cOpType: MenuTypeEnum.MENU,
  alwaysShow: 0,
  keepAlive: 0,
});

const rules = reactive({
  cParentCde: [
    { required: true, message: "请选择顶级菜单", trigger: "change" },
  ],
  cOpCnm: [{ required: true, message: "请输入菜单名称", trigger: "change" }],
  cOpType: [{ required: true, message: "请选择菜单类型", trigger: "change" }],
  cOpRouteCde: [
    { required: true, message: "请输入路由路径", trigger: "change" },
  ],

  cOpAct: [{ required: true, message: "请输入组件路径", trigger: "change" }],
  cDisplayStatus: [
    { required: true, message: "请输入路由路径", trigger: "change" },
  ],
});

// 选择表格的行菜单ID
const selectedRowMenuId = ref<number | undefined>();

const menuCacheData = reactive({
  cOpType: "",
  cOpRouteCde: "",
});

/**
 * 查询
 */
function handleQuery() {
  // 重置父组件
  loading.value = true;

  listMenusApi(queryParams)
    .then(({ code, data, msg }) => {
      if (code === 200) {
        menuList.value = data;
      } else {
        ElMessage.error(msg);
      }
    })
    .then(() => {
      loading.value = false;
    });
}

/** 重置查询 */
function resetQuery() {
  queryFormRef.value.resetFields();
  queryParams.keywords = undefined;
  queryParams.subordinate = false;
  handleQuery();
}

/**行点击事件 */
function onRowClick(row: MenuVO) {
  selectedRowMenuId.value = row.cOpCde;
}

/**
 * 打开表单弹窗
 *
 * @param cParentCde 父菜单ID
 * @param row 菜单行
 */
function openDialog(cParentCde?: string, row?: any, type = "add") {
  let parentCde = cParentCde;
  handleType.value = type;
  if (handleType.value === "update" && row) {
    dialog.title = "编辑菜单";
    Object.assign(formData, row);
    parentCde = row.cParentCde;
    menuCacheData.cOpType = row.cOpType;
    menuCacheData.cOpRouteCde = row.cOpRouteCde ?? "";
  } else {
    dialog.title = "新增菜单";
    formData.cParentCde = cParentCde;
  }
  listMenusOptionsApi({ keywords: parentCde }).then((res) => {
    const { code, msg, data } = res;
    if (200 === code) {
      menuOptions.value = data;
    } else {
      console.error(msg);
    }
  });
  dialog.visible = true;
}

/** 菜单类型切换事件处理 */
function onMenuTypeChange() {
  if (formData.cOpType === "MENU") {
    formData.cOpAct = "Layout";
  }
  // 如果菜单类型改变，清空路由路径；未改变在切换后还原路由路径
  if (formData.cOpType !== menuCacheData.type) {
    formData.cOpRouteCde = "";
  } else {
    formData.cOpRouteCde = menuCacheData.cOpRouteCde;
  }
}

/** 菜单保存提交 */
function submitForm() {
  menuFormRef.value.validate((isValid: boolean) => {
    if (isValid) {
      const menuId = formData.cOpCde;
      if (handleType.value === "update") {
        updateMenu(formData).then((res) => {
          const { code, msg, data } = res;
          if (200 === code) {
            ElMessage.success(msg);
            closeDialog();
            handleQuery();
          } else {
            ElMessage.error(msg);
          }
        });
      } else {
        addMenu(formData).then((res) => {
          const { code, msg, data } = res;
          if (code === 200) {
            ElMessage.success(msg);
            closeDialog();
            handleQuery();
          } else {
            ElMessage.error(msg);
          }
        });
      }
    }
  });
}

/** 删除菜单 */
function handleDelete(cOpCde: string) {
  if (!cOpCde) {
    ElMessage.warning("请勾选删除项");
    return false;
  }
  ElMessageBox.confirm("删除本项，其子项也会被删除，是否继续?", "警告", {
    confirmButtonText: "继续",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      deleteMenu(cOpCde).then((res) => {
        const { code, data, msg } = res;

        ElMessage.success(msg);
        handleQuery();
      });
    })
    .catch(() => ElMessage.info("已取消删除"));
}

/** 关闭弹窗 */
function closeDialog() {
  dialog.visible = false;
  resetForm();
}

/** 重置表单 */
function resetForm() {
  menuFormRef.value.resetFields();
  menuFormRef.value.clearValidate();

  formData.cOpCde = undefined;
  formData.cOpCnm = undefined;
  formData.cParentCde = "0";
  formData.cDisplayStatus = "1";
  formData.cOpLevl = undefined;
  formData.cOpType = undefined;
  formData.nOpOrder = 1;
  formData.cPerm = undefined;
  formData.cOpAct = undefined;
  formData.cOpRouteCde = undefined;
  formData.cSkipRoute = undefined;
  formData.cOpMemo = undefined;
  formData.alwaysShow = undefined;
  formData.keepAlive = undefined;
}

onMounted(() => {
  handleQuery();
});
</script>
