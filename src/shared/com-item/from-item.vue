<template>
  <div :class="{'show-right-btn': isBtnTrue()}" :style="{width: ( item.propWidth ? item.propWidth : 100) + '%', display: 'flex' }" >
      <div :style="{
        width:
          // 显示组件尾部按钮
          isBtnTrue() ? ((item.btnWidth ? (100 - item.btnWidth) : 75) + '%') : '100%',
          display: 'flex',
          alignItems: 'flex-start',
      }">
      <div class="width-100">
        <component
          ref="itemRef"
          :is="getcomRef(item.inputtype)"
          v-model="value"
          :item="item"
          :showLabel="showLabel"
          :parentFromUi="parentFromUi"
          @value-change="handleChange"
          :row="row"
        />
      </div>
      </div>
      <!---       将尾部按钮,整合至form公共表单中,显示组件尾部按钮       --->
      <template v-if="isBtnTrue()">
        <div :style="{width: (item.btnWidth ? item.btnWidth : 25) + '%' }">
          <rt-button :style = "{width: '100%'}"
            :item="item.btnItems"
            :parentItem="item"
            :row="row"
        />
        </div>
      </template>
    </div>
</template>

<script setup lang="ts">
import shared from "../shared";
import {CommonConstants} from "@/constants/CommonConstants";
const props = defineProps({
  modelValue: {
    type: [Object, String, Number, Boolean, Array],
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
  row: {
    type: Object as () => Record<string, any>,
    required: false,
  },
});
const itemRef = ref();
const value = ref<any>();
const key = computed(() => props.item.prop );
const itemConfig = computed(() => props.item );
const initFlag = ref(false);
const customMap = inject<any>('customMap', {});

const emits = defineEmits(["update:modelValue", "updateMethod"]); // 父组件监听事件，同步子组件值的变化给父组件
function handleChange(val?: any) {
  emits("update:modelValue", val);
  emits("updateMethod",props.item);
  compareValueChangeColor(val)
}

watch([() => props.modelValue], ([newModelValue]) => {
  value.value = newModelValue;
  if(!initFlag.value && !!newModelValue) {
    init(true)
  }
  props.item.func && typeof props.item.func === "function" ? props.item.func(newModelValue, props.row, props.item) : null;
  compareValueChangeColor(newModelValue);
  emits("updateMethod",props.item);
});
function tableExvalidate() {
  if (typeof itemRef.value?.tableExvalidate === "function") {
    return itemRef.value.tableExvalidate();
  } else {
    return null;
  }
}

function updateOption(newOption: any) {
  if (itemRef.value.updateOption) {
    itemRef.value.updateOption(newOption);
  }
}

function getcomRef(type: any) {
  return shared.componentMap[type];
}

async function compareValueChangeColor(value?: any) {
  try {
    let primevalForm: any = undefined;
    if(!!props.row && customMap.primevalForm && Array.isArray(customMap.primevalForm) && customMap.primevalForm.length > 0) {
      // grid表格模式处理
      const getIsRowData = (item: any) => {
        const keys = [customMap[CommonConstants.FORM_DATA_KEY]];
        const key = keys.find(f => Object.keys(customMap.primevalForm[0]).includes(f));
        return props.row[key] === item[key];
      }
      primevalForm = customMap.primevalForm.find((f: any) => getIsRowData(f))
      // TODO 在primevalForm中 找到相同行数据 ？ 没找到就是新增了一行 ，否则 判断当前要素是否修改值
    }else if (customMap.primevalForm && Object.keys(customMap.primevalForm).length > 0) {
      primevalForm = customMap.primevalForm;
    }
    if(primevalForm) {
      const isUndefined = (val: any) => {
        if(val === null || val === undefined || val === '' || (Array.isArray(val) && val.length === 0)) {
          return true;
        }
        return false;
      };
      const getPrimevalValue = () => {
        const val = primevalForm[props.item.prop];
        if(isUndefined(val)) {
          return undefined;
        }
        if(props.item.type === "date") {
          return val ? val.substring(0, 10) : null;
        }else {
          return val
        }
      };
      const getValue = () => {
        if(isUndefined(value)) {
          return undefined;
        }
        if(props.item.type === "date") {
          return value ? value.substring(0, 10) : null;
        }else {
          return value
        }
      }
      if (getPrimevalValue() !== getValue()) {
        setChangeInfo([CommonConstants.ITEM_CHANGE_CLASS_NAME], getPrimevalValue());
      } else {
        setChangeInfo([CommonConstants.ITEM_UNCHANGE_CLASS_NAME], undefined);
      }
    }
  } catch (e) {
    console.error(e);
  }
}

function setChangeInfo(classs: string[], text: any) {
  if(itemRef.value && itemRef.value.setCustomClass && typeof itemRef.value.setCustomClass === CommonConstants.TYPE_OF_FUNCTION) {
    itemRef.value.setCustomClass(classs);
  }
  if(itemRef.value && itemRef.value.setChangeInfo  && typeof itemRef.value.setCustomClass === CommonConstants.TYPE_OF_FUNCTION) {
    itemRef.value.setChangeInfo(!text ? text : {
      text: text,
    });
  }
}

function isBtnTrue(item : any){
  if(props.item.showExBtn && (props.item.showExBtn === true || props.item.showExBtn === '0') && !props.showLabel){
    return true;
  }
  return false;
}

defineExpose({
  tableExvalidate,
  updateOption,
  key,
  value,
  itemConfig,
  itemRef
});

onMounted(() => {
  value.value = props.modelValue;
  if(props.item.defaultValue && !value.value ){ //只有初始化,数据为空时,才进行初始化动作
    value.value = props.item.defaultValue;
  }
  init(false);
});

/**
 * 初始化数据变化触发
 * value 组件绑定的value
 * rowData 表格当前行的数据
 * config 当前组件的配置信息
 * itemRef 表单项ref
 */
function init(is: boolean) {
  if(props.item.onInit) {
    props.item.onInit({
      value: props.modelValue,
      rowData: props.row,
      config: props.item,
      itemRef: itemRef.value
    });
    initFlag.value = is;
  }
}
</script>
