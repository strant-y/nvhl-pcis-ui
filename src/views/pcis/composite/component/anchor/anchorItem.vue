<template>
  <div id="item-000000" >
    <el-popconfirm
        id="popconfirm000000"
        class="box-item"
        :title="popconfirmCtlRef.title"
        :placement="popconfirmCtlRef.placement"
        :visible="popconfirmCtlRef.visible"
        @confirm="popconfirmCtlRef.confirmEvent"
        @cancel="popconfirmCtlRef.cancelEvent"
        persistent
        width="300"
    >
      <template #reference>
        <div class="link-item">
          <div
              :class="['anchor-link', isActive ? 'active-link':'']"
              @click.stop="handleClick"
          >
            <el-row justify="space-between" class="_link_row">
              <el-col :span="2" style="margin-top: 3px">
                <slot v-if="$slots['icon']" name="icon"></slot>
                <span v-else><Menu size="18px" /></span>
              </el-col>
              <el-col align="start" :span="20">
                <div @mouseenter="checkIfTruncated($event, item.title)">
                  <slot v-if="$slots['title']" name="title"></slot>
                  <el-text v-else class="_title mx-1" truncated >
                    {{  item.title }}
                  </el-text>
                </div>
              </el-col>
              <el-col :span="2">
                <slot name="right"></slot>
              </el-col>
            </el-row>
          </div>
        </div>
      </template>
    </el-popconfirm>
  </div>
</template>

<script setup lang="ts">
import {defineProps, computed, ref} from 'vue';
import {AnchorItem, GroupForm} from '../index';
import {Menu} from '@element-plus/icons-vue'
import {checkIfTruncated} from "@/utils/common";
import {CompositePageView} from "@/views/pcis/support/composite.types";

const props = defineProps<{
  anchorItem: AnchorItem;
  activeId: string;
  parentActive: boolean;
}>();

const pageView = inject("pageView", ref(new CompositePageView()));
// 组件事件
const emit = defineEmits<{
  (e: 'item-click', item: AnchorItem): void;
}>();

const item = computed<AnchorItem>(() => props.anchorItem);

// 当前项是否激活
const isActive = computed(() => {
  return item.value && item.value.id === props.activeId;
});

// 处理导航项点击
const handleClick = () => {
  emit('item-click', item.value);
};

// 存储定时器ID
const activeTimer = ref();

const popconfirmCtlRef = ref({
  title: '',
  placement: 'right',
  visible: false,
  confirmEvent: () => {},
  cancelEvent: () => {},
});

// 监听 isActive 变化
watch(isActive, (newVal) => {
  // 清除之前的定时器
  if (activeTimer.value) {
    clearTimeout(activeTimer.value);
    activeTimer.value = undefined;
  }else {
    popconfirmCtlRef.value.visible = false;
  }
  const ids = item.value.title.split('-')
  const prodNo = ids[0]
  if(prodNo === '000000' || ids.length === 1 || !item.value.tabKey || !pageView.value.autoAssignTabKeys.includes(item.value.tabKey)) {
    return;
  }
  const groupId = `group-${prodNo}`
  if (newVal) {
    activeTimer.value = setTimeout(() => {
      // 3秒后检查是否仍然是激活状态
      if (isActive.value) {
        const thisOpertaor = pageView.value.getDataOpertaorByGroupId(groupId)
        if(thisOpertaor) {
          const thisCompInfo = pageView.value.pageConfig
              .find(f => f.groupId === groupId)?.pageInfo
              .find(f => f.pageCode === item.value.tabKey || f.pageKey === item.value.tabKey);
          const isArray: boolean = ['table', 'grid'].includes(thisCompInfo.pageType);
          const getDataProperties = (compRef: any, pageType: string): {count: number, keys: string[], data: any} => {
            if(isArray) {
              const list = compRef.getTableData()
              return {
                count: list ? list.length : 0,
                keys: list ? Object.keys(list[0]) : [],
                data: list
              }
            }else {
              const obj = compRef.getFromValue()
              const keys = Object.keys(obj);
              return {
                count: keys.filter(key => {
                    const value = obj[key];
                    return value !== null && value !== undefined && value !== '' && value !== 0;
                  }).length,
                keys: keys,
                data: obj
              }
            }
          }

          const thisTabRef = thisOpertaor.getTableRefByKey(item.value.tabKey);
          if(!thisCompInfo || thisCompInfo.pageType === 'custom') {
            return;
          }
          const thisCountAndKeys = getDataProperties(thisTabRef, thisCompInfo.pageType)
          const numList = pageView.value.pageConfig.map((config: GroupForm) => {
            const compInfo = config.pageInfo.find(f => f.pageCode === item.value.tabKey || f.pageKey === item.value.tabKey)
            const result: any = {
              data: {},
              count: 0,
              groupId: config.groupId,
              compInfo: compInfo
            }
            if(config.groupId === groupId ||  // 排除当前产品组件
                config.groupId.includes('000000') || // 排除公共组件
                !compInfo || // 排除和当前显示组件不是相同配置的产品
                thisCompInfo.pageType !== compInfo.pageType) {
              return result
            }

            const opertaor = pageView.value.getDataOpertaorByGroupId(config.groupId);
            if(opertaor) {
              const tabRef = opertaor.getTableRefByKey(item.value.tabKey);
              if(tabRef) {
                const tabCountAndKeys = getDataProperties(tabRef, thisCompInfo.pageType)
                const equallyLength = tabCountAndKeys.keys.filter(key => thisCountAndKeys.keys.includes(key)).length;
                if(equallyLength < 4) return result
                result['data'] = tabCountAndKeys.data;
                result['count'] = tabCountAndKeys.count;
              }
            }
            return result;
          })
          const list = [...numList].sort((a, b) => b.count - a.count);
          console.log('numList-sort ↓ ', list)
          const maxData = list[0]

          const val = maxData.count - thisCountAndKeys.count
          if((isArray && val > 0) || (!isArray && val > 3)) {
            popconfirmCtlRef.value.visible = true;
            console.log('maxData', maxData)

            const maxProdNo = maxData.groupId.split('-')[1]
            popconfirmCtlRef.value.title = `
              检测到[${maxProdNo}]产品的${maxData.compInfo.pageTtile}数据更加完整，是否需要同步到当前模块？
            `;

            popconfirmCtlRef.value.confirmEvent =
                () => {
              if(isArray) {
                thisTabRef.setTableData(maxData.data)
              } else {
                thisTabRef.setFormValue(maxData.data)
              }
            }

          }
        }

      }
    }, 3000);
  } else {
    popconfirmCtlRef.value.visible = false;
  }
}, {deep: true, immediate: true});
</script>

<style lang="scss" scoped>
.link-item{
  width: 235px;
  height: 30px;
  padding-left: 20px;
  &:hover{
    background-color: var(--menu-hover);
  }
}

.anchor-link {
  display: block;
  width: 100%;
  color: #727578;
  text-decoration: none;
  padding: 4px 0;
  transition: all 0.2s;

  ._link_row {
    text-align: center;
  }

  ._title{
    font-size: 13px;
    color: #727578;
    margin-left: 5px;
  }
}
._title:hover {
  color: var(--el-color-primary);
  cursor: pointer;
}
.anchor-link:hover {
  color: var(--el-color-primary);
  cursor: pointer;
}

/* 激活状态样式 */
.anchor-link.active-link {
  color: var(--el-color-primary);
  font-weight: 500;
  ._title{
    color: var(--el-color-primary);
    font-weight: 500;
  }
}

</style>
