export interface ApiResult<T = any> {
  code: number;
  msg: string;
  data: T;
  total?: number;
  res?: T;
}
