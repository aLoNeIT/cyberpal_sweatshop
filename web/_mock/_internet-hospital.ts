import { MockRequest } from '@delon/mock';

const ok = (data: any = null, msg: any = 'success') => ({ state: 0, msg, data });

const page = (curr: number, num: number, count: number) => ({ curr, num, count });

const functionButton = (menuCode: string, suffix: string, name: string, style: number, sort: number, type = 'default') => ({
  id: Number(`${menuCode.replace('MN', '')}${suffix}`),
  code: `${menuCode.replace('MN', 'FN')}${suffix}`,
  menu_code: menuCode,
  name,
  app_type: 2,
  state: 1,
  style,
  sort,
  css: '',
  type
});

const crudFunctions = (menuCode: string) => ({
  [`${menuCode.replace('MN', 'FN')}01`]: functionButton(menuCode, '01', '刷新', 1, 1),
  [`${menuCode.replace('MN', 'FN')}02`]: functionButton(menuCode, '02', '新增', 1, 2, 'primary'),
  [`${menuCode.replace('MN', 'FN')}03`]: functionButton(menuCode, '03', '编辑', 2, 3),
  [`${menuCode.replace('MN', 'FN')}04`]: functionButton(menuCode, '04', '删除', 2, 4),
  [`${menuCode.replace('MN', 'FN')}05`]: functionButton(menuCode, '05', '详情', 2, 5)
});

let dictItemId = 930100;
const dictItem = (dict: number, fieldname: string, name: string, options: Record<string, any> = {}) => ({
  id: dictItemId++,
  dict,
  name,
  fieldname,
  type: 8 === options['type'] ? 8 : options['type'] || 0,
  subtype: options['subtype'] || 0,
  max: options['max'] ?? 100,
  min: options['min'] ?? 0,
  pk: options['pk'] || 0,
  autoed: options['autoed'] || 0,
  pwded: 0,
  regex: '',
  regex_msg: '',
  unit: options['unit'] || '',
  show_width: options['show_width'] ?? 120,
  sort: options['sort'] ?? 0,
  fuzzy: options['fuzzy'] || 0,
  key_dict: 0,
  key_table: '',
  key_field: '',
  key_show: '',
  key_join_name: '',
  key_join_type: '',
  key_condition: '',
  key_visibled: 0,
  key_width: 0,
  key_height: 0,
  link_dict: 0,
  link_table: '',
  link_field: '',
  show_dict: 0,
  show_table: '',
  show_field: '',
  default: options['default'] ?? '',
  required: options['required'] ?? 0,
  inputed: options['inputed'] ?? 14,
  input_width: options['input_width'] ?? 250,
  show_order: options['show_order'] ?? 0,
  curd: options['curd'] ?? 15,
  group: '',
  select: options['select'] || '',
  filtered: options['filtered'] || 0,
  readonly: options['readonly'] || 0
});

const createDict = (id: number, name: string, tablename: string, fields: Record<string, any>) => ({
  id,
  name,
  tablename,
  sub: '',
  prefix: '',
  dict_item: fields
});

