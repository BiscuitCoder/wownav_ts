import { SiteConfig, NavCategory, NavItem } from '../types/site';

export function validateNavItem(item: any): item is NavItem {
  return (
    typeof item === 'object' &&
    typeof item.name === 'string' &&
    typeof item.url === 'string' &&
    (item.sort === undefined || typeof item.sort === 'number')
  );
}

export function validateNavCategory(category: any): category is NavCategory {
  return (
    typeof category === 'object' &&
    typeof category.category === 'string' &&
    (category.sort === undefined || typeof category.sort === 'number') &&
    Array.isArray(category.navs) &&
    category.navs.every(validateNavItem)
  );
}

// 验证 name 是否只包含英文、数字和连字符
export const validateName = (name: string): boolean => {
  return /^[a-zA-Z0-9-]+$/.test(name);
};

// 验证密码规则
export const validatePassword = (password: string): boolean => {
  if (!password) return false;
  if (password.length < 6) return false;
  if (!/[A-Z]/.test(password)) return false; // 必须包含大写字母
  if (!/[a-z]/.test(password)) return false; // 必须包含小写字母
  if (!/[0-9]/.test(password)) return false; // 必须包含数字
  return true;
};

export const validateSiteConfig = (config: any): config is SiteConfig => {
  // 检查必需字段
  const requiredFields = [
    'name',
    'title',
    'description',
    'keywords',
    'icon',
    'themeColor',
    'about',
    'logo',
    'password',
    'navs'
  ];

  for (const field of requiredFields) {
    if (!(field in config)) {
      console.error(`配置缺少必需字段: ${field}`);
      return false;
    }
  }

  // 检查字段类型和格式
  const fieldValidations = [
    { field: 'name', type: 'string', validate: validateName, message: 'name 字段只能包含英文、数字和连字符' },
    { field: 'title', type: 'string' },
    { field: 'description', type: 'string' },
    { field: 'keywords', type: 'string' },
    { field: 'icon', type: 'string' },
    { field: 'themeColor', type: 'string' },
    { field: 'about', type: 'string' },
    { field: 'logo', type: 'string' },
    { field: 'password', type: 'string' },
    { field: 'navs', type: 'object' }
  ];

  for (const validation of fieldValidations) {
    const value = config[validation.field];
    if (typeof value !== validation.type) {
      console.error(`${validation.field} 字段类型错误: 期望 ${validation.type}，实际为 ${typeof value}`);
      return false;
    }
    if (validation.validate && !validation.validate(value)) {
      console.error(validation.message);
      return false;
    }
  }

  // 验证导航分类数组
  for (const category of config.navs) {
    if (!category.category || typeof category.category !== 'string') {
      console.error('导航分类缺少 category 字段或类型错误');
      return false;
    }
    if (!Array.isArray(category.navs)) {
      console.error(`分类 "${category.category}" 的 navs 字段不是数组`);
      return false;
    }

    // 验证导航项
    for (const nav of category.navs) {
      if (!nav.name || typeof nav.name !== 'string') {
        console.error(`分类 "${category.category}" 中的导航项缺少 name 字段或类型错误`);
        return false;
      }
      if (!nav.url || typeof nav.url !== 'string') {
        console.error(`分类 "${category.category}" 中的导航项 "${nav.name}" 缺少 url 字段或类型错误`);
        return false;
      }
      if (nav.sort !== undefined && typeof nav.sort !== 'number') {
        console.error(`分类 "${category.category}" 中的导航项 "${nav.name}" 的 sort 字段类型错误`);
        return false;
      }
    }
  }

  return true;
}; 