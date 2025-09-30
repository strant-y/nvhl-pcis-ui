export const SCENE_PLY_APP_NEW = 'PLY_APP_NEW_SCENE';                         // 投保-新增
export const SCENE_TEMPORARY_DEPOSIT = 'TEMPORARY_DEPOSIT';                   // 暂存单

/*---------------------------场景常量 begin---------------------------*/
export const SCENE_TEMPLATE = 'PLY_APP_TEMPLATE_SCENE';                         // 模板设置
export const SCENE_PLAN = 'PLY_APP_PLAN_SCENE';                                 // 方案录单
export const SCENE_PLAN_NEW = 'PLY_APP_NEW_PLAN_SCENE';                         // 创建方案
export const SCENE_PLAN_UPDATE = 'PLY_APP_UPDATE_PLAN_SCENE';                   // 修改方案
export const SCENE_PLAN_UW_PROCESS = 'PLY_APP_UW_PROCESS_SCENE';                // 方案审核场景
export const SCENE_PLAN_READ = 'PLY_APP_PLAN_READ_SCENE';                       // 方案查看

export const SCENE_PLY_APP_MODIFY_UNSUBMIT = 'PLY_APP_MODIFY_UNSUBMIT_SCENE'; // 投保－修改（未提核）--暂存
export const SCENE_PLY_APP_MODIFY_BOUNCED = 'PLY_APP_MODIFY_BOUNCED_SCENE';   // 投保－修改（核保退回）
export const SCENE_PLY_APP_READ = 'PLY_APP_READ_SCENE';                       // 投保－查看投保单
export const SCENE_PLY_ECARGO_READ = 'PLY_ECARGO_READ_SCENE';                       // 投保－查看投保单
export const SCENE_PLY_APP_READBEARER = 'PLY_APP_READBEARER_SCENE';                       // 不记名补录投保－查看投保单
export const SCENE_PLY_APP_ON_UW = 'PLY_APP_ON_UW_SCENE';                     // 投保－已提交核保

export const SCENE_PLY_APP_REL = 'PLY_APP_REL_SCENE';                         // 关联投保

export const SCENE_PLY_APP_ADD_RECORD = 'PLY_APP_ADD_RECORD';                 // 记名补录
export const SCENE_PLY_APP_ADD_NORECORD = 'PLY_APP_ADD_NORECORD';             // 不记名补录

export const SCENE_PLY_APP_PKG_BLANK = 'PLY_APP_PKG_BLANK_SCENE';             // 套餐录入保单（空白）
export const SCENE_PLY_APP_PKG_COPY = 'PLY_APP_PKG_COPY_SCENE';               // 套餐录入保单（复制已录单）

export const SCENE_EDR_APP_NEW = 'EDR_APP_NEW_SCENE';                          // 批改申请-新增
export const SCENE_EDR_APP_MODIFY_UNSUBMIT = 'EDR_APP_MODIFY_UNSUBMIT_SCENE'; // 批改申请-修改（未提核）--暂存
export const SCENE_TEMPORARY_DEPOSITBEARER = 'TEMPORARY_DEPOSITBEARER';                   // 不记名暂存单
export const SCENE_EDR_APP_MODIFY_BOUNCED = 'EDR_APP_MODIFY_BOUNCED_SCENE';   // 批改申请-修改（核保退回）
export const SCENE_EDR_APP_MODIFY_BOUNCEDBEARER = 'EDR_APP_MODIFY_BOUNCEDBEARER_SCENE';   // 不记名补录-修改（核保退回）
export const SCENE_EDR_APP_READ = 'EDR_APP_READ_SCENE';                       // 批改申请-查看申请的新保单
export const SCENE_EDR_APP_ON_UW = 'EDR_APP_ON_UW_SCENE';                     // 批改申请－已提交核保

export const SCENE_PLY_UW_PROCESS = 'PLY_UW_PROCESS_SCENE';                   // 核保-处理
export const SCENE_PLY_UW_PROCESSBEARER = 'PLY_UW_PROCESSBEARER_SCENE';                   // 不记名补录核保-处理
export const SCENE_PLY_UW_READ = 'UW_READ_SCENE';                             // 核保-查看

export const SCENE_EDR_UW_PROCESS = 'EDR_UW_PROCESS_SCENE';                   // 核保-处理

