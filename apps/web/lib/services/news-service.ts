// apps/web/lib/services/news-service.ts

export interface Headline {
  title: string
  url:   string
}

export class NewsService {
  private static getApiKey(): string {
    const key = process.env.NEWS_API_KEY
    if (!key) {
      throw new Error('Missing NEWS_API_KEY in environment')
    }
    return key
  }

  /** Fetch the top headlines from NewsAPI.org */
  static async getTopHeadlines(
    country: string = 'us'
  ): Promise<Headline[]> {
    const apiKey = this.getApiKey()
    const res = await fetch(
      `https://newsapi.org/v2/top-headlines?country=${country}&apiKey=${apiKey}`
    )
    if (!res.ok) {
      throw new Error(`News API error: ${res.status}`)
    }
    const body = await res.json()
    return (body.articles || []).map((a: any) => ({
      title: a.title,
      url:   a.url
    }))
  }
}