const hospitalCrudDicts: Record<number, any> = {
  9301: createDict(9301, '科室管理', 'hospital_department', {
    id: dictItem(9301, 'id', 'ID', { type: 1, pk: 1, autoed: 1, show_width: 70, inputed: 0, readonly: 15 }),
    department_name: dictItem(9301, 'department_name', '科室名称', { required: 14, filtered: 1, fuzzy: 4, show_width: 160 }),
    department_code: dictItem(9301, 'department_code', '科室编码', { required: 14, filtered: 1, fuzzy: 4, show_width: 120 }),
    parent_name: dictItem(9301, 'parent_name', '上级科室', { show_width: 120 }),
    department_type: dictItem(9301, 'department_type', '科室类型', {
      type: 1,
      select: '1-临床科室;2-医技科室;3-互联网科室',
      required: 14,
      filtered: 1,
      show_width: 120
    }),
    inquiry_enabled: dictItem(9301, 'inquiry_enabled', '线上问诊', {
      type: 7,
      select: '0-关闭;1-开启',
      required: 14,
      filtered: 1,
      default: 1,
      show_width: 100
    }),
    sort_no: dictItem(9301, 'sort_no', '排序', { type: 1, required: 14, default: 1, show_width: 80 }),
    status: dictItem(9301, 'status', '状态', {
      type: 1,
      select: '1-启用;0-停用',
      required: 14,
      filtered: 1,
      default: 1,
      show_width: 90
    }),
    remark: dictItem(9301, 'remark', '科室简介', { type: 8, max: 500, show_width: 220, filtered: 0 })
  }),
  9302: createDict(9302, '员工管理', 'hospital_employee', {
    id: dictItem(9302, 'id', 'ID', { type: 1, pk: 1, autoed: 1, show_width: 70, inputed: 0, readonly: 15 }),
    realname: dictItem(9302, 'realname', '姓名', { required: 14, filtered: 1, fuzzy: 4, show_width: 120 }),
    mobile: dictItem(9302, 'mobile', '手机号', { required: 14, filtered: 1, fuzzy: 4, show_width: 140 }),
    role_name: dictItem(9302, 'role_name', '角色', {
      select: '医生-医生;药师-药师;管理员-管理员',
      required: 14,
      filtered: 1,
      show_width: 110
    }),
    department_name: dictItem(9302, 'department_name', '所属科室', { required: 14, filtered: 1, fuzzy: 4, show_width: 140 }),
    title_name: dictItem(9302, 'title_name', '职称', { show_width: 130 }),
    job_no: dictItem(9302, 'job_no', '工号', { filtered: 1, fuzzy: 4, show_width: 120 }),
    ca_status: dictItem(9302, 'ca_status', '实名认证', {
      type: 1,
      select: '0-未认证;1-已认证;2-认证失败',
      filtered: 1,
      default: 0,
      show_width: 110
    }),
    status: dictItem(9302, 'status', '状态', {
      type: 1,
      select: '1-启用;0-停用',
      required: 14,
      filtered: 1,
      default: 1,
      show_width: 90
    }),
    remark: dictItem(9302, 'remark', '备注', { type: 8, max: 300, show_width: 160 })
  }),
  9303: createDict(9303, '处方模版', 'hospital_prescription_template', {
    id: dictItem(9303, 'id', 'ID', { type: 1, pk: 1, autoed: 1, show_width: 70, inputed: 0, readonly: 15 }),
    template_name: dictItem(9303, 'template_name', '模版名称', { required: 14, filtered: 1, fuzzy: 4, show_width: 180 }),
    template_type: dictItem(9303, 'template_type', '模版类型', {
      type: 1,
      select: '1-西药处方;2-中药处方;3-病历模版',
      required: 14,
      filtered: 1,
      show_width: 120
    }),
    apply_scope: dictItem(9303, 'apply_scope', '适用范围', { show_width: 180 }),
    sign_scene: dictItem(9303, 'sign_scene', '签章场景', { show_width: 160 }),
    version_no: dictItem(9303, 'version_no', '版本号', { required: 14, default: 'V1.0', show_width: 100 }),
    status: dictItem(9303, 'status', '状态', {
      type: 1,
      select: '1-启用;0-停用',
      required: 14,
      filtered: 1,
      default: 1,
      show_width: 90
    }),
    remark: dictItem(9303, 'remark', '模版说明', { type: 8, max: 500, show_width: 220 })
  }),
  9304: createDict(9304, '协议管理', 'hospital_agreement', {
    id: dictItem(9304, 'id', 'ID', { type: 1, pk: 1, autoed: 1, show_width: 70, inputed: 0, readonly: 15 }),
    agreement_name: dictItem(9304, 'agreement_name', '协议名称', { required: 14, filtered: 1, fuzzy: 4, show_width: 200 }),
    agreement_type: dictItem(9304, 'agreement_type', '协议类型', {
      type: 1,
      select: '1-用户协议;2-隐私协议;3-医疗服务协议;4-处方签署协议',
      required: 14,
      filtered: 1,
      show_width: 140
    }),
    sign_subject: dictItem(9304, 'sign_subject', '签署主体', { required: 14, show_width: 140 }),
    version_no: dictItem(9304, 'version_no', '版本号', { required: 14, default: 'V1.0', show_width: 100 }),
    effective_date: dictItem(9304, 'effective_date', '生效日期', { show_width: 120 }),
    status: dictItem(9304, 'status', '状态', {
      type: 1,
      select: '1-启用;0-停用',
      required: 14,
      filtered: 1,
      default: 1,
      show_width: 90
    }),
    content_summary: dictItem(9304, 'content_summary', '协议摘要', { type: 8, max: 800, show_width: 240 })
  }),
  1001: createDict(1001, '渠道端药店管理', 'distributor_pharmacy', {
    id: dictItem(1001, 'id', 'ID', { type: 1, pk: 1, autoed: 1, show_width: 70, inputed: 0, readonly: 15 }),
    name: dictItem(1001, 'name', '药店名称', { required: 14, filtered: 1, fuzzy: 4, show_width: 180 }),
    default_account: dictItem(1001, 'default_account', '药店默认账号', { required: 14, filtered: 1, fuzzy: 4, show_width: 140 }),
    alias: dictItem(1001, 'alias', '简称', { filtered: 1, fuzzy: 4, show_width: 110 }),
    principal: dictItem(1001, 'principal', '负责人', { required: 14, filtered: 1, fuzzy: 4, show_width: 100 }),
    tel: dictItem(1001, 'tel', '联系电话', { required: 14, filtered: 1, fuzzy: 4, show_width: 130 }),
    extension_person: dictItem(1001, 'extension_person', '推广人', { filtered: 1, fuzzy: 4, show_width: 100 }),
    prescription_organization_name: dictItem(1001, 'prescription_organization_name', '开方机构', {
      required: 14,
      filtered: 1,
      fuzzy: 4,
      show_width: 160
    }),
    end_time: dictItem(1001, 'end_time', '截止日期', { type: 3, required: 14, filtered: 1, show_width: 120 }),
    audit_remark: dictItem(1001, 'audit_remark', '审核备注', { type: 8, max: 300, show_width: 180 }),
    default_sign_amount: dictItem(1001, 'default_sign_amount', '默认签约金额', { type: 1, default: 0, unit: '元', show_width: 120 }),
    state: dictItem(1001, 'state', '状态', {
      type: 1,
      select: '0-关闭;1-开启;2-待审核;3-审核失败',
      required: 14,
      filtered: 1,
      default: 2,
      show_width: 100
    }),
    creator: dictItem(1001, 'creator', '创建人', { show_width: 100, inputed: 0 }),
    create_time: dictItem(1001, 'create_time', '创建时间', { type: 5, show_width: 160, inputed: 0 })
  }),
  1004: createDict(1004, '开方机构管理', 'distributor_mechanism_organization', {
    id: dictItem(1004, 'id', 'ID', { type: 1, pk: 1, autoed: 1, show_width: 70, inputed: 0, readonly: 15 }),
    type: dictItem(1004, 'type', '类型', {
      type: 1,
      select: '1-医院;2-互联网医院',
      required: 14,
      filtered: 1,
      default: 1,
      show_width: 90
    }),
    code: dictItem(1004, 'code', '编码', { filtered: 1, fuzzy: 4, show_width: 150, readonly: 15, inputed: 0 }),
    name: dictItem(1004, 'name', '名称', { required: 14, filtered: 1, fuzzy: 4, show_width: 180 }),
    alias: dictItem(1004, 'alias', '简称', { filtered: 1, fuzzy: 4, show_width: 120 }),
    region_name: dictItem(1004, 'region_name', '行政区划', { required: 14, filtered: 1, fuzzy: 4, show_width: 160 }),
    address: dictItem(1004, 'address', '地址', { type: 8, max: 300, show_width: 220 }),
    principal: dictItem(1004, 'principal', '负责人', { filtered: 1, fuzzy: 4, show_width: 100 }),
    principal_phone: dictItem(1004, 'principal_phone', '负责人电话', { filtered: 1, fuzzy: 4, show_width: 130 }),
    tel: dictItem(1004, 'tel', '电话', { filtered: 1, fuzzy: 4, show_width: 130 }),
    service_provider: dictItem(1004, 'service_provider', '服务方', { required: 14, filtered: 1, fuzzy: 4, show_width: 150 }),
    service_code: dictItem(1004, 'service_code', '服务标识', { required: 14, filtered: 1, fuzzy: 4, show_width: 120 }),
    end_time: dictItem(1004, 'end_time', '截止日期', { type: 3, filtered: 1, show_width: 120 }),
    state: dictItem(1004, 'state', '状态', {
      type: 1,
      select: '0-关闭;1-开启',
      required: 14,
      filtered: 1,
      default: 1,
      show_width: 90
    }),
    creator: dictItem(1004, 'creator', '创建人', { show_width: 100, inputed: 0 }),
    create_time: dictItem(1004, 'create_time', '创建时间', { type: 5, show_width: 160, inputed: 0 })
  }),
  503: createDict(503, '渠道端用户管理', 'distributor_user', {
    id: dictItem(503, 'id', 'ID', { type: 1, pk: 1, autoed: 1, show_width: 70, inputed: 0, readonly: 15 }),
    account: dictItem(503, 'account', '账号', { required: 14, filtered: 1, fuzzy: 4, show_width: 130 }),
    name: dictItem(503, 'name', '姓名', { required: 14, filtered: 1, fuzzy: 4, show_width: 110 }),
    mp: dictItem(503, 'mp', '手机号', { required: 14, filtered: 1, fuzzy: 4, show_width: 130 }),
    sex: dictItem(503, 'sex', '性别', {
      type: 1,
      select: '1-男;2-女',
      filtered: 1,
      show_width: 80
    }),
    avatar: dictItem(503, 'avatar', '头像', { show_width: 90 }),
    state: dictItem(503, 'state', '状态', {
      type: 1,
      select: '0-禁用;1-启用',
      required: 14,
      filtered: 1,
      default: 1,
      show_width: 90
    }),
    creator: dictItem(503, 'creator', '创建人', { show_width: 100, inputed: 0 }),
    create_time: dictItem(503, 'create_time', '创建时间', { type: 5, show_width: 160, inputed: 0 })
  })
};

