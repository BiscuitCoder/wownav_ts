import { Router } from 'express';
import { getExistingConfig } from './utils';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: '请提供站点名称' });
    }

    const config = getExistingConfig(name);
    if (!config) {
      return res.status(404).json({ error: '站点不存在' });
    }

    // 返回配置信息（不包含密码和盐值）
    const { password: _, salt: __, ...safeConfig } = config;
    res.json(safeConfig);
  } catch (error) {
    console.error('验证失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

export default router; 