export const SCENE_PLY_PRINTABLE = 'PLY_PRINTABLE_SCENE';                     // 保单-可打印保单
export const SCENE_PLY_READ_LATEST = 'PLY_READ_LATEST_SCENE';                 // 保单-查看最新记录
export const SCENE_PLY_READ_SNAPSHOT = 'PLY_READ_SNAPSHOT_SCENE';             // 保单-查看历史记录
export const SCENE_PLY_READ_PRIM = 'PLY_READ_PRIM_SCENE';                     // 保单-查看原始记录
export const SCENE_PLY_QUERY_PRIM = 'PLY_READ_QUERY_SCENE';                   // 保单-查看记录
export const SCENE_PLY_APP_STRICT_RENEW = 'PLY_APP_STRICT_RENEW_SCENE';       // 续保（严格意义)
export const SCENE_PAY_CONFIRM_INFO_REGISTER = 'PAY_CONFIRM_INFO_REGISTER_SCENE';             // 缴费信息登记

export const APP_TYP_PLY = 'A';     // 申请单类型为投保单
export const APP_TYP_EDR = 'E';     // 申请单类型为批改单

export const ENDORSE_TYPE_CANCEL = '2'; // 批改类型 - 注销
export const ENDORSE_TYPE_SURRENDER = '3'; // 批改类型 - 退保

export const SCENE_OPEN_ADD = 'OPEN_ADD';                   // 开口保单新增（包含批改）
export const SCENE_OPEN_EDIT = 'OPEN_EDIT';                 // 开口保单修改（包含批改）
export const SCENE_OPEN_AUDIT = 'OPEN_AUDIT';               // 开口保单审核（包含批改）
export const SCENE_OPEN_DETAIL = 'OPEN_DETAIL';              // 开口保单只读（包含批改）
export const SCENE_OPEN_DETAIL_POLICY = 'OPEN_DETAIL_POLICY';              // 开口保单只读（在小保单中查看场景）

export const ADD_UNDR_RULES = 'ADD_UNDR_RULES';                   // 新增核保等级规则 -- 配置
export const LOOK_UNDR_RULES = 'LOOK_UNDR_RULES';                   // 核保等级规则 -- 查看
export const UPDATE_UNDR_RULES = 'UPDATE_UNDR_RULES';                   // 核保等级规则 -- 修改
// 批改原因
export const DEFERRED_CORRECTION = '95'; // 延期批改
export const DEFERRED_CORRECTION_92 = '92'; // 通用批改




/**
 * 各Tab页名称声明
 */