const internetHospitalMenu = {
  MN0100: {
    code: 'MN0100',
    title: '首页',
    icon: 'home',
    uri: '/hospital/home',
    state: 1,
    style: 1,
    parented: false,
    children: {}
  },
  MN0200: {
    code: 'MN0200',
    title: '工作台',
    icon: 'appstore',
    uri: '',
    state: 1,
    style: 1,
    parented: true,
    children: {
      MN0201: {
        code: 'MN0201',
        title: '医生坐诊',
        icon: 'message',
        uri: '/hospital/workbench/doctor-clinic',
        state: 1,
        style: 1,
        parented: false,
        children: {}
      },
      MN0202: {
        code: 'MN0202',
        title: '药师审方',
        icon: 'audit',
        uri: '/hospital/workbench/pharmacist-review',
        state: 1,
        style: 1,
        parented: false,
        children: {}
      },
      MN0203: {
        code: 'MN0203',
        title: '处方中心',
        icon: 'profile',
        uri: '/hospital/data_center/prescription_details',
        state: 1,
        style: 1,
        parented: false,
        children: {}
      },
      MN0204: {
        code: 'MN0204',
        title: '考勤记录',
        icon: 'calendar',
        uri: '/hospital/workbench/attendance',
        state: 1,
        style: 1,
        parented: false,
        children: {}
      }
    }
  },
  MN0300: {
    code: 'MN0300',
    title: '医院管理',
    icon: 'bank',
    uri: '',
    state: 1,
    style: 1,
    parented: true,
    children: {
      MN0301: {
        code: 'MN0301',
        title: '科室管理',
        icon: 'partition',
        uri: '/hospital/hospital/department',
        state: 1,
        style: 1,
        parented: false,
        children: {}
      },
      MN0302: {
        code: 'MN0302',
        title: '员工管理',
        icon: 'team',
        uri: '/hospital/hospital/employee',
        state: 1,
        style: 1,
        parented: false,
        children: {}
      },
      MN0303: {
        code: 'MN0303',
        title: 'CA认证',
        icon: 'safety-certificate',
        uri: '/hospital/hospital/ca',
        state: 1,
        style: 1,
        parented: false,
        children: {}
      },
      MN0304: {
        code: 'MN0304',
        title: '印章管理',
        icon: 'verified',
        uri: '/hospital/hospital/seal',
        state: 1,
        style: 1,
        parented: false,
        children: {}
      },
      MN0305: {
        code: 'MN0305',
        title: '处方模版',
        icon: 'snippets',
        uri: '/hospital/hospital/prescription-template',
        state: 1,
        style: 1,
        parented: false,
        children: {}
      },
      MN0306: {
        code: 'MN0306',
        title: '协议管理',
        icon: 'file-protect',
        uri: '/hospital/hospital/agreement',
        state: 1,
        style: 1,
        parented: false,
        children: {}
      },
      MN0307: {
        code: 'MN0307',
        title: '医院信息',
        icon: 'solution',
        uri: '/hospital/hospital/info',
        state: 1,
        style: 1,
        parented: false,
        children: {}
      },
      MN0308: {
        code: 'MN0308',
        title: '密钥管理',
        icon: 'key',
        uri: '/hospital/hospital/secret-key',
        state: 1,
        style: 1,
        parented: false,
        children: {}
      }
    }
  },
  MN0400: {
    code: 'MN0400',
    title: '字典维护',
    icon: 'book',
    uri: '',
    state: 1,
    style: 1,
    parented: true,
    children: {
      MN0401: {
        code: 'MN0401',
        title: '药品字典',
        icon: 'medicine-box',
        uri: '/hospital/internet-hospital/western-drug-dictionary',
        state: 1,
        style: 1,
        parented: false,
        children: {}
      }
    }
  }
};

