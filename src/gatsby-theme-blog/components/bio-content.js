import React, { Fragment } from "react"
import { Styled } from "theme-ui"
import { graphql, StaticQuery } from "gatsby"

/**
 * Change the content to add your own bio
 */

export default () => (
  <StaticQuery
    query={graphql`
      query MyQuery {
        site {
          siteMetadata {
            author
            description
            location {
              city
              country
            }
          }
        }
      }
    `}
    render={({ site: { siteMetadata }}) => (
      <Fragment>
        {console.log(siteMetadata)}
        {siteMetadata.author} - {siteMetadata.location.city}, {siteMetadata.location.country}
        <br />
        {siteMetadata.description}
      </Fragment>
    )}
  />
)
