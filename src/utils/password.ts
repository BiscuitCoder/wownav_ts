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