const internetHospitalFunctions = Object.keys({
  MN0100: true,
  MN0200: true,
  MN0201: true,
  MN0202: true,
  MN0203: true,
  MN0204: true,
  MN0300: true,
  MN0301: true,
  MN0302: true,
  MN0303: true,
  MN0304: true,
  MN0305: true,
  MN0306: true,
  MN0307: true,
  MN0308: true,
  MN0400: true,
  MN0401: true
}).reduce((result: Record<string, boolean>, menuCode) => {
  result[menuCode.replace('MN', 'FN') + '00'] = true;
  return result;
}, {});

Object.assign(
  internetHospitalFunctions,
  crudFunctions('MN0301'),
  crudFunctions('MN0302'),
  crudFunctions('MN0305'),
  crudFunctions('MN0306')
);

const tokenData = {
  token: 'mock-token-20260526',
  refresh_token: 'mock-refresh-token-20260526',
  expire_in: 24 * 60 * 60,
  refresh_expire_in: 7 * 24 * 60 * 60,
  appType: 6,
  user: {
    id: 10001,
    realname: '王晨虎',
    real_name: '王晨虎',
    hospital_name: '红杉互联网医院',
    img_head: '',
    img_head_url: ''
  },
  menu: internetHospitalMenu,
  function: internetHospitalFunctions
};

