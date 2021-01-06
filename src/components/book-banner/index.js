import React, { useState } from "react"
import { useStaticQuery, graphql } from "gatsby"
import styles from "./styles.module.css"

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
      <span>I recently published a book!</span>
      <span className={styles.bookTitle}>
        <a href={data.site.siteMetadata.bookLink} target="_blank">
          Getting started with Deno
        </a>
      </span>
    </div>
  )
}

export default BookBanner
