<template>
  <div class="app-container">
    <el-row :gutter="10">
      <el-col :span="14">
        <SysRoleInfo @getOpgrpCde="setOpgrpCde" />
      </el-col>
      <el-col :span="10">
        <div class="searchbar el-card table-container" style="margin: 0px">
          <div class="el-card__header">
            <span class="el-card__header__title">角色操作权限配置</span>
            <el-button
              type="primary"
              :loading="btn_loading"
              style="float: right; margin-right: 10px"
              @click="permissionConfig"
            >
              权限配置
            </el-button>
          </div>
        </div>
        <div>
          <el-card shadow="never">
            <el-table
              stripe
              :data="_dataSet"
              :loading="_loading"
              border
              style="width: 100%"
            >
              <el-table-column
                prop="cOpgrpCde"
                label="角色代码"
                width="180"
                align="center"
              />
              <el-table-column
                prop="cOpgrpCnm"
                label="角色名称"
                width="180"
                align="center"
              />
              <el-table-column prop="cOpCnm" label="操作名称" align="center" />
            </el-table>
            <el-pagination
              background
              class="pagination"
              style="display: flex; justify-content: flex-end; margin-top: 10px"
              layout="prev, pager, next"
              :total="_total"
              :page-size="_pageSize"
              :current-page="_current"
              @current-change="refreshData"
            />
          </el-card>
        </div>
      </el-col>
    </el-row>
  </div>
  <el-dialog
    v-model="dialogVisible"
    title="操作权限-操作选择"
    width="1000"
    style="overflow: hidden"
  >
    <!-- <SysOperateTree
      :data="{ nodedata }"
      :COpgrpCde="_cOpgrpCde"
      @onOk="chooseRoleMgr"
    ></SysOperateTree> -->
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import SysRoleInfo from "./sys-role-info/SysRoleInfo.vue";
// import SysOperateTree from "@/views/sys-right-basic/sys/sys-role-operate-mgr/sys-role-operate-edit/sys-operate-tree/sys-operate-tree.vue";
// import { SysRoleMgrService } from "../../service/sys-role-mgr.service";
// import { SessionStoreService } from "@/api/session-store.service";
import { getListByCode } from "@/api/code-list-service";
import { AppKey } from "@/constants/api";

export default defineComponent({
  components: {
    SysRoleInfo,
    // SysOperateTree,
  },
  setup() {
    const user = ref<any>(null); // 当前登录用户信息
    const _current = ref<number>(1); // 当前页
    const _pageSize = ref<number>(8); // 每页显示条数
    const _total = ref<number>(1); // 总数
    const _dataSet = ref<any[]>([]); // 数据集合
    const _loading = ref<boolean>(false); // 加载中
    const btn_loading = ref<boolean>(false); // 加载中

    const _selected = ref<any>({});
    const roles = ref<any>(null); // 当前登录用户角色
    const _cOpgrpCde = ref<string>(""); // 角色代码
    const _cDptCde = ref<string>(""); // 机构代码
    const _roleLevl = ref<string>(""); // 当前登录用户角色最大级别

    // const sysRoleMgrService = new SysRoleMgrService();
    const dialogVisible = ref(false);
    // const nodedata = ref<any>([])
    //todo 假数据
    const nodedata = ref<any>([
      {
        name: "核保任务管理",
        children: [
          {
            name: "待核保任务",
            children: [],
          },
          {
            name: "历次批单",
            children: [],
          },
        ],
      },
      {
        name: "核保任务管理2",
        children: [
          {
            name: "待核保任务2",
            children: [],
          },
          {
            name: "历次批单2",
            children: [],
          },
        ],
      },
    ]);

    onMounted(() => {
      // user.value = SessionStoreService.get(AppKey.user) || {};
      // roles.value = SessionStoreService.get(AppKey.roles) || [];

      let roleCde = "";
      // roles.value.forEach((res: any) => {
      //   roleCde = roleCde === "" ? res : roleCde + "','" + res;
      // });
      // getListByCode("getRoleLevl", {
      //   cOperId: _cOpgrpCde.value,
      //   cDptCde: user.value["companyId"],
      // })
      //   .then((res: any) => {
      //     if (res["code"] === 200 && !!res["data"]) {
      //       if (res["data"].length > 0) {
      //         _roleLevl.value = res["data"][0]["roleLevl"];
      //       }
      //     }
      //   })
      //   .catch((error: any) => {
      //     console.log("出错了", error);
      //     ElMessage.error("后台服务异常,请联系管理员");
      //   });
    });

    const setOpgrpCde = (OpgrpCde: string) => {
      if (OpgrpCde) {
        _cOpgrpCde.value = OpgrpCde;
        refreshData(true);
      }
    };

    /**
     * 获取列表数据
     * @param {boolean} reset
     */
    const refreshData = (reset = false) => {
      if (reset && _current.value !== 1) {
        _current.value = 1;
      }
      _loading.value = true;
      const params = {
        pageNo: _current.value,
        pageSize: _pageSize.value,
        COpgrpCde: _cOpgrpCde.value,
      };
      sysRoleMgrService.qrySysRoleOpList(params).then((res: any) => {
        _loading.value = false;
        if (null != res && null != res["code"]) {
          if (res["code"] === 200) {
            const pageData = res.data;
            if (pageData) {
              _loading.value = false;
              _total.value = pageData.total;
              _dataSet.value = pageData.result;
              pageData.result.forEach(
                (item: any) => (_selected.value[item["COpgrpCde"]] = false)
              );
            }
          }
        }
      });
    };

    const permissionConfig = () => {
      dialogVisible.value = true;
      btn_loading.value = true;
      if (null == _cOpgrpCde.value) {
        ElMessage.warning("请先选定角色!");
        btn_loading.value = false;
        return;
      }
      const params = {
        RoleCde: _cOpgrpCde.value,
        pId: "0",
        roleLevl: _roleLevl.value,
      };
      sysRoleMgrService.getOpTreeListByRoleId(params).then((res: any) => {
        if (null != res && null != res["code"]) {
          if (res["code"] === 200) {
            const box = [];
            box.push(res["data"]);
            nodedata.value = box;
          } else if (res["code"] === 500 && !!res["msg"]) {
            ElMessage.error(res["msg"]);
          }
        }
        btn_loading.value = false;
      });
    };

    const chooseRoleMgr = (data) => {
      console.log("data", data);
      dialogVisible.value = false;
      refreshData(true);
    };

    return {
      user,
      _current,
      _pageSize,
      _total,
      _dataSet,
      _loading,
      btn_loading,
      _selected,
      roles,
      _cOpgrpCde,
      _cDptCde,
      _roleLevl,
      dialogVisible,
      nodedata,
      setOpgrpCde,
      refreshData,
      permissionConfig,
      chooseRoleMgr,
    };
  },
});
</script>

<style scoped>
.container {
  padding: 20px;
}

.searchbar.el-card {
  .el-card__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    background-color: var(--el-card-header-bg-color);
    border-bottom: 1px solid #ebeef5;
  }

  .el-card__header__title {
    font-size: 16px;
  }
}

.custom-modal {
  width: 1000px;
}
</style>
