export interface AssetsQuery extends PageQuery {
  partnerNme?: string;

  partnerId?: string;

  partType?: string;

  professional?: string;

  projectType?: string;

  status?: number;

  other?: string;
}

export interface AssetsPageVO {
  partnerNme?: string;

  partnerId?: string;

  partType?: string;

  professional?: string;

  projectType?: string;

  status?: number;

  other?: string;
}

export type AssetsPageResult = PageResult<AssetsPageVO[]>;

export interface AssetsForm {
  partnerNme?: string;

  partnerId?: string;

  partType?: string;

  professional?: string;

  projectType?: string;

  status?: number;

  other?: string;
}