export const BASE = 'Base'; // 基本信息
export const APPLICANT = 'Applicant'; // 投保人
export const INSURED = 'Insured'; // 被保人
export const BNFC = 'Bnfc'; // 身故受益人
export const ACCTINFO = 'Acctinfo'; // 账户信息
export const PROPOSER = 'Proposer'; // 申请人信息
export const RESPONDENT = 'Respondent'; // 被申请人信息
export const BASEBEFORE = 'BaseBefore'; // 保险期限
export const ENTTGT = 'EntTgt'; // 标的信息
export const ENTTGTOBJ = 'EntTgtObj'; // 财产险：标的清单信息
export const PRJREL = 'PrjRel'; // 工程险：工程关系方
export const TGT = 'Tgt'; // 其他标的信息
export const CVRG = 'Cvrg'; // 险别信息
export const THLIABCVRG = 'ThliabCvrg'; // 第三者责任信息
export const ADDITIONALCVRG = 'AdditionalCvrg'; // 附加险信息
export const DEDUCTIBLEINFO = 'DeductibleInfo'; // 免赔信息
export const BASEAFTERINFO = 'BaseAfter'; // 承保基本信息
export const PAYINFO = 'Pay'; // 缴费计划
export const UNDERWRITE = 'UnderWrite'; // 核保信息
export const EDRBASE = 'EdrBase'; // 批改信息
export const EDRBEARERBASE = 'EdrBearerBase'; // 不记名补录批改信息
export const EDRITEM = 'EdrCmpItem'; // 核保信息
export const IMGIDX = 'ImgIdx'; // 影像信息
export const GRPMEMBER = 'GrpMember'; // 团单成员
export const CARGOTGT = 'CargoTgt'; // 货运险标的信息
export const CARGO = 'Cargo'; // 货运险
export const CARGOTRANSPORT = 'CargoTransport'; // 货运险交通工具信息
export const CARGOLOSSAGENT = 'CargoLossAgent'; // 货运险赔付及代理人信息
export const CARGOLIST = 'CargoList'; // 货运险清单信息
export const TGTOBJ = 'TgtObj'; // 雇员信息
export const VOUCHERLIST = 'VoucherList'; // 保险凭证
export const PLANCONFIG = 'PlanConfig'; // 配置方案录入信息
export const PLANINFO = 'PlanInfo'; // 方案信息
export const UNDROPNLIST = 'UndrOpnList'; // 核保信息
export const CIBASEINFO = 'CiBaseInfo'; // 我司联共保份额信息
export const CIINFO = 'Ci'; // 联共保信息
export const JIMAIN = 'JiMain'; // 联共保主协议信息
export const RISKQUST = 'RiskQust'; // 联共保主协议信息
export const RISKQUSTOBJ = 'RiskQustObj'; // 联共保主协议信息
// 开口保单
export const OPENBASE = 'OpenBase'; // 开口保单基本信息
export const OPENPAY = 'OpenPay'; // 开口保单付款信息
export const OPENPROD = 'OpenProd'; // 开口保单产品信息
export const OPENEDR = 'OpenEdr'; // 开口保单批改信息
export const OPENAUDIT = 'OpenAudit'; // 开口保单审核信息
export const OPERATOR = 'Operator'; // 经办员组件
/*-------------------------------------------------------分公司机构常量 begin--------------------------------------------*/
export const SUB_COM_DPT_REL_CDE_SH = '00;0231'; // 上海
export const SUB_COM_DPT_REL_CDE_TJ = '00;27'; // 天津
export const SUB_COM_DPT_REL_CDE_BJ = '00;02'; // 北京
export const SUB_COM_DPT_REL_CDE_NMG = '0215010000000'; // 内蒙古
export const SUB_COM_DPT_REL_CDE_GD = '00;09'; // 广东
export const SUB_COM_DPT_REL_CDE_DG = '00;79'; // 东莞
export const SUB_COM_DPT_REL_CDE_SC = '00;07'; // 四川
export const SUB_COM_DPT_REL_CDE_SM = '00;73'; // 厦门
export const SUB_COM_DPT_REL_CDE_NB = '00;01'; // 宁波
export const SUB_COM_DPT_REL_CDE_ZJ = '00;05'; // 浙江
export const SUB_COM_DPT_REL_CDE_SHX = '0214010000000'; // 山西
export const SUB_COM_DPT_REL_CDE_HB  = '0213010000000'; // 河北
export const SUB_COM_DPT_REL_CDE_LN  = '0221010000000'; // 辽宁
export const SUB_COM_DPT_REL_CDE_JX  = '0236010000000'; // 辽宁
export const SUB_COM_DPT_REL_CDE_ORG_GD = '0244010000000'; // 广东分公司代码
export const SUB_COM_DPT_REL_CDE_ORG_BJ = '0211010000000'; // 北京分公司
export const SUB_COM_DPT_REL_CDE_ORG_HBZX = '0298000000000'; // 航保中心
export const SUB_COM_DPT_PREFIX_BJ = '02110'; // 北京机构前缀
/*-------------------------------------------------------分公司机构常量 end--------------------------------------------*/
export const WATER_PRODS = '';  // 水险产品-(数据库初始化)
export const SALE_GROUP_PRODS = ''; // 水险集中产品-(数据库初始化)
export const SALE_GROUP_DPTS = '';


/*------------------------------------------------------折叠默认值--------------------------------------------*/
export const FOLD_NAME = '点击展开';  // 折叠默认值

// 第三方组合投保单在线签名的场景
export const COMBINATION_APP_CHECK = 'combination_app_check';   // 第三方审核
export const COMBINATION_APP_SUBMIT = 'combination_app_submit'; // 第三方申请

export const COMPLANCONFIG = 'CombinationPlanConfig'; // 配置组合方案录入信息
export const THREECVRG = 'ThreeCvrg'; // 第三者责任信息
export const FIXSPEC = 'FixSpec'; // 特约信息

