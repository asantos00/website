import React, { useState } from "react"
import { useStaticQuery, graphql } from "gatsby"
import styles from "./styles.module.css"

const registerEvent = place => {
  // eslint-disable-next-line
  ga("send", {
    hitType: "event",
    eventCategory: "book",
    eventAction: "click",
    eventLabel: `post.${place}`,
  })
}

const BookBanner = () => {
  const data = useStaticQuery(graphql`
    query BookBannerQuery {
      site {
        siteMetadata {
          bookLink
        }
      }
    }
  `)
  return (
    <div className={styles.wrapper}>
      <span>I recently published a book, </span>
      <span className={styles.bookTitle}>
        <a
          onClick={() => registerEvent("title")}
          href={data.site.siteMetadata.bookLink}
          target="_blank"
        >
          Deno Web Development
        </a>
      </span>
    </div>
  )
}

export default BookBanner
