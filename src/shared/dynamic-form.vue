<template>
  <el-form
    ref="fromRef"
    :model="form"
    :label-width="formUi.labelWidth"
    :size="formUi.size"
    :label-position="formUi.labelPosition"
    :show-message="
      formUi.showMessage ? (formUi.showMessage === '1' ? true : false) : true
    "
  >
    <el-row :gutter="20">
      <template v-for="(item, index) in props.fromSchema" :key="index">
        <template v-if="!item.hidden">
          <el-col
            :span="
              item.inputtype === 'rttable' // table 组件单独占满一行
                ? 24
                : item.itemWidth
                  ? item.itemWidth * formUi.span
                  : formUi.span
            "
            v-if="!item.group"
          >
            <template v-if="item.inputtype === 'rtinputgroup'">
              <el-form-item>
                <template #label>
                  <template v-if="item.title?.length > 8">
                    <el-tooltip
                      effect="dark"
                      :content="item.title"
                      placement="top-start"
                    >
                      {{ item.title.substring(0, 8) + "..." }}
                    </el-tooltip>
                  </template>
                  <template v-else>
                    {{ item.title }}
                  </template>
                </template>
                <div
                  :style="{
                    width: '100%',
                  }"
                >
                  <el-row :gutter="1" v-if="item.groupList.length > 0">
                    <el-col
                      :span="getspan(item, gitem)"
                      v-for="(gitem, index) in item.groupList"
                      :key="index"
                    >
                      <el-form-item
                        :rules="gitem.rules ? gitem.rules : undefined"
                        :prop="gitem.prop"
                      >
                        <from-item
                          ref="fromListRef"
                          v-model="form[gitem.prop]"
                          :item="gitem"
                          :parentFromUi="formUi"
                          @update-method="formsDataUpdate"
                        />
                      </el-form-item>
                    </el-col>
                  </el-row>
                </div>
              </el-form-item>
            </template>
            <template v-else>
              <el-form-item
                :rules="item.rules ? item.rules : undefined"
                :prop="item.prop"
                :label-position="
                  item.inputtype === 'rttable' ? 'top' : undefined // table 组件,默认标题显示在top上
                "
              >
                <template #label>
                  <template v-if="item.title?.length > 8">
                    <el-tooltip
                      effect="dark"
                      :content="item.title"
                      placement="top-start"
                    >
                      {{ item.title.substring(0, 8) + "..." }}
                    </el-tooltip>
                  </template>
                  <template v-else>
                    {{ item.title }}
                  </template>
                </template>
                <div
                  :style="{
                    width:
                      item.showExBtn && item.inputtype !== 'rttable' // 显示组件尾部按钮 table 组件不显示尾部按钮
                        ? (item.btnWidth ? 100 - item.btnWidth : 75) + '%'
                        : '100%',
                    display: 'flex',
                    alignItems: 'flex-start',
                  }"
                >
                  <from-item
                    ref="fromListRef"
                    v-model="form[item.prop]"
                    :item="item"
                    :parentFromUi="formUi"
                    @update-method="formsDataUpdate"
                  />
                </div>

                <!---       显示组件尾部按钮       --->
                <template v-if="item.showExBtn">
                  <rt-button
                    v-if="item.inputtype !== 'rttable'"
                    :style="{
                      width: (item.btnWidth ? item.btnWidth : 25) + '%',
                      height: '100%',
                    }"
                    :item="item.btnItems"
                    @closepopover="(rev) => setPopover(rev, item)"
                  />
                </template>
              </el-form-item>
            </template>
          </el-col>
        </template>
      </template>
    </el-row>
    <!------- 折叠筐内 表单 需要单独来显示  上面是未分组公共部分内容,下面为折叠筐内内容 -------->
    <div v-for="(v, k) in groupByList" :key="k">
      <div class="rt_group">
        <span class="rt_group_title">{{ v.title }} </span>
        <template v-if="checkNeadGroup(v)">
          <a
            v-if="v.disabled"
            class="rt_group_icon"
            @click="v.disabled = !v.disabled"
          >
            <rt-icon
              :item="{
                icon: 'ArrowUp',
                iconSize: '16',
              }"
            />
            <el-text class="mx-1">折叠</el-text>
          </a>
          <a
            v-if="!v.disabled"
            class="rt_group_icon"
            @click="v.disabled = !v.disabled"
          >
            <rt-icon
              :item="{
                icon: 'ArrowDown',
                iconSize: '16',
              }"
            />
            <el-text class="mx-1">展开</el-text>
          </a>
        </template>
      </div>
      <el-row :gutter="20">
        <template v-for="(item, index) in props.fromSchema" :key="index">
          <template v-if="!item.hidden">
            <el-col
              :span="
                item.inputtype === 'rttable' // table 组件单独占满一行
                  ? 24
                  : item.itemWidth
                    ? item.itemWidth * formUi.span
                    : formUi.span
              "
              v-if="
                item.group === v.id &&
                (item.expand ? item.expand && v.disabled : true)
              "
            >
              <template v-if="item.inputtype === 'rtinputgroup'">
                <el-form-item>
                  <template #label>
                    <template v-if="item.title?.length > 8">
                      <el-tooltip
                        effect="dark"
                        :content="item.title"
                        placement="top-start"
                      >
                        {{ item.title.substring(0, 8) + "..." }}
                      </el-tooltip>
                    </template>
                    <template v-else>
                      {{ item.title }}
                    </template>
                  </template>
                  <div
                    :style="{
                      width: '100%',
                    }"
                  >
                    <el-row :gutter="1" v-if="item.groupList.length > 0">
                      <el-col
                        :span="getspan(item, gitem)"
                        v-for="(gitem, index) in item.groupList"
                        :key="index"
                      >
                        <el-form-item
                          :rules="gitem.rules ? gitem.rules : undefined"
                          :prop="gitem.prop"
                        >
                          <from-item
                            ref="fromListRef"
                            v-model="form[gitem.prop]"
                            :item="gitem"
                            :parentFromUi="formUi"
                            @update-method="formsDataUpdate"
                          />
                        </el-form-item>
                      </el-col>
                    </el-row>
                  </div>
                </el-form-item>
              </template>
              <template v-else>
                <el-form-item
                  :rules="item.rules ? item.rules : undefined"
                  :prop="item.prop"
                >
                  <template #label>
                    <template v-if="item.title?.length > 8">
                      <el-tooltip
                        effect="dark"
                        :content="item.title"
                        placement="top-start"
                      >
                        {{ item.title.substring(0, 8) + "..." }}
                      </el-tooltip>
                    </template>
                    <template v-else>
                      {{ item.title }}
                    </template>
                  </template>
                  <div
                    :style="{
                      width:
                        item.showExBtn && item.inputtype !== 'rttable'
                          ? (item.btnWidth ? 100 - item.btnWidth : 75) + '%'
                          : '100%',
                    }"
                  >
                    <from-item
                      ref="fromListRef"
                      v-model="form[item.prop]"
                      :item="item"
                      :parentFromUi="formUi"
                      @update-method="formsDataUpdate"
                    />
                  </div>

                  <!---       显示组件尾部按钮       --->
                  <rt-button
                    v-if="item.showExBtn && item.inputtype !== 'rttable'"
                    :style="{
                      width: (item.btnWidth ? item.btnWidth : 25) + '%',
                    }"
                    :item="item.btnItems"
                  />
                </el-form-item>
              </template>
            </el-col>
          </template>
        </template>
      </el-row>
    </div>
  </el-form>
