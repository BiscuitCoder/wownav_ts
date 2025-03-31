import { Router } from 'express';
import { getExistingConfig, generateStaticPage } from './utils';
import { validateSiteConfig, validatePassword } from '../../utils/validator';
import { SiteConfig } from '../../types/site';
import { verifyPassword } from '../../utils/password';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { name, password, config } = req.body;

    if (!name || !password || !config) {
      return res.status(400).json({ error: '请提供完整信息' });
    }

    const existingConfig = getExistingConfig(name);
    if (!existingConfig) {
      return res.status(404).json({ error: '站点不存在' });
    }

    if (!existingConfig.salt || !verifyPassword(password, existingConfig.salt, existingConfig.password)) {
      return res.status(401).json({ error: '密码错误' });
    }

    // 验证新配置
    if (!validateSiteConfig(config)) {
      return res.status(400).json({ error: '配置格式不正确' });
    }

    // 如果设置了新密码，验证新密码规则
    if (config.newPassword && !validatePassword(config.newPassword)) {
      return res.status(400).json({ error: '新密码必须至少6位，且包含大小写字母和数字' });
    }

    // 保持原有的密码和盐值
    config.password = existingConfig.password;
    config.salt = existingConfig.salt;

    // 生成静态页面
    const success = await generateStaticPage(config as SiteConfig, name);

    if (!success) {
      return res.status(500).json({ error: '更新失败' });
    }

    res.json({ message: '更新成功' });
  } catch (error) {
    console.error('更新失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

export default router; 