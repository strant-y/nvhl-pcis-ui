import CustomRecording from "@/views/pcis/guide/CustomRecording.vue";
import MyPage from "@/views/pcis/my-page/myPage.vue";
import FactorConfig from "@/views/prodconfiguration/factorConfig.vue";
import ComponentConfig from "@/views/prodconfiguration/componentConfig.vue";
import ApplicationQuerys from "@/views/comprehensive-query/pages/application-querys.vue";
  


/**
 * 需要缓存状态的页面 组件
 */
const ViewsComponentsMap: any = {
    'guide': markRaw(CustomRecording),
    'my-page':  markRaw(MyPage),
    'factorConfig':  markRaw(FactorConfig),
    'component':  markRaw(ComponentConfig),
    'application-querys':  markRaw(ApplicationQuerys),
};

function getCompByName(name: string): any {
    return ViewsComponentsMap[name];
}

function getIfCompViewByName(name: string): boolean {
    return name in ViewsComponentsMap;
}

export {
    getCompByName,
    getIfCompViewByName
};
