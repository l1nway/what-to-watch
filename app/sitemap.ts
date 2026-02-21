import {MetadataRoute} from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://what-to-watch.pro'

    return [{
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'yearly',
        priority: 1,
    }, {
        url: `${baseUrl}/auth`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
    },]
}