<template>
  <el-aside :class="['prod-sidebar', { collapsed }]">
    <template v-for="(pageConfig, v) in pageConfigs" :key="v">
      <el-affix :offset="0">
        <el-anchor
          ref="anchorRef"
          :bound="120"
          :offset="10"
          :container="container"
        >
          <el-anchor-link
            v-for="(k, i) in pageConfig?.pageInfo"
            :key="i"
            v-show="visibleFn(k)"
            :href="`#${k.pageKey}`"
          >
            <el-tooltip
              effect="dark"
              :content="k.pageTtile || ''"
              placement="top-start"
              :disabled="!(collapsed || (k.pageTtile && k.pageTtile.length > 6))"
            >
              <div class="anchor-item">
                <i :class="['icon', 'iconfont', iconMap[k.pageKey] || iconFallback]"></i>
                <div v-if="!collapsed" class="icon-title">
                  <template v-if="k.pageTtile && k.pageTtile.length > 6">
                    {{ k.pageTtile.substring(0, 6) + "..." }}
                  </template>
                  <template v-else>
                    {{ k.pageTtile }}
                  </template>
                </div>
              </div>
            </el-tooltip>
          </el-anchor-link>
        </el-anchor>
        <div class="aside-toggle" @click="emit('toggle')">
          <el-icon>
            <Fold v-if="!collapsed" />
            <Expand v-else />
          </el-icon>
        </div>
      </el-affix>
    </template>
  </el-aside>
</template>

<script setup lang="ts">
import { Expand, Fold } from "@element-plus/icons-vue";

defineOptions({ name: "ProdSidebar" });

defineProps({
  pageConfigs: {
    type: Array,
    default: () => [],
  },
  collapsed: {
    type: Boolean,
    default: false,
  },
  iconMap: {
    type: Object,
    default: () => ({}),
  },
  iconFallback: {
    type: String,
    default: "",
  },
  visibleFn: {
    type: Function,
    default: () => true,
  },
  container: {
    type: String,
    default: "#main-container",
  },
});

const emit = defineEmits(["toggle"]);

const anchorRef = ref<any[]>([]);

function scrollTo(href: string) {
  anchorRef.value?.[0]?.scrollTo(href);
}

defineExpose({ scrollTo });
</script>

<style lang="scss" scoped>
/* ── 侧边栏设计变量（飞书 / Ant Design Pro 风格） ── */
$sidebar-primary: #3370ff;
$sidebar-text: #4e5969;
$sidebar-text-dark: #1d2129;
$sidebar-border: #e5e6eb;
$sidebar-hover-bg: #f2f3f5;
$sidebar-active-bg: #e8f3ff;
$sidebar-icon-color: #86909c;

.prod-sidebar {
  width: 220px;
  background: #fff;
  border-right: 1px solid $sidebar-border;
  transition: width 0.2s ease;

  &.collapsed {
    width: 64px;

    :deep(.el-anchor__link) {
      justify-content: center;
      padding: 0;
    }

    :deep(.iconfont) {
      margin-right: 0;
    }
  }

  :deep(.el-affix) {
    height: 100%;
    background: #fff;
    position: relative;
  }

  :deep(.el-anchor) {
    background: transparent;

    .el-anchor__marker {
      display: none;
    }

    .el-anchor__list {
      padding: 12px 0 52px;

      .el-anchor__item {
        margin: 4px 12px;

        .el-anchor__link {
          position: relative;
          display: flex;
          align-items: center;
          height: 40px;
          line-height: 40px;
          padding: 0 12px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 400;
          color: $sidebar-text;
          text-align: left;
          text-decoration: none;
          cursor: pointer;
          transition:
            background-color 0.2s ease,
            color 0.2s ease;

          /* 左侧蓝色标识（平滑出现） */
          &::before {
            content: "";
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 3px;
            height: 20px;
            border-radius: 2px;
            background: $sidebar-primary;
            opacity: 0;
            transition: opacity 0.2s ease;
          }

          .iconfont {
            font-size: 16px;
            color: $sidebar-icon-color;
            margin-right: 10px;
            transition: color 0.2s ease;
          }

          &:hover {
            background: $sidebar-hover-bg;
            color: $sidebar-text-dark;

            .iconfont {
              color: $sidebar-text-dark;
            }
          }

          &.isActive,
          &.is-active {
            background: $sidebar-active-bg;
            color: $sidebar-primary;
            font-weight: 600;

            .iconfont {
              color: $sidebar-primary;
            }

            &::before {
              opacity: 1;
            }
          }
        }
      }
    }
  }
}

/* 底部收起按钮 */
.aside-toggle {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  border-top: 1px solid $sidebar-border;
  background: #fff;
  color: $sidebar-icon-color;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: $sidebar-primary;
  }
}

.anchor-item {
  display: flex;
  align-items: center;
}
</style>
