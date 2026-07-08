export function createCopyData<T>(row: T, clearKeys: string[] = []): T {
  const data = JSON.parse(JSON.stringify(row ?? null)) as T;
  if (Array.isArray(data)) {
    return data.map((item) => createCopyData(item, clearKeys)) as T;
  }
  if (!data || typeof data !== "object") {
    return data;
  }
  const keys = new Set<string>([
    "id",
    "Id",
    "uuid",
    "UUID",
    "configId",
    "prodId",
    "versionId",
    "cPkId",
    ...clearKeys,
  ]);
  keys.forEach((k) => {
    if (k in data) {
      delete (data as any)[k];
    }
  });
  Object.keys(data as Record<string, any>).forEach((key) => {
    (data as Record<string, any>)[key] = createCopyData(
      (data as Record<string, any>)[key],
      clearKeys
    );
  });
  return data;
}
