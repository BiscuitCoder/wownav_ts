export interface NavItem {
  name: string;
  url: string;
  sort: number;
}

export interface NavCategory {
  category: string;
  sort: number;
  navs: NavItem[];
}

export interface SiteConfig {
  name: string;
  title: string;
  description: string;
  keywords: string;
  icon: string;
  themeColor: string;
  about: string;
  contact?: string;
  logo: string;
  password: string;
  newPassword?: string;
  passwordHint?: string;
  salt?: string;
  totalNavs:number;
  navs: NavCategory[];
} 