</template>

<script setup lang="ts">
defineOptions({
  name: "DynamicForms",
  inheritAttrs: false,
});
interface GroupItem {
  id: any;
  title: any;
  disabled: boolean;
}

const fromRef = ref("fromRef");
const fromListRef = ref("fromListRef");
const props = defineProps({
  fromSchema: {
    type: Object as () => Record<string, any>,
    required: false,
  },
  fromUi: {
    type: Object as () => Record<string, any>,
    required: false,
  },
});

const emits = defineEmits(["formsDataUpdate"]); // 父组件监听事件，同步子组件值的变化给父组件

// 表单初始化
const form = reactive<Record<string, any>>({});
if (props.fromSchema) {
  props.fromSchema.forEach((key: any) => {
    form[key.prop] = null;
    if (key.inputtype === "rtinputgroup") {
      key.groupList.forEach((gkey: any) => {
        form[gkey.prop] = null;
      });
    }
  });
}

function checkNeadGroup(item: any) {
  let r = false;
  props.fromSchema?.forEach((key: any) => {
    if (key.group === item.id && key.expand) {
      r = true;
      return;
    }
  });
  return r;
}
const formUi = reactive<Record<string, any>>({});
/**
 *  样式初始化,对于未设置的参数进行初始化
 * */
function initUI() {
  Object.keys(props.fromUi).forEach((key) => {
    if (key === "cols") {
      if (props.fromUi[key]) {
        formUi["span"] = 24 / props.fromUi[key];
      } else {
        formUi["span"] = 8;
      }
    } else if (key === "groupBy") {
      if (props.fromUi.groupBy) {
        for (const item of props.fromUi.groupBy) {
          const g = {
            id: item.id,
            title: item.title,
            disabled: item.disabled,
          };
          const s = item.active ? item.active : true;
          if (s) {
            activeList.value.push(item.id);
          }
          groupByList.value.push(g);
        }
      }
    } else {
      formUi[key] = props.fromUi[key];
    }
  });
  if (!formUi["span"]) {
    formUi["span"] = 8;
  }
  if (!formUi["itemWidth"] && formUi["itemWidth"] != 0) {
    //默认item宽度为自动
    formUi["itemWidth"] = "auto";
  }
  if (!formUi["labelPosition"]) {
    formUi["labelPosition"] = "right";
  }
  if (!formUi["size"]) {
    formUi["size"] = "default";
  }
}
const groupByList = ref<GroupItem[]>([]);
const activeList = ref<string[]>([]);
if (props.fromSchema) {
  initUI();
}

