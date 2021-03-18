const path = require(`path`)
const { createFilePath } = require(`gatsby-source-filesystem`)

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions

  const blogPost = path.resolve(`./src/templates/blog-post.js`)
  const result = await graphql(
    `
      {
        allMarkdownRemark(
          sort: { fields: [frontmatter___date], order: DESC }
          limit: 1000
          filter: { frontmatter: { published: { eq: true } } }
        ) {
          edges {
            node {
              fields {
                slug
              }
              frontmatter {
                title
                published
                externalLink
              }
            }
          }
        }
      }
    `
  )

  const draftResult = await graphql(
    `
      {
        allMarkdownRemark(
          sort: { fields: [frontmatter___date], order: DESC }
          limit: 1000
          filter: { frontmatter: { published: { eq: false } } }
        ) {
          edges {
            node {
              fields {
                slug
              }
              frontmatter {
                title
                published
              }
            }
          }
        }
      }
    `
  )

  if (result.errors) {
    throw result.errors
  }

  const isExternalLink = (node) => node && node.frontmatter.externalLink;

  // Create blog posts pages.
  const posts = result.data.allMarkdownRemark.edges
  const drafts = draftResult.data.allMarkdownRemark.edges


  posts.forEach((post, index) => {
    if (isExternalLink(post.node)) {
      return;
    }

    let previous = index === posts.length - 1 ? null : posts[index + 1].node
    let next = index === 0 ? null : posts[index - 1].node

    createPage({
      path: post.node.fields.slug,
      component: blogPost,
      context: {
        slug: post.node.fields.slug,
        previous,
        next,
      },
    })
  })

  drafts.forEach((post, index) => {
    const previous = index === drafts.length - 1 ? null : drafts[index + 1].node
    const next = index === 0 ? null : drafts[index - 1].node

    createPage({
      path: post.node.fields.slug,
      component: blogPost,
      context: {
        slug: post.node.fields.slug,
        previous,
        next,
        published: post.node.frontmatter.published,
      },
    })
  })
}

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions

  if (node.internal.type === `MarkdownRemark`) {
    const value = createFilePath({ node, getNode })
    createNodeField({
      name: `slug`,
      node,
      value,
    })
  }
}
