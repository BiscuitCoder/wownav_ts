export interface NavItem {
	name: string;
	url: string;
	sort?: number;
}

export interface NavCategory {
	category: string;
	sort: number;
	navs: NavItem[];
}

export interface SiteConfig {
	name?: string;
	title: string;
	description: string;
	keywords: string;
	icon: string;
	themeColor: string;
	about: string;
	contact: string;
	logo: string;
	author: string;
	authorUrl: string;
	password: string;
	navs: NavCategory[];
}