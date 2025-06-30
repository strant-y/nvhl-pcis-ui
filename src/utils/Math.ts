/**
 * 加法运算，避免数据相加小数点后产生多位数和计算精度损失。
 */
export function numAdd(num1, num2) {
    let baseNum, baseNum1, baseNum2;
    try {
        baseNum1 = num1.toString().split('.')[1].length;
    } catch (e) {
        baseNum1 = 0;
    }
    try {
        baseNum2 = num2.toString().split('.')[1].length;
    } catch (e) {
        baseNum2 = 0;
    }
    baseNum = Math.pow(10, Math.max(baseNum1, baseNum2));
    return (numMulti(num1, baseNum) + numMulti(num2, baseNum)) / baseNum;
}
/**
 * 减法运算，避免数据相减小数点后产生多位数和计算精度损失。
 *
 * @param num1被减数  |  num2减数
 */
export function numSub(num1, num2) {
    let baseNum, baseNum1, baseNum2;
    let precision; // 精度
    try {
        baseNum1 = num1.toString().split('.')[1].length;
    } catch (e) {
        baseNum1 = 0;
    }
    try {
        baseNum2 = num2.toString().split('.')[1].length;
    } catch (e) {
        baseNum2 = 0;
    }
    baseNum = Math.pow(10, Math.max(baseNum1, baseNum2));
    precision = (baseNum1 >= baseNum2) ? baseNum1 : baseNum2;
    return ((numMulti(num1, baseNum) - numMulti(num2, baseNum)) / baseNum).toFixed(precision);
}
export function numSubp(num1, num2, precision) {
    let baseNum, baseNum1, baseNum2;
    try {
        baseNum1 = num1.toString().split('.')[1].length;
    } catch (e) {
        baseNum1 = 0;
    }
    try {
        baseNum2 = num2.toString().split('.')[1].length;
    } catch (e) {
        baseNum2 = 0;
    }
    baseNum = Math.pow(10, Math.max(baseNum1, baseNum2));
    if(!precision){
        precision = (baseNum1 >= baseNum2) ? baseNum1 : baseNum2;
    }
    return ((numMulti(num1, baseNum) - numMulti(num2, baseNum)) / baseNum).toFixed(precision);
}
/**
 * 乘法运算，避免数据相乘小数点后产生多位数和计算精度损失。
 *
 * @param num1被乘数 | num2乘数
 */
export function numMulti(num1, num2) {
    let baseNum = 0;
    try {
        baseNum += num1.toString().split('.')[1].length;
    } catch (e) {
    }
    try {
        baseNum += num2.toString().split('.')[1].length;
    } catch (e) {
    }
    return Number(num1.toString().replace('.', '')) * Number(num2.toString().replace('.', '')) / Math.pow(10, baseNum);
}

/**
 * 比较数字是否相等
 * @param num1
 * @param num2
 * @returns {boolean}
 */
export function numComparison(num1, num2) {
    return Number.parseFloat(num1) === Number.parseFloat(num2);
}

export function tool_fix(num, prec) {
    num = (Math.round(num * Math.pow(10, prec)) / Math.pow(10, prec)) + '';
    const index = num.indexOf('.');
    if (index !== -1) {
        const dgt = num.substring(index + 1);
        if (dgt.length < prec) {
            for (let i = 0; i < prec - dgt.length; i++) {
                num += '0';
            }
        }
    } else {
        num += '.';
        for (let i = 0; i < prec; i++) {
            num += '0';
        }
    }
    return num;
}