export const VHL = 'Vhl'; // 车辆信息
export const VHLOWNER = 'VhlOwner'; // 车主信息
export const VSTAX = 'Vstax'; // 车船税信息
export const JQPRMCOEF = 'JqPrmcoef'; // 交强险系数信息
export const SYPRMCOEF = 'SyPrmcoef'; // 商业险系数信息
export const JQSPECLA = 'JqSpecla'; // 交强险特别约定信息
export const SYSPECLA = 'SySpecla'; // 商业险特别约定信息
// export const GRPMEMBER = 'GrpMember';


/**
 * 所有tab名称集合
 * @type {string[]}
 */
export const TAB_NAME_ARRAY = [BASE, APPLICANT, INSURED, BNFC, ACCTINFO, PROPOSER, RESPONDENT, BASEBEFORE, ENTTGT, RISKQUST, RISKQUSTOBJ, ENTTGTOBJ, PRJREL, TGT, CVRG, ADDITIONALCVRG, DEDUCTIBLEINFO, BASEAFTERINFO, BASEAFTERINFO, PAYINFO, UNDERWRITE, CARGOTGT, CARGOTRANSPORT, CARGOLOSSAGENT, CARGOLIST, TGTOBJ, VOUCHERLIST, OPERATOR, CIINFO, CIBASEINFO, JIMAIN,THLIABCVRG];
/**
 * 投保
 * @type {string[]}
 */
export const APP_TAB_NAME_ARRAY = [BASE, APPLICANT, INSURED, BNFC, ACCTINFO, PROPOSER, RESPONDENT, BASEBEFORE, ENTTGT, RISKQUST, RISKQUSTOBJ, ENTTGTOBJ, PRJREL, TGT, CVRG, ADDITIONALCVRG, DEDUCTIBLEINFO, BASEAFTERINFO, BASEAFTERINFO, PAYINFO, CARGOTGT, CARGOTRANSPORT, CARGOLOSSAGENT, CARGOLIST, TGTOBJ, VOUCHERLIST, CIINFO, CIBASEINFO, JIMAIN, GRPMEMBER, OPERATOR,THLIABCVRG];
/**
 * 批改
 * @type {string[]}
 */
export const EDR_TAB_NAME_ARRAY = [EDRBASE, EDRBEARERBASE, EDRITEM, BASE, APPLICANT, INSURED, BNFC, ACCTINFO, PROPOSER, RESPONDENT, BASEBEFORE, ENTTGT, RISKQUST, RISKQUSTOBJ, ENTTGTOBJ, PRJREL, TGT, CVRG, ADDITIONALCVRG, DEDUCTIBLEINFO, BASEAFTERINFO, BASEAFTERINFO, PAYINFO, CARGOTGT, CARGOTRANSPORT, CARGOLOSSAGENT, CARGOLIST, TGTOBJ, VOUCHERLIST, GRPMEMBER, IMGIDX, CIINFO, CIBASEINFO, JIMAIN, OPERATOR,THLIABCVRG];
/**
 * 方案录单
 * @type {string[]}
 */
export const PLAN_TAB_NAME_ARRAY = [BASE, ENTTGT, ENTTGTOBJ, PRJREL, CVRG, ADDITIONALCVRG, BASEAFTERINFO, OPERATOR];
/**
 * 方案
 * @type {string[]}
 */
export const PLANINFO_TAB_NAME_ARRAY = [PLANCONFIG,PLANINFO,BASE, APPLICANT, INSURED, BNFC, ACCTINFO, PROPOSER, RESPONDENT, BASEBEFORE, ENTTGT, RISKQUST, RISKQUSTOBJ, ENTTGTOBJ, PRJREL, TGT, CVRG, ADDITIONALCVRG, DEDUCTIBLEINFO, BASEAFTERINFO, BASEAFTERINFO, PAYINFO, CARGOTGT, CARGOTRANSPORT, CARGOLOSSAGENT, CARGOLIST, TGTOBJ, VOUCHERLIST, CIINFO, CIBASEINFO, JIMAIN, GRPMEMBER, OPERATOR,THLIABCVRG];


/**
 * 车险组件
 * @type {string[]}
 */