const pharmacyInfo = {
  id: 1,
  logo: '',
  logo_url: '',
  name: '测试大药房（科技点）',
  tel: '010-88888888',
  mp: '010-88888888',
  principal: '王店长',
  principal_phone: '13800000000',
  mobile: '13800000000',
  code: 'MD0025',
  pharmacy_code: 'MD0025',
  address: '北京市朝阳区建国路88号SOHO现代城A座',
  intro: '药店简介 mock 数据',
  medical_license: '',
  business_license: '',
  business_license_period: ''
};

const hospitalHospitalInfo = {
  id: 1,
  logo: '',
  name: '红杉互联网医院',
  level: '三级甲等',
  alias: '红杉医院',
  tag: '卫健委认证医疗机构',
  tel: '400-000-0000',
  address: '北京市朝阳区建国路88号',
  intro: '互联网医院 mock 简介信息'
};

const distributorInfo = {
  id: 1,
  name: '可德方华东渠道',
  code: 'CH2026060001',
  distributor_code: 'CH2026060001',
  principal: '王渠道',
  mp: '13800001111',
  end_time: '2099-12-31'
};

const hospitalCrudStore: Record<string, any[]> = {
  distributorPharmacy: [
    {
      id: 1,
      name: '杭州益民大药房',
      default_account: 'hz_yimin',
      alias: '益民药房',
      principal: '李店长',
      tel: '0571-88888888',
      extension_person: '王渠道',
      prescription_organization_name: '红杉互联网医院',
      end_time: '2099-12-31',
      audit_remark: '',
      default_sign_amount: 399,
      state: 1,
      creator: '系统管理员',
      create_time: '2026-06-02 10:00:00'
    },
    {
      id: 2,
      name: '宁波同仁堂药店',
      default_account: 'nb_trt',
      alias: '同仁堂宁波店',
      principal: '周店长',
      tel: '0574-66666666',
      extension_person: '王渠道',
      prescription_organization_name: '圣通和互联网医院',
      end_time: '2028-06-30',
      audit_remark: '资料待补充',
      default_sign_amount: 299,
      state: 2,
      creator: '系统管理员',
      create_time: '2026-06-02 10:12:00'
    },
    {
      id: 3,
      name: '苏州康民药房',
      default_account: 'sz_kangmin',
      alias: '康民',
      principal: '陈店长',
      tel: '0512-55555555',
      extension_person: '赵推广',
      prescription_organization_name: '红杉互联网医院',
      end_time: '2027-12-31',
      audit_remark: '营业执照信息需重新上传',
      default_sign_amount: 199,
      state: 3,
      creator: '系统管理员',
      create_time: '2026-06-02 10:20:00'
    }
  ],
  distributorMechanismOrganization: [
    {
      id: 1,
      type: 2,
      code: 'MO2606020000001',
      name: '红杉互联网医院',
      alias: '红杉医院',
      region_name: '330100-杭州市',
      address: '浙江省杭州市上城区望江路 88 号',
      principal: '林院长',
      principal_phone: '13800002222',
      tel: '0571-88990000',
      service_provider: 'HHIS-红杉HIS',
      service_code: 'HHIS-DISTRIBUTOR-001',
      end_time: '2099-12-31',
      state: 1,
      creator: '系统管理员',
      create_time: '2026-06-02 10:05:00'
    },
    {
      id: 2,
      type: 1,
      code: 'MO2606020000002',
      name: '圣通和互联网医院',
      alias: '圣通和',
      region_name: '320500-苏州市',
      address: '江苏省苏州市工业园区星湖街 328 号',
      principal: '郑院长',
      principal_phone: '13800003333',
      tel: '0512-88990000',
      service_provider: 'HHIS-红杉HIS',
      service_code: 'HHIS-DISTRIBUTOR-002',
      end_time: '2028-06-30',
      state: 1,
      creator: '系统管理员',
      create_time: '2026-06-02 10:08:00'
    }
  ],
  distributorUser: [
    {
      id: 1,
      account: 'distributor_admin',
      name: '渠道管理员',
      mp: '13800004444',
      sex: 1,
      avatar: '',
      state: 1,
      creator: '系统管理员',
      create_time: '2026-06-02 10:15:00'
    },
    {
      id: 2,
      account: 'distributor_operator',
      name: '渠道运营',
      mp: '13800005555',
      sex: 2,
      avatar: '',
      state: 1,
      creator: '渠道管理员',
      create_time: '2026-06-02 10:18:00'
    }
  ],
  department: [
    {
      id: 1,
      department_name: '全科医学科',
      department_code: 'QKYX',
      parent_name: '互联网医院',
      department_type: 3,
      inquiry_enabled: 1,
      sort_no: 1,
      status: 1,
      remark: '承接互联网复诊、慢病续方等线上问诊服务'
    },
    {
      id: 2,
      department_name: '中医科',
      department_code: 'ZYK',
      parent_name: '互联网医院',
      department_type: 3,
      inquiry_enabled: 1,
      sort_no: 2,
      status: 1,
      remark: '提供中医辨证、调理咨询及中药饮片处方服务'
    },
    {
      id: 3,
      department_name: '皮肤科',
      department_code: 'PFK',
      parent_name: '互联网医院',
      department_type: 1,
      inquiry_enabled: 0,
      sort_no: 3,
      status: 0,
      remark: '皮肤常见病线上复诊配置'
    }
  ],
  employee: [
    {
      id: 1,
      realname: '王晨虎',
      mobile: '13800000001',
      role_name: '医生',
      department_name: '全科医学科',
      title_name: '副主任医师',
      job_no: 'YS0001',
      ca_status: 1,
      status: 1,
      remark: '互联网医院坐诊医生'
    },
    {
      id: 2,
      realname: '李药师',
      mobile: '13800000002',
      role_name: '药师',
      department_name: '药学部',
      title_name: '主管药师',
      job_no: 'YSF0001',
      ca_status: 1,
      status: 1,
      remark: '负责处方审核'
    },
    {
      id: 3,
      realname: '王管理员',
      mobile: '13800000003',
      role_name: '管理员',
      department_name: '互联网医院',
      title_name: '',
      job_no: 'GL0001',
      ca_status: 0,
      status: 1,
      remark: '负责医院基础配置'
    }
  ],
  prescriptionTemplate: [
    {
      id: 1,
      template_name: '西药品处方模板',
      template_type: 1,
      apply_scope: '西药、中成药处方签章',
      sign_scene: '医生签名、药师审方签名',
      version_no: 'V1.0',
      status: 1,
      remark: '用于西药处方 PDF 展示和签章'
    },
    {
      id: 2,
      template_name: '中医药处方模板',
      template_type: 2,
      apply_scope: '中药饮片、煎药处方签章',
      sign_scene: '医生签名、药师审方签名',
      version_no: 'V1.0',
      status: 1,
      remark: '用于中药饮片处方签署'
    },
    {
      id: 3,
      template_name: '病历模板',
      template_type: 3,
      apply_scope: '问诊病历展示',
      sign_scene: '医生签名',
      version_no: 'V1.0',
      status: 0,
      remark: '用于问诊记录病历生成'
    }
  ],
  agreement: [
    {
      id: 1,
      agreement_name: '互联网诊疗服务协议',
      agreement_type: 3,
      sign_subject: '患者',
      version_no: 'V1.0',
      effective_date: '2026-05-01',
      status: 1,
      content_summary: '患者发起互联网诊疗前需确认的医疗服务协议'
    },
    {
      id: 2,
      agreement_name: '隐私政策',
      agreement_type: 2,
      sign_subject: '患者',
      version_no: 'V1.0',
      effective_date: '2026-05-01',
      status: 1,
      content_summary: '说明个人信息收集、使用、存储及保护规则'
    },
    {
      id: 3,
      agreement_name: '电子处方签署授权协议',
      agreement_type: 4,
      sign_subject: '医生/药师',
      version_no: 'V1.0',
      effective_date: '2026-05-10',
      status: 1,
      content_summary: '用于处方签署、药师审方签字的授权确认'
    }
  ]
};

