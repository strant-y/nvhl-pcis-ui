export interface DialogMethod {
    /**
     * 
     * @param c 动态组件映射名
     * @param d 传入弹窗的数据
     * @param m 传入弹窗的方法
     * @param t 弹窗参数
     * @returns 
     */
    open: (c: any, d: any, m :any, t: any) => any;
    handleClose: () => void
}