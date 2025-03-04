<template>
  <div class="app-container">
    <el-tabs v-model="activeName" type="border-card" @tab-click="handleClick">
      <el-tab-pane label="一般批改" name="first">
        <EdrQryEndorseList activeName="一般批改"></EdrQryEndorseList>
      </el-tab-pane>
      <el-tab-pane label="注销" name="second">
        <EdrQryEndorseList activeName="注销"></EdrQryEndorseList>
      </el-tab-pane>
      <el-tab-pane label="退保" name="third">
        <EdrQryEndorseList activeName="退保"></EdrQryEndorseList>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import EdrQryEndorseList from './edr-qry-endorse-list.vue';

export default defineComponent({
  name: "edr_index",
  components: {
    EdrQryEndorseList
  },
  setup() {
    
    const activeName = ref('first')

    const handleClick = (tab, event) => {
      console.log(tab, event);
    }

    onMounted(() => {
      //todo
    });

    return {
      activeName,
      handleClick
    };
  }
});
</script>

<style scoped lang="scss">
.actived {
  background: #a6dbed;
}
.fc-table-icons {
  i {
    margin-right: 10px;
    cursor: pointer;
  }
}
</style>
