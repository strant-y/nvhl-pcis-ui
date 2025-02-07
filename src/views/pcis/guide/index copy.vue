<!-- 用户管理 -->
<template>
  <div class="app-container">
    <app-free-edit :freeEditConfig="formconfig1" ref="freeEditRef" />
  </div>
</template>

<script setup lang="ts">
import { useValidator } from "@/typings/useValidator";
const { getRules } = useValidator();

import { ref } from "vue";
import {
  AppFreeEditConfig,
  AppFreeEditMethod,
  createAppFreeEditConfig,
  createFromUiConfig,
} from "@/shared/app-free-edit-config";

const freeEditRef = ref<AppFreeEditMethod | null>(null);;
const router = useRouter();
import { formInit } from "@/shared/from-init";

const formconfig1 = reactive<AppFreeEditConfig>(createAppFreeEditConfig({}));
onMounted(async () => {
  const param = await fetch("/param/pcis_guide.json");
  const str = await param.text();
  const formconfig11 = formInit(str, method, exRules);
  console.log(formconfig11);
  Object.assign(formconfig1, formconfig11);
});

// 绑定方法
const method = {
  func1: () => {
    console.log(getRules);
  },

  submit: async () => {
    const r = await freeEditRef.value.validate();
    console.log(r);
    if(r){
      const data = freeEditRef.value?.getFromValue();
      router.push({
        path: "/pcis/my-page",
        query: {param: JSON.stringify({...data, ...{pageType: "app"}})}
      });
    }else {
      ElMessage.warning("请检查表单！");
    }
  },
  setTbaleValue: () => {
    freeEditRef.value.setData({
      name: "test",
      edittable: [
        {
          date: "2022-01-01",
          number: 100,
          select: "1",
          tag1: "2",
        },
        {
          name: "test",
          date: "2022-01-01",
          number: 123,
          selectInput: "10",
          select: "2",
          tag1: "1",
        },
        {
          name: "test2",
          date: "2022-01-02",
          number: 223,
        },
      ],
    });
  },
};

// 绑定特殊验证器
const exRules = {
  byrtInput: (rule: any, value: any, callback: any) => {
    const r = freeEditRef.value.getFromData();
    if (r["name"]) {
      callback();
    } else {
      callback("姓名");
    }
  },
};
</script>

<style scoped></style>
