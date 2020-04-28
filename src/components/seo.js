/**
 * SEO component that queries for data with
 *  Gatsby's useStaticQuery React hook
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from "react"
import PropTypes from "prop-types"
import Helmet from "react-helmet"
import { useStaticQuery, graphql } from "gatsby"
import getSchema from "./schema"

function SEO({ description, lang, meta, date, title, url, image, isPost }) {
  const { site } = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            title
            siteDescription
            author
            siteUrl
          }
        }
      }
    `
  )

  console.log(isPost)

  const imageSrc = image
    ? `${site.siteMetadata.siteUrl}${image.childImageSharp.fluid.src}`
    : ""
  const metaDescription = description || site.siteMetadata.siteDescription

  return (
    <Helmet
      htmlAttributes={{
        lang,
      }}
      title={title}
      titleTemplate={`%s | ${site.siteMetadata.title}`}
      meta={[
        {
          name: `description`,
          content: metaDescription,
        },
        {
          property: `og:title`,
          content: title,
        },
        {
          property: `og:description`,
          content: metaDescription,
        },
        {
          property: `og:url`,
          content: url || site.siteMetadata.siteUrl,
        },
        {
          property: `og:type`,
          content: `website`,
        },
        {
          name: `twitter:card`,
          content: `summary`,
        },
        {
          name: `twitter:creator`,
          content: site.siteMetadata.author,
        },
        {
          name: `twitter:title`,
          content: title,
        },
        {
          name: `twitter:description`,
          content: metaDescription,
        },
      ]
        .concat(meta)
        .concat(image ? { property: "og:image", content: imageSrc } : [])}
    >
      {isPost ? (
        <script type="application/ld+json">
          {JSON.stringify(
            getSchema({
              isPost,
              siteTitle: site.siteMetadata.title,
              siteUrl: site.siteMetadata.siteUrl,
              title,
              author: site.siteMetadata.author,
              date,
              image: imageSrc,
            })
          )}
        </script>
      ) : null}
    </Helmet>
  )
}

SEO.defaultProps = {
  lang: `en`,
  meta: [],
  description: null,
}

SEO.propTypes = {
  description: PropTypes.string,
  lang: PropTypes.string,
  meta: PropTypes.arrayOf(PropTypes.object),
  title: PropTypes.string.isRequired,
}

export default SEO
