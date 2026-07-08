export interface PreventionQuery extends PageQuery {
  cDptCde?: string;
  cSafetyNo?: string;
  name?: string;
  expert?: string;
  status?: string[] | string;
}

export interface PreventionPageVO {
  expert?: string;
  institution?: string;
  keywords?: string;
  name?: string;
  status?: string;
  partner?: string;
}

