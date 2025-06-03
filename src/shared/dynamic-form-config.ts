
export interface dynamicFormMethod {
  getFromValue: () => any;
  setFormValue: (data: any, noupdate?: boolean) => void;
  validate: () => any;
  setValue: (key: any, value: any) => void;
  getValue: (key: any) => any;
  checkKey: (key: any) => boolean;
  clearValidate: () => any;
  resetFields: () => any;
}