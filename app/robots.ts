import {MetadataRoute} from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: ['/', '/auth', '/images/'],
            disallow: ['/dashboard', '/api', '/settings', '/list'],
            },
        sitemap: 'https://what-to-watch.pro/sitemap.xml',
    }
}