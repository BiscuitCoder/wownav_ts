import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { getExistingConfig } from './utils';
import { verifyPassword, generateSalt } from '../../utils/password';
import { updateSitesCache } from './sites';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { name, password } = req.body;

    if (!name || !password) {
      return res.status(400).json({ error: '请提供站点名称和密码' });
    }

    const existingConfig = getExistingConfig(name);
    if (!existingConfig) {
      return res.status(404).json({ error: '站点不存在' });
    }

    // 获取站点的 salt
    const salt = generateSalt();
    if (!salt) {
      return res.status(500).json({ error: '无法读取密码盐值' });
    }

    // 验证密码
    if (!verifyPassword(password, salt, existingConfig.password)) {
      return res.status(401).json({ error: '密码错误' });
    }

    // 删除站点目录
    const siteDir = path.join(__dirname, '../../../public', name);
    if (fs.existsSync(siteDir)) {
      fs.rmSync(siteDir, { recursive: true, force: true });
      
      // 更新站点列表缓存
      updateSitesCache();
      
      res.json({ message: '站点删除成功' });
    } else {
      res.status(404).json({ error: '站点目录不存在' });
    }
  } catch (error) {
    console.error('删除站点失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

export default router; 