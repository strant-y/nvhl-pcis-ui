import { isEditScene } from "@/constants/tab-constants";
import { dataOpertaor} from "@/store";


export const pageMethod ={ 
    isEditScene: function(){
        const opertaor = dataOpertaor();
        const param = opertaor.getParam();
        if(param.pageType === "TEMPORARY_DEPOSIT" || param.pageType === "EDR_APP_NEW_SCENE" || param.pageType === "PLY_UW_PROCESS_SCENE"
            || param.pageType === "PLY_UW_PROCESS_SCENE"
        ){
            return true;
        }else{
            return false;
        }
    },
    isReadOnlyScene: function(){
        const opertaor = dataOpertaor();
        const param = opertaor.getParam();
        if(param.pageType === "readonly" || param.pageType === "UW_READ_SCENE"){
            return true;
        }else{
            return false;
        }
    }
}
