import CustomRecording from "@/views/pcis/guide/CustomRecording.vue";
import MyPage from "@/views/pcis/my-page/myPage.vue";
import FactorConfig from "@/views/prodconfiguration/factorConfig.vue";
import ComponentConfig from "@/views/prodconfiguration/componentConfig.vue";
  


/**
 * 需要缓存状态的页面 组件
 */
const ViewsComponentsMap = {
    'guide': CustomRecording,
    'my-page': MyPage,
    'factorConfig': FactorConfig,
    'component': ComponentConfig,
};

function getCompByName(name: string): any {
    return ViewsComponentsMap[name];
}

export {
    getCompByName
};
