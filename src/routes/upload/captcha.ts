import { Router } from 'express';
import { createCanvas } from 'canvas';
import { randomBytes } from 'crypto';

const router = Router();

// 存储验证码的临时对象
const captchaStore: { [key: string]: string } = {};

// 生成随机验证码
function generateCaptchaText(): string {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 4; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}

// 生成验证码图片
router.get('/generate', (req, res) => {
    const canvas = createCanvas(120, 40);
    const ctx = canvas.getContext('2d');
    
    // 设置背景
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, 120, 40);
    
    // 生成验证码文本
    const captchaText = generateCaptchaText();
    
    // 生成唯一ID
    const captchaId = randomBytes(16).toString('hex');
    
    // 存储验证码
    captchaStore[captchaId] = captchaText;
    
    // 设置文本样式
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#333';
    
    // 添加干扰线
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * 120, Math.random() * 40);
        ctx.lineTo(Math.random() * 120, Math.random() * 40);
        ctx.strokeStyle = `rgb(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255})`;
        ctx.stroke();
    }
    
    // 添加干扰点
    for (let i = 0; i < 50; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * 120, Math.random() * 40, 1, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255})`;
        ctx.fill();
    }
    
    // 绘制验证码文本
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillText(captchaText, 60, 20);
    
    // 返回验证码图片和ID
    res.json({
        id: captchaId,
        image: canvas.toDataURL()
    });
});

// 验证验证码
router.post('/verify', (req, res) => {
    const { id, code } = req.body;
    
    if (!id || !code) {
        return res.status(400).json({ error: '缺少验证码ID或验证码' });
    }
    
    const storedCode = captchaStore[id];
    if (!storedCode) {
        return res.status(400).json({ error: '验证码已过期' });
    }
    
    if (storedCode.toUpperCase() !== code.toUpperCase()) {
        return res.status(400).json({ error: '验证码错误' });
    }
    
    // 验证成功后删除验证码
    delete captchaStore[id];
    
    res.json({ success: true });
});

export default router; 