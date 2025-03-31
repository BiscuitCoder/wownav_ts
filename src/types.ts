export interface Nav {
	name: string;
	url: string;
}

export interface Nav {
	category: string;
	navs: Nav[];
}

export interface SiteConfig {
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
	navs: Nav[];
}