export const VHL_APP_TAB_NAME_ARRAY = [VHL,VHLOWNER,VSTAX,JQPRMCOEF,SYPRMCOEF,JQSPECLA,SYSPECLA,BASE, APPLICANT, INSURED, BNFC, ACCTINFO, PROPOSER, RESPONDENT, BASEBEFORE, ENTTGT, RISKQUST, RISKQUSTOBJ, ENTTGTOBJ, PRJREL, TGT, CVRG, ADDITIONALCVRG, DEDUCTIBLEINFO, BASEAFTERINFO, BASEAFTERINFO, PAYINFO, CARGOTGT, CARGOTRANSPORT, CARGOLOSSAGENT, CARGOLIST, TGTOBJ, VOUCHERLIST, CIINFO, CIBASEINFO, JIMAIN, GRPMEMBER, OPERATOR,THLIABCVRG];

export const TAB_NAME = {
    BASE: 'Base',
    APPLICANT: 'Applicant',
    INSURED: 'Insured',
    BNFC: 'Bnfc',
    ACCTINFO: 'AcctInfo',
    PROPOSER: 'Proposer', // 申请人信息
    RESPONDENT: 'Respondent', // 被申请人信息
    BASEBEFORE: 'BaseBefore',
    ENTTGT: 'EntTgt',
    ENTTGTOBJ: 'EntTgtObj',
    PRJREL: 'PrjRel',
    TGT: 'Tgt',
    CVRG: 'Cvrg',
    ADDTIONALCVRG: 'AdditionalCvrg',
    DEDUCTIBLEINFO: 'DeductibleInfo',
    BASEAFTERINFO: 'BaseafterInfo',
    PAYINFO: 'PayInfo',
    UNDERWRITE: 'UnderWrite',
    CARGOTGT: 'CargoTgt',
    CARGOTRANSPORT: 'CargoTransport',
    CARGOLOSSAGENT: 'CargoLossAgent',
    CARGOLIST: 'CargoList',
    TGTOBJ: 'tgtObj', // 雇员信息
    VOUCHERLIST: 'VoucherList',
    OPERATOR: 'Operator', // 经办人
};

/* -----------------------场景常量 end--------------------------*/

/*
* 判断是否投保-编辑场景
*
*/
export function isPlyAppEditScene(scene: string) {
    if (scene === SCENE_PLY_APP_NEW                 // 投保-新增
        || scene === SCENE_PLY_APP_MODIFY_UNSUBMIT  // 投保－修改（未提核）
        || scene === SCENE_PLY_APP_MODIFY_BOUNCED   // 投保－修改（核保退回）
        || scene === SCENE_PLY_APP_REL              // 关联投保
        || scene === SCENE_PLY_APP_PKG_BLANK        // 套餐录入保单（空白）
        || scene === SCENE_PLY_APP_PKG_COPY         // 套餐录入保单（复制已录单）
        || scene === SCENE_PLY_APP_STRICT_RENEW     // 严格意义续保
        || scene === SCENE_PLAN_NEW                 // 创建方案
        || scene === SCENE_PLAN_UPDATE              // 修改方案
        || scene === SCENE_PLAN                     // 方案录单
        || scene === SCENE_PLY_ECARGO_READ         // ecargo电子报价单提交审核
    ) {
        return true;
    } else {
        return false;
    }
}

/*
* 判断是否批改-编辑场景
*/
export function isPlyEdrEditScene(scene: string) {
    if (scene === SCENE_EDR_APP_NEW                      // 批改申请-新增
        || scene === SCENE_PLY_APP_ADD_NORECORD
        || scene === SCENE_EDR_APP_MODIFY_UNSUBMIT  // 批改申请-修改（未提核
        || scene === SCENE_EDR_APP_MODIFY_BOUNCED   // 批改申请-修改（核保退回）
        || scene === SCENE_EDR_APP_MODIFY_BOUNCEDBEARER // 批改申请-修改（不记名补录核保退回）
        || scene === SCENE_TEMPORARY_DEPOSITBEARER   // 不记名补录-修改（未提核）
    ) {
        return true;
    } else {
        return false;
    }
}