const hospitalCrudRouteMap: Record<string, string> = {
  'hospital/department': 'department',
  'hospital/employee': 'employee',
  'hospital/prescription-template': 'prescriptionTemplate',
  'hospital/agreement': 'agreement'
};

const distributorCrudRouteMap: Record<string, string> = {
  pharmacy: 'distributorPharmacy',
  mechanism_organization: 'distributorMechanismOrganization',
  distributor_hospital: 'distributorMechanismOrganization',
  user: 'distributorUser'
};

const nextCrudId = (list: any[]) => Math.max(0, ...list.map(item => Number(item.id) || 0)) + 1;

const listCrudData = (key: string, req: MockRequest) => {
  const source = hospitalCrudStore[key] || [];
  const curr = Number(req.queryString?.p || 1);
  const num = Number(req.queryString?.num || 10);
  const start = (curr - 1) * num;
  return ok(source.slice(start, start + num), page(curr, num, source.length));
};

const getCrudData = (key: string, req: MockRequest) =>
  ok((hospitalCrudStore[key] || []).find(item => item.id === Number(req.params.id)) || null);

const saveCrudData = (key: string, req: MockRequest) => {
  const list = hospitalCrudStore[key] || [];
  const item = { id: nextCrudId(list), ...(req.body || {}) };
  list.unshift(item);
  hospitalCrudStore[key] = list;
  return ok(item, '保存成功');
};

