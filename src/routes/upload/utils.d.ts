import { SiteConfig } from '../../types/site';

export function ensureDir(dir: string): void;
export function checkSiteExists(siteName: string): boolean;
export function getExistingConfig(siteName: string): SiteConfig | null;
export function generateStaticPage(config: SiteConfig, siteName: string): Promise<boolean>; 