/*
* 判断是否批改场景
*/
export function isPlyEdrScene(scene: string) {
    if (scene === SCENE_EDR_APP_NEW                      // 批改申请-新增
        || scene === SCENE_EDR_APP_MODIFY_UNSUBMIT  // 批改申请-修改（未提核
        || scene === SCENE_EDR_APP_MODIFY_BOUNCED   // 批改申请-修改（核保退回）
        || scene === SCENE_EDR_APP_READ   // 批改申请-查看申请的新保单
        || scene === SCENE_EDR_APP_ON_UW   // 批改申请－已提交核保
        || scene === SCENE_EDR_APP_MODIFY_BOUNCEDBEARER // 批改申请-修改（不记名补录核保退回）
        || scene === SCENE_TEMPORARY_DEPOSITBEARER   // 不记名补录-修改（未提核）
    ) {
        return true;
    } else {
        return false;
    }
}

/*
* 判断是否只读场景
*/
export function isReadScene(scene: string) {
    if (scene === SCENE_PLY_APP_READ                      // 投保－查看投保单
        || scene === SCENE_PLY_READ_LATEST           // 保单-查看最新记录
        || scene === SCENE_PLY_READ_PRIM             // 保单-查看原始记录
        || scene === SCENE_PLY_READ_SNAPSHOT         // 保单-查看历史记录
        || scene === SCENE_PLY_PRINTABLE             // 保单-可打印保单
        || scene === SCENE_EDR_APP_READ              // 批改申请-查看申请的新保单
        || scene === SCENE_PLY_UW_READ               // 核保-查看
        || scene === SCENE_PLY_APP_ON_UW             // 投保－已提交核保
        || scene === SCENE_EDR_APP_ON_UW             // 批改申请－已提交核保
        || scene === SCENE_PLY_QUERY_PRIM            // 保单-查看记录
        || scene === SCENE_PLY_APP_READBEARER        // 不记名补录查看投保单
        || scene === SCENE_OPEN_DETAIL               // 开口保单查看
    ) {
        return true;
    } else {
        return false;
    }
}

/*
* 判断是否编辑场景
*/
export function isEditScene(scene: string) {
    if (isPlyEdrEditScene(scene) || isPlyAppEditScene(scene) || isOcEditScene(scene)) {
        return true;
    } else {
        return false;
    }
}

/**
 * 判断是否显示健康告知按钮
 */
export function isShowHealthBtn(CProdNo: string) {
    if (CProdNo === '060002'
        || CProdNo === '063022'
        || CProdNo === '063023'
        || CProdNo === '063025'
        || CProdNo === '063031'
        || CProdNo === '063032'
        || CProdNo === '063033'
        || CProdNo === '063034'
        || CProdNo === '063035'
        || CProdNo === '063036'
        || CProdNo === '063037'
        || CProdNo === '063038'
        || CProdNo === '063040'
        || CProdNo === '063041'
        || CProdNo === '063042'
        || CProdNo === '069033'
        || CProdNo === '069900'
        || CProdNo === '069901'
        || CProdNo === '069902'
        || CProdNo === '069910'
        || CProdNo === '063043'
        || CProdNo === '200011'
        || CProdNo === '200024'
        || CProdNo === '060011'
        || CProdNo === '200010'
        || CProdNo === '200023'
        || CProdNo === '060015'
        || CProdNo === '200008'
        || CProdNo === '200009'
        || CProdNo === '060073') {
        return true;
    }else {
        return false;
    }
}


/**
 * 判断是否显示健康告知按钮
 */
export function isShowHealthMS(CProdNo: string) {
    if (CProdNo === '200011'
        || CProdNo === '200014'
        || CProdNo === '200015'
        || CProdNo === '200019'
        || CProdNo === '200020'
        || CProdNo === '200021'
        || CProdNo === '200024'
        || CProdNo === '200025'
  ) {
        return true;
    }else {
        return false;
    }
}

/*
* 判断录单机构是否为上海分公司的机构（包含上海分公司）
*/
export function isSHDpt(dptCde: string) {
    console.log('SUB_COM_DPT_REL_CDE_SH', SUB_COM_DPT_REL_CDE_SH.substring(3));
    console.log('subdptCde', dptCde.substring(0, 4) );

    if (dptCde.substring(0, 4) === SUB_COM_DPT_REL_CDE_SH.substring(3)) {
        return true;
    }else {
        return false;
    }
}

/*
* 判断开口保单是否编辑场景
*/
export function isOcEditScene(scene: string) {
    if (scene === SCENE_OPEN_EDIT                 // 开口保单修改（包含批改）
        || scene === SCENE_OPEN_ADD               // 开口保单新增（包含批改）
    ) {
        return true;
    } else {
        return false;
    }
}
