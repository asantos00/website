import React from "react"
import { graphql } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"
import Bio from "../components/bio"

const About = ({ data, location }) => {
  const { title, siteUrl } = data.site.siteMetadata

  return (
    <Layout location={location} title={title}>
      <SEO url={`${siteUrl}/about-me`} title={"about me"} />
      <h1>About me</h1>
      <Bio />
      <p>Hello! I'm Alexandre,</p>
      <p>
        I'm a software engineer passionate about products and startups. For the
        last 8+ years I've been working together with multiple companies, using
        technology as an enabler for ideas and businesses.
      </p>
      <p>
        With a big interest in education and getting people excited about
        technology, I make sure I'm always involved with people that are
        learning about it, being it via blog posts, books, hackathons,
        open-source contributions, or meetups. This is, by itself, a learning
        adventure that I love to be a part of.
      </p>
      <p>
        I'm a true believer that great software only happens through
        collaboration, ownership, and teams of great people, that's why I strive
        to nurture those values in every project/team I work in.
      </p>
      <p>
        Let me tell you I'd be very happy to get to know you and hear about your
        best ideas, who knows we can do something amazing together!
      </p>
      <p>Alexandre</p>
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
