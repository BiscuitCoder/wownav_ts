import { Router, Request } from 'express';
import { validateSiteConfig, validatePassword } from '../../utils/validator';
import { SiteConfig } from '../../types/site';
import { generatePasswordHash, verifyPassword } from '../../utils/password';
import { checkSiteExists, getExistingConfig, generateStaticPage } from './utils';

const router = Router();

router.post('/', async (req: Request, res) => {
  try {
    const config = req.body;
    // console.log('接收到的配置:', config);

    if (!config) {
      console.log('没有接收到配置数据');
      return res.status(400).json({ error: '请提供配置数据' });
    }

    if (!validateSiteConfig(config)) {
      console.log('配置验证失败');
      return res.status(400).json({ error: '配置文件格式不符合要求' });
    }

    // 验证密码规则
    if (!validatePassword(config.password)) {
      return res.status(400).json({ error: '密码必须至少6位，且包含大小写字母和数字' });
    }

    console.log('配置验证成功');

    // 使用 name 字段作为站点目录名
    const siteName = config.name;

    // 检查站点是否已存在
    if (checkSiteExists(siteName)) {
      // 如果站点存在，需要验证密码
      const existingConfig = getExistingConfig(siteName);
      if (!existingConfig) {
        return res.status(500).json({ error: '无法读取现有配置' });
      }

      const { password } = req.body;
      if (!password) {
        return res.status(401).json({ error: '需要密码验证' });
      }

      // 验证密码
      if (!existingConfig.salt || !verifyPassword(password, existingConfig.salt, existingConfig.password)) {
        return res.status(401).json({ error: '密码错误' });
      }
    } else {
      // 如果是新站点，生成密码哈希
      const { salt, hash } = generatePasswordHash(config.password);
      config.salt = salt;
      config.password = hash;
    }

    // 生成静态页面
    const success = await generateStaticPage(config as SiteConfig, siteName);

    if (!success) {
      return res.status(500).json({ error: '生成静态页面失败' });
    }

    // 验证通过，返回成功消息
    res.json({
      message: '配置验证成功并生成静态页面',
      config: config as SiteConfig,
      url: `/${siteName}`
    });
  } catch (error) {
    console.error('服务器错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

export default router; 