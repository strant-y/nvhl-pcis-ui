import {JSEncrypt} from 'jsencrypt';
import {Md5} from 'ts-md5/dist/md5';
import { fromByteArray, toByteArray } from 'base64-js';

//公钥
const PUBLIC_KEY = 'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAKrSOXubY9bA9kRMmH8Yo3Bk1SxY52l/jkf8yDc8btyN0qUwErinFO8eESfBplpV+EUGNwZWGrDUZbMg+gVnm8kCAwEAAQ==';

const encryptByMD5 = (data: string): string => {
  const res = Md5.hashStr(data);
  return res.toString();
};
export const base64encoder = (Context): any => {
  return fromByteArray(new TextEncoder().encode(Context));
};
export const base64decoder = (Context): any => {
  return new TextDecoder().decode(toByteArray(Context));
};
export const encryptParameter = (Context) => {
  return base64encoder(Context);
};
export const encryptParameterRouter = (Context) => {
  return fromByteArray(new TextEncoder().encode(Context)).replaceAll('+','-');
};
export const descryptParameterRouter = (Context) => {
  return new TextDecoder().decode(toByteArray(Context.replaceAll('-','+')));
};

export const descryptParameter = (Context) => {
  return base64decoder(Context);
};
export const rsaEncoder = (Context): any => {
  const encrypt = new JSEncrypt();
  encrypt.setPublicKey(PUBLIC_KEY);
  return encrypt.encrypt(Context);
};

export const bodyEncrypt = (body: any)=> {
  // 统一加上编码
  let bodynew = {};
  if (!!body) {
    const encoder = encryptParameter(JSON.stringify(body));
    bodynew['sourceParameter'] = encoder;
    bodynew['sign'] = rsaEncoder(encryptByMD5(encoder));
  } else {
    bodynew = body;
  }
  return bodynew
};

/**
 * 请求参数加密
 * @param params
 */
export const reqParamsEncrypt = (params: any) => {
  let reqParams = {};
  if (!!params) {
    try {
      const parameterNew = {userSign: sessionStorage.getItem("token")};
      const keys = Object.keys(params);
      for (const i in keys) {
        parameterNew[keys[i]] = params[keys[i]];
      }
      // console.log('请求参数',parameterNew);
      const encoder = encryptParameter(JSON.stringify(parameterNew));
      reqParams = {
        sourceParameter: encoder,
        sign: rsaEncoder(encryptByMD5(encoder))
      };
    }catch (e) {
      console.error('-> reqParamsEncrypt is error！\n'+ e);
      throw e;
    }
  }
  return reqParams;
};





