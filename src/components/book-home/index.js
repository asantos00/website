import React, { useState } from "react"
import { useStaticQuery, graphql } from "gatsby"
import styles from "./styles.module.css"

const BookHomePage = () => {
  const data = useStaticQuery(graphql`
    query BookHomeQuery {
      site {
        siteMetadata {
          bookLink
        }
      }
    }
  `)
  return (
    <div className={styles.wrapper}>
      <div class={styles.content}>
        <div class={styles.text}>
          <span className={styles.announcement}>
            I recently published a book!
          </span>
          <div className={styles.bookTitle}>
            <a href={data.site.siteMetadata.bookLink} target="_blank">
              Getting started with Deno
            </a>
          </div>
          <div className={styles.bookSubtitle}>
            Write, test, maintain and deploy JavaScript and TypeScript web
            applications using Deno
          </div>
          <div className={styles.buy}>
            <a href={data.site.siteMetadata.bookLink} target="_blank">
              BUY
            </a>
          </div>
        </div>
        <div className={styles.imageWrapper}>
          <a href={data.site.siteMetadata.bookLink} target="_blank">
            <img src="https://images-na.ssl-images-amazon.com/images/I/91mWpao7CWL.jpg" />
          </a>
        </div>
      </div>
    </div>
  )
}

export default BookHomePage
