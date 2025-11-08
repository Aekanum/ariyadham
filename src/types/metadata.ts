export interface ArticleMetadata {
  title: string;
  description: string;
  image?: string;
  url: string;
  author: {
    name: string;
    url?: string;
  };
  publishedTime: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
}

export interface SeoMetadata {
  title: string;
  description: string;
  canonical: string;
  openGraph: {
    type: 'article' | 'website';
    title: string;
    description: string;
    url: string;
    images: Array<{
      url: string;
      width?: number;
      height?: number;
      alt?: string;
    }>;
    locale: string;
    siteName: string;
    article?: {
      publishedTime: string;
      modifiedTime?: string;
      authors: string[];
      section?: string;
      tags?: string[];
    };
  };
  twitter: {
    card: 'summary' | 'summary_large_image';
    title: string;
    description: string;
    images: string[];
  };
}
