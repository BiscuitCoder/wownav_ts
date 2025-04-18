import fs from 'fs';
import path from 'path';
import ejs from 'ejs';
import { SiteConfig } from '../../types/site';
import { generateSalt } from '../../utils/password';
import { updateSitesCache } from './sites';

// 确保目录存在
export const ensureDir = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// 检查站点是否存在
export const checkSiteExists = (siteName: string): boolean => {
  const siteDir = path.join(__dirname, '../../../public', siteName);
  return fs.existsSync(siteDir);
};

// 获取现有站点的配置
export const getExistingConfig = (siteName: string): SiteConfig | null => {
  const configPath = path.join(__dirname, '../../../public', siteName, 'config.json');
  if (fs.existsSync(configPath)) {
    const configContent = fs.readFileSync(configPath, 'utf-8');
    const res = JSON.parse(configContent);
    res.salt = generateSalt();
    return res;
  }
  return null;
};

// 生成静态页面
export const generateStaticPage = async (config: SiteConfig, siteName: string, callhtml?: string) => {
  try {
    // 创建站点目录
    const siteDir = path.join(__dirname, '../../../public', siteName);
    ensureDir(siteDir);

    // 将config的salt去除
    delete config.salt;

    // 统计总共有多少个navs
    const totalNavs = config.navs.reduce((acc, curr) => acc + curr.navs.length, 0);
    config.totalNavs = totalNavs;
    
    // 保存配置文件
    fs.writeFileSync(
      path.join(siteDir, 'config.json'),
      JSON.stringify(config, null, 2)
    );

    // 读取模板
    let html = '';
    if (callhtml) {
      html = callhtml;
    } else {
      const template = fs.readFileSync(
        path.join(__dirname, '../../templates/site_temp.ejs'),
        'utf-8'
      );
      html = await ejs.render(template, { config });
    }

    // 保存HTML文件
    fs.writeFileSync(path.join(siteDir, 'index.html'), html);

    // 更新站点列表缓存
    updateSitesCache();

    return true;
  } catch (error) {
    console.error('生成静态页面失败:', error);
    return false;
  }
}; 