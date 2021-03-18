import React from "react"
import { Link, graphql } from "gatsby"

import Bio from "../components/bio"
import Layout from "../components/layout"
import SEO from "../components/seo"
import { rhythm } from "../utils/typography"
import SubscribeToNewsletter from "../components/subscribe-to-newsletter"
import BookHomePage from "../components/book-home"

class BlogIndex extends React.Component {
  render() {
    const { data } = this.props
    const { title: siteTitle, author } = data.site.siteMetadata;
    const posts = data.allMarkdownRemark.edges

    return (
      <React.Fragment>
        <BookHomePage />
        <Layout location={this.props.location} title={siteTitle}>
          <SEO title={author} />
          <Bio />
          {posts.map(({ node }) => {
            const title = node.frontmatter.title || node.fields.slug
            const externalLink = node.frontmatter.externalLink;
            return (
              <article key={node.fields.slug}>
                <header>
                  <h3
                    style={{
                      marginBottom: rhythm(1 / 4),
                    }}
                  >
                      {externalLink ? (
                        <a href={externalLink}>
                          {title}
                        </a>
                      ) : (
                    <Link style={{ boxShadow: `none` }} to={node.fields.slug}>
                      {title}
                    </Link>
                      )}
                  </h3>
                  <small>
                    {node.frontmatter.readingTime || node.fields.readingTime.text} - {node.frontmatter.date}
                  </small>
                </header>
                <section>
                  <p
                    dangerouslySetInnerHTML={{
                      __html: node.frontmatter.description || node.excerpt,
                    }}
                  />
                </section>
              </article>
            )
          })}
          <SubscribeToNewsletter />
        </Layout>
      </React.Fragment>
    )
  }
}

export default BlogIndex

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
        author
      }
    }
    allMarkdownRemark(
      sort: { fields: [frontmatter___date], order: DESC }
      limit: 1000
      filter: { frontmatter: { published: { eq: true } } }
    ) {
      edges {
        node {
          excerpt
          fields {
            slug
            readingTime {
              text
            }
          }
          frontmatter {
            date(formatString: "MMMM DD, YYYY")
            title
            description
            externalLink
            readingTime
          }
        }
      }
    }
  }
`
