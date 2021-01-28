import React from "react"
import styles from "./getting-started-with-deno.module.css"
import { useStaticQuery, graphql } from "gatsby"

const DenoWebDevelopment = () => {
  const data = useStaticQuery(graphql`
    query BookGettingStartedQuery {
      site {
        siteMetadata {
          bookLink
        }
      }
    }
  `)
  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.logoWrapper}>
          <img src="https://deno.land/logo.svg" alt="deno logo" />
          <div>Deno</div>
        </div>
        <div className={styles.websiteWrapper}>
          <span>
            <a href="https://alexandrempsantos.com">alexandrempsantos.com</a>
          </span>
        </div>
      </header>
      <div className={styles.bookWrapper}>
        <div className={styles.textCoverWrapper}>
          <div className={styles.bookText}>
            <h1>Deno Web Development</h1>
            <h2>
              Write, test, maintain JavaScript and TypeScript web applications
              using Deno
            </h2>
            <a
              href={data.site.siteMetadata.bookLink}
              className={styles.buyButton}
            >
              Buy
            </a>
          </div>
          <img
            className={styles.bookCover}
            src="https://images-na.ssl-images-amazon.com/images/I/91mWpao7CWL.jpg"
            alt="Deno Web Development book cover"
          />
        </div>
        <div></div>
      </div>
      <div className={styles.theBookWrapper}>
        <h3>The book</h3>
        <div>
          A complete guide with step-by-step explanations of Deno’s primitives,
          using them to build real-word applications.
        </div>
        <h4>Key takeaways</h4>
        <ul>
          <li>Understand Deno’s essential concepts and features</li>
          <li>Learn how to use Deno in real-world scenarios</li>
          <li>Use Deno to develop, test and deploy web applications</li>
        </ul>
        <h4>Table of contents</h4>
        <div className={styles.tableOfContents}>
          <span className={styles.tableSection}>I - Introduction</span>
          <span className={styles.tableItem}>1. What is Deno?</span>
          <span className={styles.tableItem}>2. The toolchain</span>
          <span className={styles.tableItem}>
            3. Runtime and standard library
          </span>
          <span className={styles.tableSection}>
            II - Building an application
          </span>
          <span className={styles.tableItem}>
            4. Building a web application
          </span>
          <span className={styles.tableItem}>
            5. Adding users and migrating to oak
          </span>
          <span className={styles.tableItem}>
            6. Authentication and connecting to the database
          </span>
          <span className={styles.tableItem}>
            7. HTTPS, configuration and Deno on the browser
          </span>
          <span className={styles.tableSection}>
            III - Testing and deploying
          </span>
          <span className={styles.tableItem}>
            8. Testing - Unit and integration
          </span>
          <span className={styles.tableItem}>
            9. Deploying a Deno application
          </span>
          <span className={styles.tableItem}>10. What's next?</span>
        </div>
        <hr />
        <h3>Tell me more...</h3>
        <div>
          <p>
            Deno is a JavaScript/TypeScript runtime with secure defaults and a
            great developer experience.
          </p>
          <p>
            “Deno Web Development” will introduce Deno’s primitives, its
            principles, and how developers can use it to build real-world
            applications.
            <br />
            The book is divided into three main sections: introducing Deno,
            building an API from scratch, and testing and deploying a Deno
            application. <br />
            The first chapters present the runtime and the motivations behind
            its creation. It explores some of the concepts introduced by Node,
            why many of them transitioned into Deno, and why new features were
            introduced.
            <br />
            After getting comfortable with Deno and why it was created, the
            reader will start to experiment with Deno, exploring the toolchain,
            and writing simple scripts and CLI applications.
            <br />
            As we transition in the second section of the book, the reader will
            start with a very simple web application and will slowly add more
            features to it.
            <br />
            This application will evolve from a simple "hello world" API to a
            web application connected to the database, with users,
            authentication, and a JavaScript.
            <br />
            By the end of it, the reader will be comfortable using Deno to build
            real-world applications.
          </p>
        </div>
      </div>
      <div className={styles.theAuthor}>
        <h3>The author</h3>
        <div className={styles.authorPhotoWrapper}>
          <div>
            <span>Alexandre Portela dos Santos</span>
            <div>Tech lead / Engineering Manager @ KI labs</div>
          </div>
          <div className={styles.authorPhoto}>
            <img src="https://alexandrempsantos.com/static/97261386c948f2ea3d3b1212a37bb449/f1b5a/profile-pic.jpg" />
          </div>
        </div>
        <p>
          Alexandre Portela dos Santos is a software engineer passionate about
          products and startups. <br />
          For the last 8+ years he's been working together with multiple
          companies, using technology as an enabler for ideas and businesses.
          <br />
          With a big interest in education and getting people excited about
          technology, he makes sure he's always involved with people that are
          learning about it, being it via blog posts, books, open source
          contributions, or meetups. This is, by itself, a learning adventure
          that Alexandre loves to be a part of.
          <br />
          Being a true believer that great software only happens through
          collaboration, ownership, and teams of great people, he strives to
          nurture those values in every project he works in.
        </p>
        <div className={styles.contacts}>
          <a href="https://www.linkedin.com/in/alexandrempsantos/">LinkedIn</a>|
          <a href="https://github.com/asantos00">GitHub</a>|
          <a href="https://twitter.com/ampsantos0">Twitter</a>|
          <a href="https://alexandrempsantos.com">Blog</a>
        </div>
      </div>
      <div className={styles.questions}>
        <h3 className={styles.inverted}>Questions?</h3>
        <p>
          Email me at{" "}
          <a href="mailto:alexandre.santozz@gmail.com">
            alexandre.santozz@gmail.com
          </a>
        </p>
        <span className={styles.copywright}>
          Alexandre Portela dos Santos © {new Date().getFullYear()}
        </span>
      </div>
      <main className={styles.mainWrapper}></main>
    </div>
  )
}

export default DenoWebDevelopment
