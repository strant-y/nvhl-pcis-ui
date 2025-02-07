
export interface TaskQuery extends PageQuery {
  tissuetm?: string;
  flowState?: string;
  flowName?: string;
  cPlyNo?: string;
  cSafetyNo?: string;
  cDptCde?: string;
  cAppNo?: string;
  queryType?: string;
  cCertfCde?: string;
  cInsuredNme?: string;
  cPartnerCde?: string;
}


export interface TaskPageVO {
  tissuetm?: string;
  flowState?: string;
  cPlyNo?: string;
  cSafetyNo?: string;
  cDptCde?: string;
  cAppNo?: string;
}

export interface TaskFrom {
  tissuetm?: string;
  flowState?: string;
  cPlyNo?: string;
  cSafetyNo?: string;
  cDptCde?: string;
  cAppNo?: string;
}


export type TaskPageResult = PageResult<TaskPageVO[]>;
