const ACTION_LABEL_MAP: Record<string, string> = {
  add: "新增",
  edit: "修改",
  copy: "复制",
  view: "查看",
  approve: "审核",
  planConfigAdd: "新增",
  planConfigupdate: "修改",
  planConfigCopy: "复制",
  planConfigview: "查看",
};

export function getActionLabel(type?: string) {
  if (!type) {
    return "";
  }
  return ACTION_LABEL_MAP[type] || "";
}

export function formatActionTitle(type: string | undefined, moduleName: string) {
  const action = getActionLabel(type);
  return action ? `${action}-${moduleName}` : moduleName;
}

