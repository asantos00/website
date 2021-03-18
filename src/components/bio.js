/**
 * Bio component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from "react"
import {useStaticQuery, graphql, Link} from "gatsby"
import Image from "gatsby-image"

import {rhythm} from "../utils/typography"

const Bio = () => {
  const data = useStaticQuery(graphql`
    query BioQuery {
      avatar: file(absolutePath: { regex: "/profile-pic.jpg/" }) {
        childImageSharp {
          fixed(width: 50, height: 50) {
            ...GatsbyImageSharpFixed
          }
        }
      }
      site {
        siteMetadata {
          author
          description
          location {
            city
            country
          }
          social {
            name
            url
          }
        }
      }
    }
  `)

  const {author, social, description, location} = data.site.siteMetadata
  return (
    <div
      style={{
        display: `flex`,
        marginBottom: rhythm(2.5),
      }}
    >
      <Image
        fixed={data.avatar.childImageSharp.fixed}
        alt={author}
        style={{
          marginRight: rhythm(1 / 2),
          marginBottom: 0,
          minWidth: 50,
          borderRadius: `100%`,
        }}
        imgStyle={{
          borderRadius: `50%`,
        }}
      />
      <p>
        {author} - {location.city}, {location.country}
        <br />
        {description}
        <br />
        <Link to="/about-me">
          about me
        </Link>
        {social.map(social => (
          <React.Fragment>
            {' | '}
            <a href={social.url}>{social.name}</a>
          </React.Fragment>
        ))}
      </p>
    </div>
  )
}

export default Bio
