
export const pageMethod = {
    isEditScene: function(opertaor: any){
        const param = opertaor.getParam();
        if(param.pageType === "TEMPORARY_DEPOSIT" || param.pageType === "EDR_APP_NEW_SCENE" ){
            return true;
        }else{
            return false;
        }
    },
    isReadOnlyScene: function(opertaor: any){
        const param = opertaor.getParam();
        if(param.pageType === "readonly" || param.pageType === "UW_READ_SCENE"){
            return true;
        }else{
            return false;
        }
    }
};
