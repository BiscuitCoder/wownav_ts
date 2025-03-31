import { Router } from 'express';
import configRouter from './config';
import updateRouter from './update';
import deleteRouter from './delete';
import captchaRouter from './captcha';
import verifyRouter from './verify';
import sitemapRouter from './sitemap';
import sitesRouter from './sites';

const router = Router();

router.use('/config', configRouter);
router.use('/update', updateRouter);
router.use('/delete', deleteRouter);
router.use('/captcha', captchaRouter);
router.use('/verify', verifyRouter);
router.use('/sitemap', sitemapRouter);
router.use('/sites', sitesRouter);

export default router; 