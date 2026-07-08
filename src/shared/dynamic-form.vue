<template>
  <div class="form-container">
    <el-form
        ref="fromRef"
        :model="form"
        :size="formUi.size"
        :label-position="formUi.labelPosition"
        :show-message="
            formUi.showMessage ? (formUi.showMessage === '1' ? true : false) : true
        "
        class="custom-form"
        :label-width="formUi.labelWidth && formUi.labelWidth !== 'auto' ? (formUi.labelWidth + 'px') : maxLabelWidth"
    >
      <el-row :gutter="10" style="margin-right: 1%;">
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
              <template v-if="item.inputtype === 'rtButton'">

                <el-form-item
                    :rules="item.rules ? item.rules : undefined"
                    :prop="item.prop"
                    :label-position="
                      item.inputtype === 'rttable' ? 'top' : undefined // table 组件,默认标题显示在top上
                    "
                    :label-width="calculatedLabelWidth()"
                >
                  <template #label>
                    <el-text class="mx-1" truncated @mouseover="checkIfTruncated($event, item.title)">
                      {{item.title}}
                    </el-text>
                  </template>
                  <rtButton :item="item.btnItems" />
                </el-form-item>
              </template>
              <template v-else-if="item.inputtype === 'rtinputgroup'">
                <el-form-item
                    :required="checkRequired(item)"
                    :for="
                      item.notes ? '-' : undefined // 当存在 提示信息时，防止点击label触发默认选中逻辑
                    "
                    :label-width="calculatedLabelWidth()"
                    class="group-input__items"
                >
                  <template #label>
                    <el-text class="mx-1" truncated @mouseover="checkIfTruncated($event, item.title)">
                      {{item.title}}
                    </el-text>
                    <rt-icon v-if="item.notes" :item="{ icon:'QuestionFilled',func:item.notes }" />
                    <el-tooltip v-if="item.iconInfo" :content="item.iconInfo" placement="top" effect="dark">
                      <rt-icon :item="{ icon:'QuestionFilled' }" />
                    </el-tooltip>
                  </template>
                  <div class="width-100">
                    <el-row class="show-group__row" v-if="item.groupList.length > 0" style="padding-top: 5px;">
                      <el-col
                          class="show-group__col"
                          :span="getspan(item, gitem)"
                          v-for="(gitem, index) in item.groupList"
                          :key="index"
                      >
                        <el-form-item
                            :rules="gitem.rules ? gitem.rules : undefined"
                            :prop="gitem.prop"
                            :class="{
                              'show-group-left__item': index === 0,
                              'show-group-center__item': index > 0 && index < item.groupList.length - 1,
                              'show-group-right__item': index === item.groupList.length - 1
                            }"
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
                    :for="
                      item.notes ? '-' : undefined // 当存在 提示信息时，防止点击label触发默认选中逻辑
                    "
                    :label-position="
                      item.inputtype === 'rttable' ? 'top' : undefined // table 组件,默认标题显示在top上
                    "
                    :label-width="calculatedLabelWidth()"
                >
                  <template #label>
                    <el-text class="mx-1" truncated @mouseover="checkIfTruncated($event, item.title)">
                      {{item.title}}
                    </el-text>
                    <rt-icon v-if="item.notes" :item="{ icon:'QuestionFilled',func:item.notes }" />
                    <el-tooltip v-if="item.iconInfo" :content="item.iconInfo" placement="top" effect="dark">
                      <rt-icon :item="{ icon:'QuestionFilled' }" />
                    </el-tooltip>
                  </template>
                  <from-item
                      ref="fromListRef"
                      v-model="form[item.prop]"
                      :item="item"
                      :parentFromUi="formUi"
                      @update-method="formsDataUpdate"
                  />
                </el-form-item>
              </template>
            </el-col>
          </template>
        </template>
      </el-row>
      <!------- 折叠筐内 表单 需要单独来显示  上面是未分组公共部分内容,下面为折叠筐内内容 -------->
      <template v-for="(v, k) in groupByList" :key="k">
        <div v-if="!v.hidden && props.fromSchema.filter(item => item.group === v.id && !item.hidden).length > 0">
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
          <el-row :gutter="10" style="margin-bottom: 10px;margin-right: 1%;">
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
                  <!-- inputgroup -->
                  <template v-if="item.inputtype === 'rtinputgroup'">
                    <el-form-item
                        :required="checkRequired(item)"
                        :for="item.notes ? '-' : undefined // 当存在 提示信息时，防止点击label触发默认选中逻辑
                        "
                        :label-width="calculatedLabelWidth()"
                        class="group-input__items"
                    >
                      <template #label>
                        <el-text class="mx-1" truncated @mouseover="checkIfTruncated($event, item.title)">
                          {{item.title}}
                        </el-text>
                        <rt-icon v-if="item.notes" :item="{ icon:'QuestionFilled',func:item.notes }" />
                        <el-tooltip v-if="item.iconInfo" :content="item.iconInfo" placement="top" effect="dark">
                          <rt-icon :item="{ icon:'QuestionFilled' }" />
                        </el-tooltip>
                      </template>
                      <div class="width-100">
                        <el-row class="show-group__row" v-if="item.groupList.length > 0">
                          <el-col
                              class="show-group__col"
                              :span="getspan(item, gitem)"
                              v-for="(gitem, index) in item.groupList"
                              :key="index"
                          >
                            <el-form-item
                                :rules="gitem.rules ? gitem.rules : undefined"
                                :prop="gitem.prop"
                                :class="{
                                  'show-group-left__item': index === 0,
                                  'show-group-center__item': index > 0 && index < item.groupList.length - 1,
                                  'show-group-right__item': index === item.groupList.length - 1
                                }"
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
                        :for="
                          item.notes ? '-' : undefined // 当存在 提示信息时，防止点击label触发默认选中逻辑
                        "
                        :label-width="calculatedLabelWidth()"
                    >
                      <template #label>
                        <el-text class="mx-1" truncated @mouseover="checkIfTruncated($event, item.title)">
                          {{item.title}}
                        </el-text>
                        <rt-icon v-if="item.notes" :item="{ icon:'QuestionFilled',func:item.notes }" />
                        <el-tooltip v-if="item.iconInfo" :content="item.iconInfo" placement="top" effect="dark">
                          <rt-icon :item="{ icon:'QuestionFilled' }" />
                        </el-tooltip>
                      </template>
                      <from-item
                          ref="fromListRef"
                          v-model="form[item.prop]"
                          :item="item"
                          :parentFromUi="formUi"
                          @update-method="formsDataUpdate"
                      />
                    </el-form-item>
                  </template>
                </el-col>
              </template>
            </template>
          </el-row>
        </div>
      </template>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { FormInstance } from "element-plus";