const updateCrudData = (key: string, req: MockRequest) => {
  const list = hospitalCrudStore[key] || [];
  const id = Number(req.params.id);
  const index = list.findIndex(item => item.id === id);
  if (index >= 0) {
    list[index] = { ...list[index], ...(req.body || {}), id };
    return ok(list[index], '保存成功');
  }
  return ok(null, '数据不存在');
};

const deleteCrudData = (key: string, req: MockRequest) => {
  const list = hospitalCrudStore[key] || [];
  const id = Number(req.params.id);
  hospitalCrudStore[key] = list.filter(item => item.id !== id);
  return ok(null, '删除成功');
};

const crudApi = (prefix: string, routeMap: Record<string, string>) =>
  Object.keys(routeMap).reduce((result: Record<string, any>, route) => {
    const key = routeMap[route];
    result[`GET /${prefix}/v1/${route}`] = (req: MockRequest) => listCrudData(key, req);
    result[`GET /${prefix}/v1/${route}/:id`] = (req: MockRequest) => getCrudData(key, req);
    result[`POST /${prefix}/v1/${route}`] = (req: MockRequest) => saveCrudData(key, req);
    result[`PUT /${prefix}/v1/${route}/:id`] = (req: MockRequest) => updateCrudData(key, req);
    result[`DELETE /${prefix}/v1/${route}/:id`] = (req: MockRequest) => deleteCrudData(key, req);
    return result;
  }, {});

