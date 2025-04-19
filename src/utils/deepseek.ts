import 'dotenv/config';
import OpenAI from "openai";
import { Response } from 'express';
import fs from 'fs';
import path from 'path';
import ejs from "ejs";
import { SiteConfig } from '@/types/site';
import { generateStaticPage } from '../routes/upload/utils';
import { generatePasswordHash, generateRandomPassword } from './password';

// 验证环境变量
if (!process.env.DEEPSEEK_API_KEY) {
    throw new Error('DEEPSEEK_API_KEY 环境变量未设置');
}

const openai = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
});
  
export const deepseekChat = async function (message: string, res: Response) {
    if (!message) {
        return res.status(400).json({ error: '消息不能为空' });
    }
    
    // 设置响应头，支持流式传输
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
        const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: message }
        ];
        
        const stream = await openai.chat.completions.create({
            messages: messages,
            // model: 'deepseek-r1-250120',
            model: 'doubao-1-5-thinking-pro-250415',
            stream: true,
        });
        
        // 将流式响应发送到客户端
        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
                res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
        }
        
        // 发送结束标记
        res.write('data: [DONE]\n\n');
        res.end();
    } catch (error) {
        console.error('Stream error:', error);
        res.write(`data: ${JSON.stringify({ error: '流式请求失败' })}\n\n`);
        res.end();
    }
}

// ai定义页面元素
export const beautifyHtml = async (
    config: SiteConfig, 
    prompt?: string,
    needCreatePage: boolean = true
): Promise<{result: string, password: string}> => {

    // 读取模板文件
    const template = fs.readFileSync(
        path.join(__dirname, '../templates/site_temp.ejs'),
        'utf-8'
    );
    
    // 分割模板
    let [css, dom, js] = template.split('<!-- Dividing -->');

    // prompt = "加载完成后，在搜索栏下面，插入一个banner图片链接为：https://github.com/lxdao-official/.github/raw/main/images/LXDAO.png ,图片加入一个css的心跳循环动画,图片宽度为100%自适应，图片加入上边距,点击这个图片alert("欢迎各位LX，让给我们共创良心社会🤝~")';
    
    // 如果有优化提示词
    if (prompt) {
        const model =  'deepseek-r1-250120';
        console.log('模型===>', model);
        console.log('prompt代码生成中===>', prompt);
        try {
            const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
                { 
                    role: "system", 
                    content: `你是一个专业的前端开发专家。请根据用户的需求，生成相应的CSS、HTML和JavaScript代码。
                    要求：
                    1. 分析用户需求，判断需要生成哪些类型的代码（CSS/HTML/JavaScript）
                    2. 生成的代码必须是完整的、可用的，并且符合现代前端开发最佳实践
                    3. 代码应该能够无缝集成到现有代码中
                    4. 返回格式必须是JSON，包含以下字段：
                       {
                         "css": "新的CSS代码（如果需要）",
                         "html": "需要插入的HTML片段（不包含原有结构）",
                         "js": "JavaScript代码，必须包含：
                             - 定位目标插入位置的逻辑
                             - 创建和插入新DOM元素的代码
                             - 相关的事件处理代码
                       }
                    5. 如果某个部分不需要修改，对应字段返回空字符串
                    6. 不要包含任何解释性文字，只返回JSON格式的代码
                    7. 不要使用反引号，使用普通引号
                    8. 确保返回的是合法的JSON格式
                    9. 注意：不要修改或删除现有的EJS模板变量（如 <%= config.xxx %>）
                    10. JavaScript代码必须使用DOM API来操作，不要直接修改HTML字符串
                    11. 使用 querySelector 或 getElementById 等方法来定位插入位置` 
                },
                { 
                    role: "user", 
                    content: `参考现有的HTML结构：${dom}\n\n根据以下需求生成相应的代码：${prompt}` 
                }
            ];
            
            const response = await openai.chat.completions.create({
                messages: messages,
                model,
                stream: false,
            });
            
            const result = response.choices[0]?.message?.content;
            console.log('AI返回的原始结果:', result);

            if (result) {
                try {
                    // 预处理返回的结果
                    let processedResult = result
                        .replace(/```json/g, '')
                        .replace(/```/g, '')
                        .trim();
                    
                    // 尝试解析JSON
                    const generatedCode = JSON.parse(processedResult);
                    console.log('解析后的代码:', generatedCode);
                    
                    // 处理CSS
                    if (generatedCode.css) {
                        const cleanCss = generatedCode.css
                            .replace(/```css/g, '')
                            .replace(/```/g, '')
                            .trim();
                        css = `${css}\n<!-- 新增样式 -->\n<style>\n${cleanCss}\n</style>`;
                    }
                    
                    // 处理JavaScript
                    if (generatedCode.js) {
                        const cleanJs = generatedCode.js
                            .replace(/```javascript/g, '')
                            .replace(/```js/g, '')
                            .replace(/```/g, '')
                            .trim();
                        
                        // 将HTML内容转换为JavaScript字符串
                        const htmlContent = generatedCode.html ? 
                            generatedCode.html
                                .replace(/```html/g, '')
                                .replace(/```/g, '')
                                .trim()
                                .replace(/'/g, "\\'")
                                .replace(/\n/g, '\\n') : '';
                        
                        // 将HTML内容注入到JavaScript中
                        const jsWithHtml = `
                            // 存储HTML内容
                            const htmlContent = '${htmlContent}';
                            
                            // 执行用户定义的JavaScript代码
                            ${cleanJs}
                        `;
                        
                        js = `${js}\n<!-- 新增脚本 -->\n<script>\n${jsWithHtml}\n</script>`;
                    }
                } catch (error) {
                    console.error('解析AI返回的代码失败:', error);
                    console.error('处理后的结果:', result);
                    js += `<script>console.error('解析AI返回的代码失败');</script>`;
                }
            }
        } catch (error) {
            console.error('生成代码失败:', error);
            js += `<script>alert('生成代码失败');</script>`;
        }
    }
    
    // 组合代码
    const html = `${css}<!-- Dividing -->${dom}<!-- Dividing -->${js}`;
    
    // 渲染模板
    const htmlRes = await ejs.render(html, { config });

    console.log('htmlRes', needCreatePage);

    if (!needCreatePage) {
        return {
            result: htmlRes,
            password: ''
        };
    }

    // 以当前config.name为文件名,创建一个文件夹，保存到public目录下，同时创建一个index.html，写入htmlres数据，使得可以通过当前服务可以访问到这个页面
    // const publicDir = path.join(__dirname, '../../public');
    const name = config.name || new Date().getTime().toString();
    // const dirPath = path.join(publicDir, name);
    // if (!fs.existsSync(dirPath)) {
    //     fs.mkdirSync(dirPath, { recursive: true });
    // }
    // const filePath = path.join(dirPath, 'index.html');
    // fs.writeFileSync(filePath, htmlRes);

    // 生成随机6位数密码,带字母和数字
   

    const randomPassword = generateRandomPassword();
    const {hash } = generatePasswordHash(randomPassword);
    config.password = hash;

    
    await generateStaticPage(config as SiteConfig, name, htmlRes);
    
    // 返回可访问的URL
    const url = `http://localhost:3008/${name}`;
    return {result: url, password: randomPassword};
}