import Validator from "async-validator";
import { AppGridEditMethod } from "./app-grid-edit-config";
import {checkIfTruncated, updateLabelWidth} from "@/utils/common";
const maxLabelWidth = computed(() => updateLabelWidth()); // 默认值

// 计算label宽度
const calculatedLabelWidth = () => {
  let originalWidth;
  if (formUi.labelWidth && formUi.labelWidth !== 'auto') {
    originalWidth = formUi.labelWidth.includes('px')
        ? formUi.labelWidth
        : `${formUi.labelWidth}px`;
  } else {
    originalWidth = maxLabelWidth.value;
  }
  const widthValue = parseFloat(originalWidth);
  const finalValue = Math.max( widthValue, 0);
  return `${finalValue}px`;
};

defineOptions({
  name: "DynamicForms",
  inheritAttrs: false,
});
interface GroupItem {
  id: any;
  title: any;
  disabled: boolean;
}

const fromRef = ref<FormInstance>();
const fromListRef = ref<Array<AppGridEditMethod>>([]);
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
    if (key.inputtype === "rtinputgroup") {
      key.groupList.forEach((gkey: any) => {
        form[gkey.prop] = null;
      });
    } else {
      form[key.prop] = null;
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
  if (props.fromUi) {
    groupByList.value = [];
    Object.keys(props.fromUi).forEach((key) => {
      if (key === "cols") {
        if (props.fromUi && props.fromUi[key]) {
          formUi["span"] = 24 / props.fromUi[key];
        } else {
          formUi["span"] = 8;
        }
      } else if (key === "groupBy") {
        if (props.fromUi && props.fromUi.groupBy) {
          for (const item of props.fromUi.groupBy) {
            const g = {
              id: item.id,
              title: item.title,
              hidden: item.hidden === true ? true : false,
            };
            groupByList.value.push(g);
          }
        }
      } else {
        formUi[key] = props.fromUi?.[key];
      }
    });
  }

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

function setRuleType(irules: any ,schema: any) {
  let rules = JSON.parse(JSON.stringify(irules));
  if(schema.group){ // 如果群组整个被隐藏,则不再进行校验
    const uicf = props.fromUi.groupBy.filter((g)=>g.id === schema.group);
    let h = false;
    if(uicf && uicf.length > 0){
      if(uicf[0].hidden === true){
        h = true;
      }
    }
    if(h){
      return null;
    }
  }
  if (schema.inputtype === "rtnumber" ||
    schema.inputtype === "rtinput" ) {
    // 因为校验输入的特殊性,有时候是string类型数据,有时候是number类型数据,因此需要根据实际数据类型进行判断
    if(typeof form[schema['prop']] === 'number'){
      if (rules && rules.length > 0) {
        rules.forEach((item: any) => {
          item.type = "number";
        });
      }
    }else{
      if (rules && rules.length > 0) {
        rules.forEach((item: any) => {
          item.type = "string";
        });
      }
    }
  }
  if(schema.inputtype === "rtdatepicker"){
    if(schema['type'] === 'datetimerange'){
      if (rules && rules.length > 0) {
        rules.forEach((item: any) => {
          item.type = "array";
        });
      }
    }else{
      if((typeof form[schema['prop']]) === 'number'){
        if (rules && rules.length > 0) {
          rules.forEach((item: any) => {
            item.type = "number";
          });
        }
      }else{
        if (rules && rules.length > 0) {
          rules.forEach((item: any) => {
            item.type = "string";
          });
        }
      }
    }
  }
  if (schema.inputtype === "rtSelectV2" || schema.inputtype === "rtselect") {
    if(schema.multiple === 1 || schema.multiple === true || schema.multiple === '1' ){
      if (rules && rules.length > 0) {
        rules.forEach((item: any) => {
          item.type = "array";
        });
      }
    }
  }
  if (schema.inputtype === "rtcascader") {
    if (rules && rules.length > 0) {
      rules.forEach((item: any) => {
        item.type = "array";
      });
    }
  }
  return rules;
}

async function validate() {
  // 存储验证规则的对象
  let rules = <any>{};
  for (const schama in props.fromSchema) {
    if(props.fromSchema[schama].inputtype === 'rtinputgroup'){
      const g = props.fromSchema[schama].groupList;
      g.forEach((gi)=>{
        if(gi.hidden !== true && gi.rules){
          let rul = gi.rules;
          const nrul = setRuleType(rul,gi);
          if(nrul){
            rules[gi.prop] = nrul;
          }
        }
      })
    } else if (props.fromSchema[schama].hidden !== true && props.fromSchema[schama].rules) {
      let rul = props.fromSchema[schama].rules;
      const nrul = setRuleType(rul,props.fromSchema[schama]);
      if(nrul){
        rules[props.fromSchema[schama].prop] = nrul;
      }
    }
  }
  // 创建验证器实例
  const validator = new Validator(rules);
  const r = await dovalidate(validator);
  console.log(r);
  let l = [];
  if(r && r.length > 0){
    const isEx = false;
    props.fromSchema.filter((item:any) => {
      const r2 = r.filter((i:any) => i.field === item.prop && (item.expand === true || item.expand === '1'));
      if(r2 && r2.length > 0 && !l.includes(item.group)){
        l.push(item.group);
      }
    });
  }
  if(l && l.length > 0){
    groupByList.value.forEach((item:any) => {
      if(l.includes(item.id)){
        item.disabled = true;
      }
    });
    nextTick(()=>{
      freeValidate();
    })
  }else{
    return await freeValidate();
  }
  if(r && r.length > 0){
    // console.log(form);
    // console.log(rules);
    // console.log(props.fromSchema);
    return false;
  }else{
    return true;
  }
}

async function freeValidate(){
  return new Promise((resolve) => {
    fromRef.value?.validate((valid, fields) => {
      if (valid) {
        resolve(true);
      } else {
        resolve(false);
      }
    }).then(async (formValid: any) => {
      let fromListbl = formValid;
      if (fromListRef.value) {
        for (const ref in fromListRef.value) {
          const exvali = await fromListRef.value[ref].tableExvalidate();
          if (exvali != null) {
            fromListbl = fromListbl && exvali;
          }
        }
      }
      resolve(fromListbl === undefined ? true : fromListbl);
    });
  });
}

function dovalidate(validator: any) { 
  const p = new Promise((resolve) => {
    // 执行验证操作
    validator.validate(form, (data: any) => {
      // 根据验证结果进行处理
      if (data) {
        resolve(data);
      } else {
        // 验证通过
        resolve(true);
      }
    });
  });
  return p;
}


async function validateField(fields:any) {
  // 1. 主表单指定字段校验
  let mainFormValid = false;
  // 使用主表单的validateField方法校验指定字段
  await fromRef.value?.validateField(fields, (valid, invalidFields) => {
    if (valid) {
      mainFormValid = true;
    } else {
      mainFormValid = false;
    }
  });

  // 2. 列表项校验（复用原有逻辑，与validate保持一致）
  let listFormValid = true;
  if (fromListRef.value) {
    for (const ref in fromListRef.value) {
      const exvali = await fromListRef.value[ref].tableExvalidate();
      if (exvali != null) {
        listFormValid = listFormValid && exvali;
      }
    }
  }

  // 3. 整体校验结果 = 主表单指定字段校验通过 + 列表项校验通过
  return mainFormValid && listFormValid;
}


//只清空报错信息
function clearValidate(key: string) {
  key ? fromRef.value?.clearValidate(key) : null;
}

//初始化值和清空报错信息
function resetFields() {
  fromRef.value?.resetFields();
}

function getFromValue() {
  const redata = JSON.parse(JSON.stringify(form));
  if (props.fromSchema) {
    props.fromSchema.forEach((key: any) => {
      if (key.inputtype === "rtcascader") {
        const props =
          typeof key.cascaderprops === "string"
            ? JSON.parse(key.cascaderprops)
            : key.cascaderprops;
        const v = redata[key.prop];
        if (props && props.length > 0 && v) {
          for (var i = 0; i < props.length; i++) {
            if (v[i]) {
              redata[props[i]] = v[i];
            }
          }
        }
        delete redata[key.prop];
      } else if (key.inputtype === "rtinputgroup") {
        if (key.groupList && key.groupList.length > 0) {
          key.groupList.forEach((gkey: any) => {
            if (gkey.inputtype === "rtcascader") {
              const gprops =
                typeof gkey.cascaderprops === "string"
                  ? JSON.parse(gkey.cascaderprops)
                  : gkey.cascaderprops;
              const gv = redata[gkey.prop];
              if (gprops && gprops.length > 0 && gv) {
                for (var i = 0; i < gprops.length; i++) {
                  if (gv[i]) {
                    redata[gprops[i]] = gv[i];
                  }
                }
              }
              delete redata[gkey.prop];
            }
          });
        }
      }
    });
  }
  return redata;
}
function setFormValue(data: any, noupdate = false) {
  let setdata = data;
  if (props.fromSchema) {
    props.fromSchema.forEach((key: any) => {
      if (key.inputtype === "rtcascader") {
        const props =
          typeof key.cascaderprops === "string"
            ? JSON.parse(key.cascaderprops)
            : key.cascaderprops;
        if (props && props.length > 0) {
          let cascd = [];
          for (var i = 0; i < props.length; i++) {
            if (setdata[props[i]]) {
              cascd.push(setdata[props[i]]);
            }
            delete setdata[props[i]];
          }
          setdata[key.prop] = cascd;
        }
      } else if (key.inputtype === "rtinputgroup") {
        if (key.groupList && key.groupList.length > 0) {
          key.groupList.forEach((gkey: any) => {
            if (gkey.inputtype === "rtcascader") {
              const gprops =
                typeof gkey.cascaderprops === "string"
                  ? JSON.parse(gkey.cascaderprops)
                  : gkey.cascaderprops;
              if (gprops && gprops.length > 0) {
                let cascd = [];
                for (var i = 0; i < gprops.length; i++) {
                  if (setdata[gprops[i]]) {
                    cascd.push(setdata[gprops[i]]);
                  }
                  delete setdata[gprops[i]];
                }
                setdata[gkey.prop] = cascd;
              }
            }
          });
        }
      }
    });
  }
  Object.assign(form, setdata);
  if (!noupdate) {
    emits("formsDataUpdate", form);
  }
}

function formsDataUpdate(item:any) {
  if(item.rules && form[item.prop]){ // 如果有验证规则,则form表单验证一下值
    if(item.inputtype === 'rtcascader'){  // 级联组件,只有有值的时候,才可以执行验证方法
      if(form[item.prop].length > 0){
        fromRef.value?.validateField(item.prop);
      }
    }else{
      fromRef.value?.validateField(item.prop);
    }
  }
  emits("formsDataUpdate", form, item);
}

function getValue(key: any) {
  return form[key];
}

function setValue(key: any, value: any, noupdate = false) {
  form[key] = value;
  if (!noupdate) {
    let item = null;
    props.fromSchema.forEach((schema: any) => {
    if (schema.inputtype === "rtinputgroup") {
      schema.groupList.forEach((gkey: any) => {
        if(gkey.prop === key){
          item = gkey;
        }
      });
    } else {
      if(schema.prop === key){
        item = schema;
      }
    }
  });
    emits("formsDataUpdate", form, item);
  }
}

function checkRequired(item: any) {
  let re = false;
  if (item.groupList && item.groupList.length > 0) {
    for (let i = 0; i < item.groupList.length; i++) {
      const g = item.groupList[i];

      if (g.required === "1" || g.required === 1 || g.required === true) {
        return true;
      }
      const rule = g.rules;
      if (rule && rule.length > 0) {
        rule.forEach((rule: any) => {
          if (rule.required) {
            re = true;
          }
        });
      }
    }
  }
  return re;
}
function setDisabledAll(isDisabled: boolean = true) {
  if (props.fromSchema) {
    props.fromSchema.forEach((key: any) => {
      if (key.inputtype === "rtinputgroup") {
        key.groupList.forEach((gkey: any) => {
          gkey.disabled = isDisabled;
        });
      } else {
        key.disabled = isDisabled;
      }
      if (key.btnItems) {
        key.btnItems.disabled = isDisabled;
      }
    });
  }
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
function getspan(item: any, gitem: any) {
  const r = Math.floor(
    gitem.persent ? gitem.persent : 24 / item.groupList.length
  );
  return r;
}

watch(
  () => props.fromUi,
  (newFromUi) => {
    initUI();
  },
  {
    deep: true,
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

onMounted(() => {
  updateLabelWidth();
  window.addEventListener("resize", updateLabelWidth);

});

onBeforeUnmount(() => {
  window.removeEventListener("resize", updateLabelWidth);
});

defineExpose({
  getFromValue,
  setFormValue,
  validate,
  setValue,
  getValue,
  checkKey,
  clearValidate,
  resetFields,
  setDisabledAll,
  fromListRef,
  validateField,
});
</script>
<style lang="scss" scoped>
@use "@/styles/custom-index";
</style>
<style lang="css" scoped>
.rt_group {
   margin-top: 6px;
   margin-bottom: 6px;
   background: var(--card-group-header-bg-color);
  /* border: 1px solid #D9D9D9; */
  padding: 0px 12px;
}
.rt_group_title {
  font-weight: 450;
  font-size: var(--card-group-header-title-size);
  color: var(--el-text-color);
  line-height: 24px;
}
.rt_group_icon {
  float: right;
  margin-right: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
}
:deep(.group-input__items .el-form-item__content) {
  line-height: normal;
}
</style>
