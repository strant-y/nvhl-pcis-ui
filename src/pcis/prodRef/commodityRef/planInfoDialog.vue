 <template>
    <el-dialog v-model="dialogVisible" title="12123" width="80%" @update:model-value="handleVisibleUpdate">

      <!-- <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCancel">取消</el-button>
          <el-button type="primary" @click="handleSave">保存</el-button>
        </span>
      </template> -->
    </el-dialog>
</template>
  
<script setup lang="ts">
import { useDzModal } from "@/common/dzmodel/DzModalService";
const dzmodal = useDzModal();
// const planInfo = defineAsyncComponent(() => import("@/views/plan-config/plan-info/plan-info.vue"));
import planInfo from '@/views/plan-config/plan-info/plan-info.vue';
const dialogVisible = ref(true);
onMounted(() => {
    // dzmodal.open(planInfo, { type: "edit", data: {} }).then((res) => {
    //         if (res.type === "ok") {
              
    //         }
    //       });
});

</script>
 