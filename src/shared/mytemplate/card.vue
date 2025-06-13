<template>
  <div class="freeedit">
    <div class="searchbar">
      <el-card>
        <template #header>
          <el-row justify="space-between">
            <el-col :span="6" v-if="!cardConfig.production">
              <a
                style="margin-left: 20px"
                @click="showMyfrom = !showMyfrom"
                v-if="cardConfig.showInTitle ? cardConfig.showInTitle : false"
              >
                <el-icon v-if="!showMyfrom"><ArrowRightBold /></el-icon>
                <el-icon v-if="showMyfrom"><ArrowDownBold /></el-icon>
              </a>
              {{ cardConfig.title }}
            </el-col>
            <el-col :span="6" v-if="cardConfig.production">
              <a
                style="margin-left: 20px"
                @click="showMyfrom = !showMyfrom"
                v-if="cardConfig.showInTitle ? cardConfig.showInTitle : false"
              >
                <el-icon v-if="!showMyfrom"><ArrowUpBold /></el-icon>
                <el-icon v-if="showMyfrom"><ArrowDownBold /></el-icon>
              </a>
              <el-tooltip :content="cardConfig.productionTitle">
                {{ cardConfig.title }}
              </el-tooltip>
            </el-col>
            <el-col
              :span="18"
              style="text-align: right"
              v-if="
                (cardConfig.titleBtns && cardConfig.titleBtns.length > 0) ||
                (cardConfig.showMyfromBtm ? cardConfig.showMyfromBtm : false)
              "
            >
              <el-button-group>
                <template
                  v-for="(item, index) in cardConfig.titleBtns"
                  :key="index"
                >
                <template v-if="!item.hidden">
                  <rt-button :item="item" />
                </template>
                </template>
              </el-button-group>
              <a
                style="margin-left: 20px"
                @click="showMyfrom = !showMyfrom"
                v-if="
                  cardConfig.showMyfromBtm ? cardConfig.showMyfromBtm : false
                "
              >
                <el-icon v-if="!showMyfrom"><ArrowUpBold /></el-icon>
                <el-icon v-if="showMyfrom"><ArrowDownBold /></el-icon>
                {{ showMyfrom ? "点击折叠" : "点击展开" }}
              </a>
            </el-col>
          </el-row>
        </template>

        <div class="form-inner" v-if="showMyfrom">
          <div v-if="cardConfig.showEdit">
            <app-free-edit :freeEditConfig="formconfig" ref="EditRef" />
          </div>
          <slot />
          <div
            style="margin-top: 20px"
            :style="{ textAlign: cardConfig.endBtnsPosition }"
            v-if="cardConfig.endBtns && cardConfig.endBtns.length > 0"
          >
            <template v-for="(item, index) in cardConfig.endBtns" :key="index">
              <template v-if="!item.hidden">
                <rt-button :item="item" />
              </template>
            </template>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { createAppGridEditConfig } from "../app-grid-edit-config";
import { CardConfig } from "./card-config";
const showMyfrom = ref(true);

const formconfig = ref(createAppGridEditConfig({}));

defineOptions({
  name: "MyCard",
  inheritAttrs: false,
});

const props = defineProps({
  cardConfig: {
    type: Object as () => CardConfig,
    required: true,
  },
});

watch(
  () => props.cardConfig,
  (o, n) => {
    showMyfrom.value = n?.showMyfrom ? n?.showMyfrom : true;
    initEditConfig();
  },
  { deep: true }
);

function initEditConfig(){
  if(props.cardConfig.formconfig){
    formconfig.value = props.cardConfig.formconfig;
  }
}
</script>

<style scoped>
.searchbar ::v-deep .el-card__header {
  background-color: #e5f3fa ;
  padding: 15px 20px ; 
}

.searchbar {
  border: 1px solid #ddd;
  box-shadow: 0 0 2px rgb(0 0 0 / 30%);
}
</style>
