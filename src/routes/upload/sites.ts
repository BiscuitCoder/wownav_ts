import { Router } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();

// 定义站点信息接口
interface SiteInfo {
  name: string;
  title: string;
  description: string;
  keywords: string;
  icon: string;
  logo: string;
  themeColor: string;
  about: string;
  contact: string;
  tag: string;
  totalNavs: number;
  url: string;
  lastUpdated: number;
}

// 内存缓存
let sitesCache: SiteInfo[] = [];
let lastUpdateTime = 0;

export const getSitesCache = () => {
  return sitesCache;
} 

// 更新缓存
export const updateSitesCache = () => {
  try {
    const publicDir = path.join(__dirname, '../../../public');
    const sites = fs.readdirSync(publicDir)
      .filter(file => {
        const sitePath = path.join(publicDir, file);
        return fs.statSync(sitePath).isDirectory() && 
               fs.existsSync(path.join(sitePath, 'config.json'));
      })
      .map(siteName => {
        try {
          const configPath = path.join(publicDir, siteName, 'config.json');
          const configContent = fs.readFileSync(configPath, 'utf-8');
          const config = JSON.parse(configContent);

          return {
            name: config.name,
            title: config.title,
            description: config.description,
            keywords: config.keywords,
            icon: config.icon,
            logo: config.logo,
            themeColor: config.themeColor,
            about: config.about,
            contact: config.contact,
            tag: config.tag,
            totalNavs: config.totalNavs || 0,
            url: `/${siteName}`,
            lastUpdated: Date.now()
          };
        } catch (error) {
          console.error(`读取站点 ${siteName} 配置失败:`, error);
          return null;
        }
      })
      .filter((site): site is SiteInfo => site !== null);

    sitesCache = sites;
    lastUpdateTime = Date.now();
    console.log('站点列表缓存已更新');
  } catch (error) {
    console.error('更新站点列表缓存失败:', error);
  }
};

// 初始化缓存
updateSitesCache();

router.get('/', async (req, res) => {
  try {
    // 返回缓存的数据
    res.json(sitesCache);
  } catch (error) {
    console.error('获取站点列表失败:', error);
    res.status(500).json({
      success: false,
      error: '获取站点列表失败'
    });
  }
});
export default router; 