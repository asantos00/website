module.exports = {
  siteMetadata: {
    title: `learning as we go`,
    author: `Alexandre Portela dos Santos`,
    description: `Helping businesses with tech | Business and product enthusiast | Author`,
    siteDescription: `A blog about the learning journey of a software engineer interested in solving business challenges using technology.`,
    location: {
      city: "Ericeira",
      country: "Portugal",
    },
    siteUrl: "https://alexandrempsantos.com",
    social: [
      {
        name: `twitter`,
        url: `https://twitter.com/ampsantos0`,
      },
      {
        name: `github`,
        url: `https://github.com/asantos00`,
      },
      {
        name: `linkedin`,
        url: `https://www.linkedin.com/in/alexandrempsantos/`,
      },
    ],
    bookLink:
      "https://www.amazon.com/Deno-Web-Development-JavaScript-applications-ebook/dp/B08PDF5F16",
  },
  plugins: [
    {
      resolve: `gatsby-plugin-canonical-urls`,
      options: {
        siteUrl: `https://alexandrempsantos.com`,
      },
    },
    `gatsby-plugin-robots-txt`,
    {
      resolve: `gatsby-plugin-sitemap`,
      options: {
        sitemapSize: 5000,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/blog`,
        name: `blog`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/assets`,
        name: `assets`,
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          "gatsby-remark-reading-time",
          {
            resolve: "@weknow/gatsby-remark-twitter",
            options: {
              align: "center",
            },
          },
          {
            resolve: "gatsby-remark-external-links",
            options: {
              target: "_blank",
              rel: "nofollow",
            },
          },
          {
            resolve: "gatsby-remark-embed-gist",
            options: {
              username: "asantos00",
              includeDefaultCss: true,
            },
          },
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 1100,
            },
          },
          {
            resolve: `gatsby-remark-responsive-iframe`,
            options: {
              wrapperStyle: `margin-bottom: 1.0725rem`,
            },
          },
          {
            resolve: "gatsby-remark-autolink-headers",
            options: {
              offsetY: 54,
            },
          },
          {
            resolve: "gatsby-plugin-mailchimp",
            options: {
              endpoint:
                "https://alexandrempsantos.us10.list-manage.com/subscribe/post?u=37acc8aa08566077588f03991&amp;id=70433914cd", // string; add your MC list endpoint here; see instructions below
            },
          },
          `gatsby-remark-prismjs`,
          `gatsby-remark-copy-linked-files`,
          `gatsby-remark-smartypants`,
          `gatsby-plugin-catch-links`,
        ],
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: `UA-81851050-1`,
      },
    },
    {
      resolve: `gatsby-plugin-feed`,
      options: {
        query: `
          {
            site {
              siteMetadata {
                title
                description
                siteUrl
                site_url: siteUrl
              }
            }
          }
        `,
        feeds: [
          {
            query: `
              {
                allMarkdownRemark(
                  sort: { order: DESC, fields: [frontmatter___date] },
      filter: { frontmatter: { published: { eq: true } } }
                ) {
                  edges {
                    node {
                      excerpt
                      html
                      fields { slug }
                      frontmatter {
                        title
                        date
                      }
                    }
                  }
                }
              }
            `,
            output: "/rss.xml",
            title: "alexandrempsantos.com rss feed",
          },
        ],
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `learning as we go`,
        short_name: `lawg`,
        start_url: `/`,
        background_color: `#ffffff`,
        theme_color: `#663399`,
        display: `minimal-ui`,
        icon: `content/assets/favicon.png`,
      },
    },
    `gatsby-plugin-offline`,
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-plugin-typography`,
      options: {
        pathToConfigModule: `src/utils/typography`,
      },
    },
  ],
}
