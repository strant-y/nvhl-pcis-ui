// 不能复制的保单号列表
const cProdNoMap = [
  '341052504000000001',
  '341052504000000002',
  '341052504000000003',
  '341052504000000004',
  '341052504000000005'
]

export function cannotCopy(cPlyNo) {
  return cPlyNo ? cProdNoMap.includes(cPlyNo) : false;
}