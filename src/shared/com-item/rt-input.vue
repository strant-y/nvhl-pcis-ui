<template>
  <template v-if="!showLabel">
    <el-input
      ref="inputRef"
      :placeholder="item.placeholder"
      :size="item.size"
      :type="item.type === 'color' ? 'text' : item.type"
      :showPassword="item.showPassword"
      :rows="item.rows"
      :style="
        item.type === 'color'
          ? { width: 'calc(100% - 32px)' }
          : item.type === 'icon'
            ? { width: 'calc(100% - 48px)' }
            : { width: '100%' }
      "
      :maxlength="item.maxlength"
      :minlength="item.minlength"
      :readonly="
        item.type === 'color' || item.type === 'icon'
          ? true
          : item.readonly
            ? typeof item.readonly === 'boolean'
              ? item.readonly
              : item.readonly === 1 || item.readonly === '1'
                ? true
                : false
            : false
      "
      :disabled="
        item.disabled
          ? typeof item.disabled === 'boolean'
            ? item.disabled
            : item.disabled === 1 || item.disabled === '1'
              ? true
              : false
          : false
      "
      :autosize="item.autosize"
      :clearable="
        item.clearable
          ? typeof item.clearable === 'boolean'
            ? item.clearable
            : item.clearable === 1 || item.clearable === '1'
              ? true
              : false
          : false
      "
      v-model="vInput"
      @change="handleChange"
    >
      <template #suffix v-if="item.suffixIcon">
        <el-icon>
          <component :is="renderIcon(item.suffixIcon)" />
        </el-icon>
      </template>
      <template #prefix v-if="item.prefixIcon">
        <el-icon>
          <component :is="renderIcon(item.prefixIcon)" />
        </el-icon>
      </template>
      <template #prepend v-if="item.prepend">
        {{ item.prepend }}
      </template>
      <template #prepend v-else-if="item.prependIcon">
        <el-icon>
          <component :is="renderIcon(item.prependIcon)" />
        </el-icon>
      </template>
      <template #append v-else-if="item.append">
        {{ item.append }}
      </template>
      <template #append v-else-if="item.appendIcon">
        <el-icon>
          <component :is="renderIcon(item.appendIcon)" />
        </el-icon>
      </template>
    </el-input>

    <template v-if="item.type === 'color'">
      <el-color-picker v-model="vInput" @change="handleChange" />
    </template>
    <template v-if="item.type === 'icon'">
      <rt-button
        :item="{
          icon: 'Paperclip',
          popover: 'selectIconPopover',
          popoverWidth: 500,
          position: item.popoverposition?.popoverposition || 'left-start',
        }"
        @closepopover="
          (rev) => {
            vInput = rev;
            handleChange(rev);
          }
        "
      />
    </template>
  </template>
  <span v-else>
    <template v-if="item.type === 'icon'">
      <rt-icon :item="{ icon: vInput }" />
    </template>
    <template v-else>
      {{ vInput }}
    </template>
  </span>
</template>

<script setup lang="ts">
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
type IconNames = keyof typeof ElementPlusIconsVue;
const props = defineProps({
  modelValue: {
    type: [String],
  },
  item: {
    type: Object as () => Record<string, any>,
    required: true,
  },
  showLabel: {
    type: Boolean,
    default: false,
  },
  parentFromUi: {
    type: Object as () => Record<string, any>,
    required: false,
  },
});

const emits = defineEmits(["update:modelValue", "valueChange"]); // 父组件监听事件，同步子组件值的变化给父组件
const vInput = ref<string | undefined>();
watch([() => props.modelValue], ([newModelValue]) => {
  vInput.value = newModelValue;
});

function handleChange(val?: string | undefined | null) {
  emits("valueChange", val);
  emits("update:modelValue", val);
  props.item.func ? props.item.func(val) : null;
}

onMounted(() => {
  vInput.value = props.modelValue;
});

const renderIcon = (iconName: string) => {
  const iconComponent = ElementPlusIconsVue[iconName as IconNames];
  if (iconComponent) {
    return h(resolveComponent(iconComponent.name));
  }
  return null;
};
</script>