export const INTERNET_HOSPITAL = {
  ...crudApi('hospital', hospitalCrudRouteMap),
  ...crudApi('service/hospital', hospitalCrudRouteMap),
  ...crudApi('distributor', distributorCrudRouteMap),
  ...crudApi('service/distributor', distributorCrudRouteMap),

  'POST /home/v1/sms': ok({ sms_id: 'mock-sms-id' }, '验证码已发送'),
  'POST /service/home/v1/sms': ok({ sms_id: 'mock-sms-id' }, '验证码已发送'),

  'POST /distributor/v1/session': ok({
    ...tokenData,
    appType: 5,
    token: 'mock-distributor-token-20260602',
    refresh_token: 'mock-distributor-refresh-token-20260602',
    user: {
      id: 40001,
      realname: '渠道管理员',
      real_name: '渠道管理员',
      distributor_name: distributorInfo.name,
      img_head: '',
      img_head_url: ''
    }
  }),
  'POST /service/distributor/v1/session': ok({
    ...tokenData,
    appType: 5,
    token: 'mock-distributor-token-20260602',
    refresh_token: 'mock-distributor-refresh-token-20260602',
    user: {
      id: 40001,
      realname: '渠道管理员',
      real_name: '渠道管理员',
      distributor_name: distributorInfo.name,
      img_head: '',
      img_head_url: ''
    }
  }),
  'GET /distributor/v1/session/login_code': ok({ code: '1234' }),
  'GET /service/distributor/v1/session/login_code': ok({ code: '1234' }),

  'GET /pharmacy/v1/pharmacy/info': ok(pharmacyInfo),
  'GET /service/pharmacy/v1/pharmacy/info': ok(pharmacyInfo),
  'PUT /pharmacy/v1/pharmacy/info': (req: MockRequest) => {
    Object.assign(pharmacyInfo, req.body || {});
    return ok(pharmacyInfo, '保存成功');
  },
  'PUT /service/pharmacy/v1/pharmacy/info': (req: MockRequest) => {
    Object.assign(pharmacyInfo, req.body || {});
    return ok(pharmacyInfo, '保存成功');
  },

  'GET /hospital/v1/hospital/info': ok(hospitalHospitalInfo),
  'GET /service/hospital/v1/hospital/info': ok(hospitalHospitalInfo),
  'PUT /hospital/v1/hospital/info': (req: MockRequest) => {
    Object.assign(hospitalHospitalInfo, req.body || {});
    return ok(hospitalHospitalInfo, '保存成功');
  },
  'PUT /service/hospital/v1/hospital/info': (req: MockRequest) => {
    Object.assign(hospitalHospitalInfo, req.body || {});
    return ok(hospitalHospitalInfo, '保存成功');
  },

  'GET /distributor/v1/distributor/info': ok(distributorInfo),
  'GET /service/distributor/v1/distributor/info': ok(distributorInfo),
  'PUT /distributor/v1/distributor/info': (req: MockRequest) => {
    Object.assign(distributorInfo, req.body || {});
    return ok(distributorInfo, '保存成功');
  },
  'PUT /service/distributor/v1/distributor/info': (req: MockRequest) => {
    Object.assign(distributorInfo, req.body || {});
    return ok(distributorInfo, '保存成功');
  },

  'GET /home/v1/dict/:id/:appType': (req: MockRequest) => ok(hospitalCrudDicts[Number(req.params.id)]),
  'GET /service/home/v1/dict/:id/:appType': (req: MockRequest) => ok(hospitalCrudDicts[Number(req.params.id)]),
  'GET /home/v1/dict/:id': (req: MockRequest) => ok(hospitalCrudDicts[Number(req.params.id)]),
  'GET /service/home/v1/dict/:id': (req: MockRequest) => ok(hospitalCrudDicts[Number(req.params.id)]),
  'GET /hospital/v1/dict/:id': (req: MockRequest) => ok(hospitalCrudDicts[Number(req.params.id)]),
  'GET /service/hospital/v1/dict/:id': (req: MockRequest) => ok(hospitalCrudDicts[Number(req.params.id)]),
  'GET /distributor/v1/dict/:id': (req: MockRequest) => ok(hospitalCrudDicts[Number(req.params.id)]),
  'GET /service/distributor/v1/dict/:id': (req: MockRequest) => ok(hospitalCrudDicts[Number(req.params.id)]),

  'GET /home/v1/code/:id': ok([]),
  'GET /service/home/v1/code/:id': ok([]),
  'GET /home/v1/code': ok([]),
  'GET /service/home/v1/code': ok([]),
  'GET /hospital/v1/code': ok([]),
  'GET /pharmacy/v1/code': ok([]),
  'GET /distributor/v1/code': ok([]),
  'GET /service/hospital/v1/code': ok([]),
  'GET /service/pharmacy/v1/code': ok([]),
  'GET /service/distributor/v1/code': ok([]),
  'GET /hospital/v1/function/privilege_detail': ok({}),
  'GET /pharmacy/v1/function/privilege_detail': ok({}),
  'GET /distributor/v1/function/privilege_detail': ok({}),
  'GET /service/hospital/v1/function/privilege_detail': ok({}),
  'GET /service/pharmacy/v1/function/privilege_detail': ok({}),
  'GET /service/distributor/v1/function/privilege_detail': ok({}),
  'GET /hospital/v1/privilege/menu/:menuCode/function': (req: MockRequest) => ok(crudFunctions(req.params.menuCode)),
  'GET /pharmacy/v1/privilege/menu/:menuCode/function': ok({}),
  'GET /distributor/v1/privilege/menu/:menuCode/function': (req: MockRequest) => ok(crudFunctions(req.params.menuCode)),
  'GET /service/hospital/v1/privilege/menu/:menuCode/function': (req: MockRequest) => ok(crudFunctions(req.params.menuCode)),
  'GET /service/pharmacy/v1/privilege/menu/:menuCode/function': ok({}),
  'GET /service/distributor/v1/privilege/menu/:menuCode/function': (req: MockRequest) => ok(crudFunctions(req.params.menuCode)),

  'GET /distributor/v1/user/:id/role': ok([
    { id: 1, name: '渠道管理员', relation: 1 },
    { id: 2, name: '渠道运营', relation: 0 }
  ]),
  'GET /service/distributor/v1/user/:id/role': ok([
    { id: 1, name: '渠道管理员', relation: 1 },
    { id: 2, name: '渠道运营', relation: 0 }
  ]),
  'PUT /distributor/v1/user/:id/role': ok(null, '设置角色成功'),
  'PUT /service/distributor/v1/user/:id/role': ok(null, '设置角色成功'),
  'PUT /distributor/v1/user/:id/re_password': ok(null, '密码已重置为 123456'),
  'PUT /service/distributor/v1/user/:id/re_password': ok(null, '密码已重置为 123456'),
  'PUT /distributor/v1/pharmacy/:id/audit': (req: MockRequest) => {
    const row = hospitalCrudStore['distributorPharmacy'].find(item => item.id === Number(req.params.id));
    if (row) row.state = req.body?.passed === false ? 3 : 1;
    return ok(row, '操作成功');
  },
  'PUT /service/distributor/v1/pharmacy/:id/audit': (req: MockRequest) => {
    const row = hospitalCrudStore['distributorPharmacy'].find(item => item.id === Number(req.params.id));
    if (row) row.state = req.body?.passed === false ? 3 : 1;
    return ok(row, '操作成功');
  },
  'PUT /distributor/v1/pharmacy/:id/state': (req: MockRequest) => {
    const row = hospitalCrudStore['distributorPharmacy'].find(item => item.id === Number(req.params.id));
    if (row) row.state = req.body?.state ?? row.state;
    return ok(row, '操作成功');
  },
  'PUT /service/distributor/v1/pharmacy/:id/state': (req: MockRequest) => {
    const row = hospitalCrudStore['distributorPharmacy'].find(item => item.id === Number(req.params.id));
    if (row) row.state = req.body?.state ?? row.state;
    return ok(row, '操作成功');
  }
};
