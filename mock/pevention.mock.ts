import { defineMock } from "./base";

export default defineMock([
  {
    url: "prevention/page",
    method: ["GET"],
    body: {
      code: "00000",
      data: {
        list: [
          {
            institution: "总公司",
            keywords: "541012406000000355",
            name: "宏达建设工程公司",
            status: "待处理",
            apptime: "2024-02-23 14:43:54",
          },
          {
            institution: "北京分公司",
            keywords: "534012406000000028",
            name: "今博建设工程公司",
            status: "已完成",
            apptime: "2023-12-25 16:38:54",
          },
          {
            institution: "上海分公司",
            keywords: "533082406000000004",
            name: "创安建设工程公司",
            status: "暂存",
            apptime: "2023-03-05 09:09:54",
          },
          {
            institution: "陕西分公司",
            keywords: "531012306000102303",
            name: "公明建设工程公司",
            status: "暂存",
            apptime: "2024-03-02 20:39:44",
          },
          {
            institution: "总公司",
            keywords: "534012306000000412",
            name: "天帅装饰建设工程公司",
            status: "待审核",
            apptime: "2023-03-25 12:39:54",
          },
          {
            institution: "上海分公司",
            keywords: "561082406000000004",
            name: "天帅装饰建设工程公司",
            status: "已完成",
            apptime: "2024-02-21 15:29:12",
          },
          {
            institution: "北京分公司",
            keywords: "515012206000000146",
            name: "宏凯建设工程公司",
            status: "退回待处理",
            apptime: "2023-11-25 15:43:34",
          },
        ],
        total: 10,
      },
      msg: "一切ok",
    },
  },
  {
    url: "examine/page",
    method: ["GET"],
    body: {
      code: "00000",
      data: {
        list: [
          {
            institution: "总公司",
            keywords: "541012406000000355",
            name: "宏达建设工程公司",
            status: "待审核",
            apptime: "2024-02-23 14:43:54",
          },
          {
            institution: "北京分公司",
            keywords: "534012406000000028",
            name: "今博建设工程公司",
            status: "完成",
            apptime: "2023-12-25 16:38:54",
          },
          {
            institution: "上海分公司",
            keywords: "533082406000000004",
            name: "创安建设工程公司",
            status: "已上报",
            apptime: "2023-03-05 09:09:54",
          },
        ],
        total: 10,
      },
      msg: "一切ok",
    },
  },

  {
    url: "assets/page",
    method: ["GET"],
    body: {
      code: "00000",
      data: {
        list: [
          {
            partnerNme: "3D打印机",
            partnerId: "ZC0001",
            partType: "电器",
            professional: "是",
            projectType: "否",
            status: 1,
            other: "遇水易损",
          },
          {
            partnerNme: "交换机",
            partnerId: "ZC0231",
            partType: "电器",
            professional: "是",
            projectType: "是",
            status: 0,
            other: "遇水易损",
          },
          {
            partnerNme: "机器人",
            partnerId: "ZC0043",
            partType: "智能家居",
            professional: "是",
            projectType: "是",
            status: 1,
            other: "远离火源",
          },
        ],
        total: 10,
      },
      msg: "一切ok",
    },
  },
  {
    url: "assets/:idNo/form",
    method: ["GET"],
    body: ({ params }) => {
      const formData = {
        partnerNme: "机器人",
        partnerId: "ZC0043",
        partType: "智能家居",
        professional: "是",
        projectType: "是",
        status: 1,
        other: "远离火源",
      };
      return {
        code: "00000",
        data: formData,
        msg: "SUCCESS",
      };
    },
  },
  {
    url: "rectify/page",
    method: ["GET"],
    body: {
      code: "00000",
      data: {
        list: [
          {
            partnerNme: "生产线设备震动、有异响",
            partnerId: "设备维护保养正常运转",
            partnercde: "重大风险",
            timeDate: "三天内",
          },
          {
            partnerNme: "仓库货物堆积过高",
            partnerId: "分类储存、合理高度",
            partnercde: "一般风险",
            timeDate: "一周内",
          },
          {
            partnerNme: "电缆老化开裂",
            partnerId: "跟换电缆",
            partnercde: "轻微风险",
            timeDate: "两周",
          },
        ],
        total: 10,
      },
      msg: "一切ok",
    },
  },
  {
    url: "rectify/:idNo/form",
    method: ["GET"],
    body: ({ params }) => {
      const formData = {
        partnerNme: "生产线设备震动、有异响",
        partnerId: "设备维护保养正常运转",
        partnercde: "重大风险",
        timeDate: "三天内",
      };
      return {
        code: "00000",
        data: formData,
        msg: "SUCCESS",
      };
    },
  },
  {
    url: "task/page",
    method: ["GET"],
    body: {
      code: "00000",
      data: {
        list: [
          {
            keywords: "512012306000000055",
            partner: "北京分公司",
            name: "天帅装饰建设工程公司",
            status: "待处理",
            apptime: "2024-02-23 14:43:54",
          },
          {
            keywords: "537022306000000306",
            partner: "上海分公司",
            name: "今博建设工程公司",
            status: "已完成",
            apptime: "2023-03-05 09:09:54",
          },
          {
            keywords: "533012206000006982",
            partner: "总公司",
            name: "公明建设工程公司",
            status: "退回",
            apptime: "2024-03-02 20:39:44",
          },
        ],
        total: 3,
      },
      msg: "一切ok",
    },
  },
  {
    url: "taskUnd/page",
    method: ["GET"],
    body: {
      code: "00000",
      data: {
        list: [
          {
            keywords: "512012306000000055",
            dptnme: "北京分公司",
            insurednme: "徐三",
            plyno:'20000000060021130000004',
            status: "待处理",
            issuetime: "2024-02-23 14:43:54",
            insrncbgntime: "2024-02-23 00:00:00",
            insrncendtime: "2025-02-23 23:59:59",
            sendworktime: "2024-02-23 14:45:00",
          },
          {
            keywords: "512012306000000055",
            dptnme: "陕西分公司",
            insurednme: "王琳",
            plyno:'602110106202120190000001',
            status: "待处理",
            issuetime: "2024-02-25 12:53:12",
            insrncbgntime: "2024-02-25 00:00:00",
            insrncendtime: "2025-02-25 23:59:59",
            sendworktime: "2024-02-23 12:54:00",
          },
        ],
        total: 2,
      },
      msg: "一切ok",
    },
  },
  {
    url: "rectifyList/page",
    method: ["GET"],
    body: {
      code: "00000",
      data: {
        list: [
          {
            keywords: "512012306000000055",
            partner: "天帅装饰建设工程公司",
            name: "德泰公估",
            status: "待处理",
            apptime: "2024-02-23 14:43:54",
          },
          {
            keywords: "537022306000000306",
            partner: "今博建设工程公司",
            name: "精卓管理",
            status: "已完成",
            apptime: "2023-03-05 09:09:54",
          },
        ],
        total: 3,
      },
      msg: "一切ok",
    },
  },
  {
    url: "fee/page",
    method: ["GET"],
    body: {
      code: "00000",
      data: {
        list: [
          {
            partnerNme: "安责险技术机构",
            partnerId: "1530",
            partnercde: "安全风险辨识评估评价",
            remark: "针对车间5S规范作业",
            partnername: "张三",
            partnertel: "12523458765",
          },
          {
            partnerNme: "德泰公估",
            partnerId: "3200",
            partnercde: "生产安全事故隐患排查",
            remark: "机器设备运转检查",
            partnername: "李四	",
            partnertel: "13627659853",
          },
        ],
        total: 2,
      },
      msg: "一切ok",
    },
  },
  {
    url: "fee/:idNo/form",
    method: ["GET"],
    body: ({ params }) => {
      const formData = {
        partnerNme: "安责险技术机构",
        partnerId: "1530",
        partnercde: "安全风险辨识评估评价",
        remark: "针对车间5S规范作业",
        partnername: "张三",
        partnertel: "12523458765",
      };
      return {
        code: "00000",
        data: formData,
        msg: "SUCCESS",
      };
    },
  },
  {
    url: "precautionary/page",
    method: ["GET"],
    body: {
      code: "00000",
      data: {
        list: [
          {
            keywords: "2024",
            partner: "北京分公司",
            name: "5500000",
            status: "53525",
            apptime: "124234",
          },
          {
            keywords: "2023",
            partner: "上海分公司",
            name: "6500000",
            status: "5334",
            apptime: "2423423",
          },
          {
            keywords: "2024",
            partner: "陕西分公司",
            name: "350000",
            status: "23432",
            apptime: "567543",
          },
        ],
        total: 3,
      },
      msg: "一切ok",
    },
  },
  {
    url: "precautionary/from",
    method: ["GET"],
    body: ({ params }) => {
      const formData = {
        keywords: "2024",
        partner: "陕西分公司",
        name: "350000",
        status: "23432",
        apptime: "567543",
      };
      return {
        code: "00000",
        data: formData,
        msg: "SUCCESS",
      };
    },
  },
  {
    url: "platform/page",
    method: ["GET"],
    body: {
      code: "00000",
      data: {
        list: [
          {
            expert: "北京安责险信息管理系统",
            institution: "陕西分公司",
            keywords: "533012406000000569",
            name: "宏达建设工程公司",
            status: "上传成功",
            apptime: "2024-02-23 14:43:54",
            partner: "成功",
          },
          {
            expert: "河北安全生产责任保险信息管理系统",
            institution: "北京分公司",
            keywords: "534012406000000028",
            name: "今博建设工程公司",
            status: "待上传",
            apptime: "2023-12-25 16:38:54",
          },
          {
            expert: "桂建金平台",
            institution: "上海分公司",
            keywords: "533082406000000004",
            name: "创安建设工程公司",
            status: "上传失败",
            apptime: "2023-03-05 09:09:54",
            partner: "缺少必要字段:投保人姓名",
          },
        ],
        total: 10,
      },
      msg: "一切ok",
    },
  },
]);
