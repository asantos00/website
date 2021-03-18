import React from "react"
import {graphql} from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"
import Bio from "../components/bio"

const About = ({data, location}) => {
  const { title, siteUrl } = data.site.siteMetadata


  return (
    <Layout location={location} title={title}>
      <SEO
        url={`${siteUrl}/about-me`}
        title={title}
      />
      <h1>About me</h1>
      <Bio />
      <p>
        Alexandre Portela dos Santos is a software engineer passionate about products and startups. For the last 8+ years he's been working together with multiple companies, using technology as an enabler for ideas and businesses.
      </p>
      <p>
        With a big interest in education and getting people excited about technology, he makes sure he's always involved with people that are learning about it, being it via blog posts, books, open source contributions, or meetups. This is, by itself, a learning adventure that Alexandre loves to be a part of.
      </p>
      <p>
        Being a true believer that great software only happens through collaboration, ownership, and teams of great people, he strives to nurture those values in every project he works in.
      </p>
    </Layout>
  )
}

export default About

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
        siteUrl
      }
    }
  }
`
