import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import uploadRouter from './routes/upload';
import path from 'path';
import expressLayouts from 'express-ejs-layouts';
import { beautifyHtml, deepseekChat } from './utils/deepseek';

// 加载环境变量
dotenv.config();

const app = express();
const port = process.env.PORT || 3008;

// 设置模板引擎
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'templates'));

// 配置express-ejs-layouts
app.use(expressLayouts);
app.set('layout', 'layouts/base');
app.set("layout extractScripts", true);
app.set("layout extractStyles", true);

// 中间件
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// 设置布局中间件
app.use((req, res, next) => {
    res.locals.config = {
        title: 'Wownav',
        logo: '/logo2.png',
        icon: '/logo.svg',
        description: 'Wownav 是一个开放免费的导航网站生成工具',
        themeColor: '#102fb9'
    };
    res.locals.title = res.locals.config.title;  // 添加 title 变量
    res.locals.path = req.path;
    next();
});

// 静态文件服务
app.use(express.static('public'));

// API 路由
app.use('/api/upload', uploadRouter);

// 页面路由
app.get('/', (req, res) => {
  res.render('index',{title: '首页'});
});

app.get('/manage/generate', (req, res) => {
  res.render('manage/generate',{title: '站点生成'});
});

app.get('/manage/sitemodify', (req, res) => {
  res.render('manage/sitemodify',{title: '导航管理'});
});

app.get('/docs', (req, res) => {
  res.render('docs',{title: '使用文档'});
});

// 聊天页面路由
app.get('/chat', (req, res) => {
  res.render('chat', {title: 'AI 聊天'});
});

// 移动端提示页面路由
app.get('/mobiletip', (req, res) => {
  res.render('mobile_tip',{title: '提示'});
});

// 浏览记录路由
app.get('/history', (req: express.Request, res: express.Response) => {
  res.render('history',{title: '浏览记录'});
});

  // deepseek api访问
  app.post('/deepseek', async (req: express.Request, res: express.Response) => {
      const { message } = req.body;
      await deepseekChat(message, res);
  });

// 美化html
app.post('/beautify', async (req: express.Request, res: express.Response) => {
  /*
  const config:SiteConfig = {
    title: 'Wownav test',
    description: 'Wownav 是一个开放免费的导航网站生成工具',
    keywords: 'Wownav,导航,免费,开放',
    icon: '/logo.svg',
    themeColor: '#102fb9',
    about: 'Wownav 是一个开放免费的导航网站生成工具',
    contact: 'https://github.com/wownav',
    logo: '',
    author: 'Wownav',
    navs: [{
      category: "分类名称222",
      sort: 3,
      navs: [
        {
          name: "导航站名称1",
          url: "https://www.wownav.com",
          sort: 3
        },
        {
          name: "导航站名称2",
          url: "https://www.wownav.com",
          sort: 2
        },
        {
          name: "导航站名称3",
          url: "https://www.wownav.com",
          sort: 1
        }
      ]
    },
    {
      category: "分类名称",
      sort: 1,
      navs: [
        {
          name: "导航站名称1",
          url: "https://www.wownav.com",
          sort: 3
        },
        {
          name: "导航站名称2",
          url: "https://www.wownav.com",
          sort: 2
        },
        {
          name: "导航站名称3",
          url: "https://www.wownav.com",
          sort: 1
        }
      ]
    }],
    authorUrl: 'https://github.com/wownav',
    password: '123456'
  };
  */
  const url = await beautifyHtml(req.body.siteConfig, req.body.prompt, req.body.needCreatePage);
  res.json({data:url});
});

app.get('/ping', (req: express.Request, res: express.Response) => {
  res.json({message: 'pong'});
});

// 错误处理中间件
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器内部错误' });
});

// 404 错误处理
app.use((req: express.Request, res: express.Response) => {
  res.status(404).render('404');
});

// 启动服务器
app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
}); 