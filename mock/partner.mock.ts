import { defineMock } from "./base";

export default defineMock([
  {
    url: "partners/me",
    method: ["GET"],
    body: {
      code: "00000",
      data: {
        userId: 2,
        nickname: "系统管理员",
        username: "admin",
        perms: [
          "sys:menu:delete",
          "sys:dept:edit",
          "sys:dict_type:add",
          "sys:dict:edit",
          "sys:dict:delete",
          "sys:dict_type:edit",
          "sys:menu:add",
          "sys:user:add",
          "sys:role:edit",
          "sys:dept:delete",
          "sys:user:edit",
          "sys:user:delete",
          "sys:user:reset_pwd",
          "sys:dept:add",
          "sys:role:delete",
          "sys:dict_type:delete",
          "sys:menu:edit",
          "sys:dict:add",
          "sys:role:add",
        ],
      },
      msg: "SUCCESS",
    },
  },

  {
    url: "partners/page",
    method: ["GET"],
    body: {
      code: "00000",
      data: {
        list: [
          {
            partnerId: 1,
            partnerNme: "德泰公估",
            partType: "合作商",
            idType: "其他",
            idNo: "12345487987",
            pratnerAddress: "陕西西安",
            professional: "防火",
            projectType: "生产安全",
            servicePrice: 12300.0,
            protocol: "XY020240305001",
            protocolStart: "2023-03-01",
            protocolEnd: "2035-01-24",
            mobile: "13365848547",
            status: "1",
          },
          {
            partnerId: 2,
            partnerNme: "北京水粉",
            partType: "合作商",
            idType: "其他",
            idNo: "98745545",
            pratnerAddress: "北京顺义",
            professional: "防盗",
            projectType: "安全风险评估",
            servicePrice: 10000.0,
            protocol: "XY020240305002",
            protocolStart: "2023-01-01",
            protocolEnd: "2035-01-01",
            mobile: "13365848547",
            status: "1",
          },
        ],
        total: 3,
      },
      msg: "SUCCESS",
    },
  },
  {
    url: "partners/:parterId/form",
    method: ["GET"],
    body: ({ params }) => {
      const parterId = params.parterId;
      let formData = null;
      if (parterId == 1) {
        formData = {
          partnerId: 1,
          partnerNme: "德泰公估",
          partType: "合作商",
          idType: "其他",
          idNo: "12345487987",
          pratnerAddress: "陕西西安",
          professional: "防火",
          projectType: "1",
          servicePrice: 12300.0,
          protocol: "XY020240305001",
          protocolStart: "2023-03-01",
          protocolEnd: "2035-01-24",
          mobile: "13365848547",
          status: "1",
        };
      } else if (parterId == 2) {
        formData = {
          partnerId: 2,
          partnerNme: "北京水粉",
          partType: "合作商",
          idType: "组织信用代码",
          idNo: "9874554432435",
          pratnerAddress: "北京朝阳",
          professional: "防盗",
          projectType: "2",
          servicePrice: 10000.0,
          protocol: "XY020240305002",
          protocolStart: "2023-01-01",
          protocolEnd: "2035-01-01",
          mobile: "13365848547",
          status: "1",
        };
      }

      return {
        code: "00000",
        data: formData,
        msg: "SUCCESS",
      };
    },
  },
  {
    url: "partners",
    method: ["POST"],
    body: {
      code: "00000",
      data: {
        msg: "OK",
      },
      msg: "SUCCESS",
    },
  },
  {
    url: "partners/:parterId",
    method: ["PUT"],
    body: {
      code: "00000",
      data: {
        msg: "OK",
      },
      msg: "SUCCESS",
    },
  },
  {
    url: "partners/:parterId",
    method: ["DELETE"],
    body: {
      code: "00000",
      data: {
        msg: "OK",
      },
      msg: "SUCCESS",
    },
  },
  {
    url: "expert/page",
    method: ["GET"],
    body: {
      code: "00000",
      data: {
        list: [
          {
            partnerId: 1,
            partnerNme: "张三",
            partType: "精卓管理",
            idType: "身份证",
            idNo: "6329328392189328",
            pratnerAddress: "陕西西安",
            protocol: "1",
            professional: "男",
            projectType: "生产安全实付隐患排查",
            servicePrice: 35,
            mobile: "13365848547",
            status: "1",
          },
          {
            partnerId: 2,
            partnerNme: "李四",
            partType: "德泰公估",
            idType: "身份证",
            idNo: "5233907092374923",
            pratnerAddress: "北京顺义",
            protocol: "2",
            professional: "女",
            projectType: "安全风险辨识评估评价",
            servicePrice: 28,
            mobile: "13365848547",
            status: "1",
          },
        ],
        total: 3,
      },
      msg: "SUCCESS",
    },
  },
  {
    url: "expert/:parterId/form",
    method: ["GET"],
    body: ({ params }) => {
      const formData = {
        partnerId: 1,
        partnerNme: "张三",
        partType: "2",
        idType: "身份证",
        idNo: "6329328392189328",
        pratnerAddress: "陕西西安",
        protocol: "1",
        professional: "男",
        projectType: "生产安全实付隐患排查",
        servicePrice: 35,
        mobile: "13365848547",
        status: "1",
      };
      return {
        code: "00000",
        data: formData,
        msg: "SUCCESS",
      };
    },
  },
]);
