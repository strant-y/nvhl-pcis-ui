// 港口
const productListA  = ref<string[]>(
    ['020001','020002','020005','020009']
);
//机场
const productListB  = ref<string[]>(
    ['020003','020007','020011']
);
//都可以
const productListC  = ref<string[]>(
    ['020004']
);

// 诚信声明默认值
const cIntegrityStatementData = ref<string>(
	`致：***法院

    永安财产保险股份有限公司****分公司（以下简称我司），为申请人***（证件号码***）与被申请人***（证件号码***）因***一案，向法院提出财产保全申请，该笔保单保函所承担的保障金额不超过我司注册资本金的40%。如有虚假或隐瞒，我司自愿承担一切法律责任。


    特此声明。`
);

// 047002保函类别预定义映射关系（建议放在方法外部或作为常量）
const guaranteeTypeMap = {
  'BL_047002_01': ['Bh1cResv1', 'Bh1cResv2', 'Bh1cResv4'],
  'BL_047002_02': ['Bh2cResv1', 'Bh2cResv2', 'Bh2cResv4'],
  'BL_047002_03': ['Bh3cResv1', 'Bh3cResv2', 'Bh3cResv4'],
  'BL_047002_04': ['Bh4cResv1', 'Bh4cResv2', 'Bh4cResv4'],
  'BL_047002_05': ['Bh5cResv1', 'Bh5cResv2', 'Bh5cResv4']
};
export {
    productListA,
    productListB,
		productListC,
		cIntegrityStatementData,
		guaranteeTypeMap
}