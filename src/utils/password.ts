import crypto from 'crypto';

// 生成随机盐值
export const generateSalt = (): string => {
    // 优先从环境变量获取盐值
    const saltFromEnv = process.env.SITE_PASSWORD_SALT;
    if (saltFromEnv) {
        return saltFromEnv;
    }else{
        throw new Error('SITE_PASSWORD_SALT 环境变量未设置');
    }
};

// 使用SHA-256加密密码
export const hashPassword = (password: string, salt: string): string => {
    const hash = crypto.createHash('sha256');
    hash.update(password + salt);
    return hash.digest('hex');
};

// 验证密码
export const verifyPassword = (password: string, salt: string, hash: string): boolean => {
    const passwordHash = hashPassword(password, salt);
    return passwordHash === hash;
};

// 生成带盐值的密码哈希
export const generatePasswordHash = (password: string): { salt: string; hash: string } => {
    const salt = generateSalt();
    const hash = hashPassword(password, salt);
    return { salt, hash };
}; 

export const generateRandomPassword = () => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const allChars = uppercase + lowercase + numbers;
    
    let password = '';
    // 确保至少包含一个大写字母
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    // 确保至少包含一个小写字母
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    // 确保至少包含一个数字
    password += numbers[Math.floor(Math.random() * numbers.length)];
    
    // 填充剩余3个字符
    for (let i = 0; i < 3; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // 打乱密码字符顺序
    return password.split('').sort(() => Math.random() - 0.5).join('');
};