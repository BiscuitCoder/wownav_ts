import { Router } from 'express';
import { getSitesCache } from './sites';

const router = Router();

// 生成站点地图
router.get('/', (req, res) => {
    try {
        // 生成站点地图XML
        let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${req.protocol}://${req.get('host')}/</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
        <lastmod>${new Date().toISOString()}</lastmod>
    </url>`;

        // 添加所有站点
        getSitesCache().forEach(site => {
            sitemap += `
    <url>
        <loc>${req.protocol}://${req.get('host')}${site.url}</loc>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
        <lastmod>${new Date(site.lastUpdated).toISOString()}</lastmod>
        <description>${site.description}</description>
        <title>${site.title}</title>
        <tag>${site.tag}</tag>
        <totalNavs>${site.totalNavs}</totalNavs>
    </url>`;
        });

        sitemap += '\n</urlset>';

        // 设置正确的Content-Type
        res.setHeader('Content-Type', 'application/xml');
        res.send(sitemap);
    } catch (error) {
        console.error('生成站点地图失败:', error);
        res.status(500).send('生成站点地图失败');
    }
});

export default router; 