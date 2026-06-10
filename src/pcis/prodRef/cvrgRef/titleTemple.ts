const prodTemple = ref<{ [key: string] : string }>(
    {
        default:'投保人数:{sumObjs}人  总保费:{sumPrm}',
        allPrm:'总保费:{sumPrm}'
    }
);

const deductibleTemple = ref<{ [key: string] : string }>(
    {
        '10':'除另有约定外，本保险合同{suitScop}的每次事故绝对免赔额为人民币{amount}元。',
        '01':'除另有约定外，本保险合同{suitScop}的每次事故绝对免赔率为损失金额的{rate}%。',
        '11':'除另有约定外，本保险合同{suitScop}的每次事故绝对免赔额为人民币{amount}元或损失金额的{rate}%，两者以高者为准。',
    }
);

const deductibleKey = ref<{ [key: string] : string }>(
    {
        'defterm':{amt:'Term.nDeductibleAmount',rate:'Term.nDeductibleRate',deduct:'Term.cDeductibleNote'},

        '040178':{amt:'TermRisktgt.nAccidentDeduct',rate:'TermRisktgt.nAccidentDeductrate',deduct:'TermRisktgt.cDeductibleNote'},
        '040171':{amt:'TermRisktgt.nAccidentDeduct',rate:'TermRisktgt.nAccidentDeductrate',deduct:'TermRisktgt.cDeductibleNote'},
        '040173':{amt:'TermRisktgt.nDeductibleAmount',rate:'TermRisktgt.nDeductibleRate',deduct:'TermRisktgt.cDeductibleNote'},
        '040174':{amt:'TermRisktgt.nDeductibleAmount',rate:'TermRisktgt.nDeductibleRate',deduct:'TermRisktgt.cDeductibleNote'},
        '040175':{amt:'TermRisktgt.nDeductibleAmount',rate:'TermRisktgt.nDeductibleRate',deduct:'TermRisktgt.cDeductibleNote'},
        '040177':{amt:'TermRisktgt.nDeductibleAmount',rate:'TermRisktgt.nDeductibleRate',deduct:'TermRisktgt.cDeductibleNote'},
        '040179':{amt:'TermRisktgt.nPersonDeduct',rate:'TermRisktgt.nPersonDeductrate',deduct:'TermRisktgt.cDeductibleNote'},
        '040172':{amt:'TermRisktgt.nPersonDeduct',rate:'TermRisktgt.nPersonDeductrate',deduct:'TermRisktgt.cDeductibleNote'},
        '040176':{amt:'TermRisktgt.nPersonDeduct',rate:'TermRisktgt.nPersonDeductrate',deduct:'TermRisktgt.cDeductibleNote'},

        'defrisk':{amt:'TermRisktgt.nDeductibleAmount',rate:'TermRisktgt.nDeductibleRate',deduct:'TermRisktgt.cDeductibleNote'},
    }
);


export function fillTemplate(
  template: string,
  params: { [key: string]: any }
): string {
    return template.replace(/{(\w+)}/g, (match, key) => {
        // 如果参数存在且不为空，使用该值
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
            return params[key];
        }

        // 特殊处理：suitScop 为空时使用默认值
        if (key === 'suitScop') {
            return '';
        }

        // 其他情况保持原样（保留占位符）
        return match;
    });
}

export {
    prodTemple,
    deductibleTemple,
    deductibleKey
}