function setPopover(v: any, item: any) {
  setValue(item.prop, v);
}

async function validate() {
  const promise = await fromRef.value.validate((valid, fields) => {
    if (valid) {
      console.log("submit!");
    } else {
      console.log("error submit!", fields);
    }
  });
  let fromListbl = promise;
  if (fromListRef.value) {
    for (const ref in fromListRef.value) {
      const exvali = await fromListRef.value[ref].tableExvalidate();
      if (exvali != null) {
        fromListbl = fromListbl && exvali;
      }
    }
  }
  return fromListbl;
}

//只清空报错信息
function clearValidate(key) {
  key ? fromRef.value.clearValidate(key) : fromRef.value.clearValidate();
}

//初始化值和清空报错信息
function resetFields() {
  fromRef.value.resetFields();
}

function getFromValue() {
  const redata = JSON.parse(JSON.stringify(form));
  if (props.fromSchema) {
    props.fromSchema.forEach((key: any) => {
      if (key.inputtype === "rtcascader") {
        const props = key.cascaderprops;
        const v = redata[key.prop];
        if(props && props.length > 0 ){
          for(var i = 0; i < props.length; i++){
            redata[props[i]] = v[i];
          }
          delete redata[key.prop];
        }
      }
    });
  }
  return redata;
}
function setFormValue(data: any,noupdate = false) {
  let setdata = data;
  if (props.fromSchema) {
    props.fromSchema.forEach((key: any) => {
      if (key.inputtype === "rtcascader") {
        const props = key.cascaderprops;
        // const v = setdata[key.prop];
        if(props && props.length > 0 ){
          let cascd = [];
          for(var i = 0; i < props.length; i++){
            cascd.push(setdata[props[i]]);
            delete setdata[props[i]];
          }
          setdata[key.prop] = cascd;
        }
      }
    });
  }
  Object.assign(form, setdata);
  if(!noupdate){
    emits("formsDataUpdate", form);
  }
}

function formsDataUpdate() {
  emits("formsDataUpdate", form);
}

function getValue(key: any) {
  return form[key];
}

function setValue(key: any, value: any) {
  form[key] = value;
  emits("formsDataUpdate", form);
}
function checkKey(k: any) {
  let r = false;
  props.fromSchema?.forEach((key: any) => {
    if (key.prop === k) {
      r = true;
    }
    if (key.inputtype === "rtinputgroup") {
      key.groupList.forEach((gkey: any) => {
        if (gkey.prop === k) {
          r = true;
        }
      });
    }
  });
  return r;
}

/* 计算所需span宽度 */
function getspan(item, gitem) {
  const r = Math.floor(
    gitem.persent ? gitem.persent : 24 / item.groupList.length
  );
  return r;
}

watch(
  () => props.fromUi,
  (newFromUi) => {
    initUI();
  }
);
watch(form, (newForm) => {});
watch(
  () => props.fromSchema,
  (newFromSchema) => {},
  {
    deep: true,
  }
);

onMounted(() => {});

defineExpose({
  getFromValue,
  setFormValue,
  validate,
  setValue,
  getValue,
  checkKey,
  clearValidate,
  resetFields,
});
</script>

<style lang="css" scoped>
.rt_group {
  background: #f2f2f2;
  margin-bottom: 10px;
}
.rt_group_title {
  font-weight: bold;
  font-size: 16px;
}
.rt_group_icon {
  float: right;
  margin-right: 10px;
  cursor: pointer;
}
</style>
