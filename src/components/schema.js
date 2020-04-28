export default function getSchema({
  isPost,
  title,
  date,
  author,
  image,
  site,
  siteTitle,
  siteUrl
}) {
  if (isPost) {
    return {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": site,
      },
      headline: title,
      image: image,
      author: {
        "@type": "Person",
        name: author,
      },
      datePublished: date,
    }
  }

  return {
    "@context": "https://schema.org/",
    "@type": "WebSite",
    name: siteTitle,
    url: siteUrl,
  }
}
