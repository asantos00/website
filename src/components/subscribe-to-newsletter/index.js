import React, { useState } from "react"
import addToMailchimp from "gatsby-plugin-mailchimp"
import styles from "./styles.module.css"

const STATUS = {
  NOT_SUBMITTED: "not-submitted",
  SUCCESS: "sucess",
  LOADING: "loading",
  ERROR: "error",
}

const SubscribeToNewsletter = () => {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState(STATUS.NOT_SUBMITTED)
  const subscribe = async () => {
    setStatus(STATUS.LOADING)
    try {
      await addToMailchimp(email)
      setStatus(STATUS.SUCCESS)
    } catch (e) {
      setStatus(STATUS.ERROR)
    }
  }

  const isSuccess = status === STATUS.SUCCESS
  const isLoading = status === STATUS.LOADING

  return (
    <div id="subscribe-to-my-newsletter">
      <h2>Get a once-a-month digest of my posts</h2>
      <p>
        No worries, I will{" "}
        <span className={styles.bold}>
          not send more than 1 email per month
        </span>
        , and I'll mail you only when there's new content.
        <br></br>
      </p>
      {isSuccess ? (
        <p>Thank you, I appreciate it! 🙌</p>
      ) : (
        <div
          className={[styles.wrapper, isLoading ? styles.isLoading : ""].join(
            " "
          )}
        >
          <input
            className={styles.input}
            type="text"
            placeholder="Your email"
            onKeyUp={e => setEmail(e.target.value)}
          />
          <button className={styles.button} onClick={subscribe}>
            Sign me up!
          </button>
        </div>
      )}
    </div>
  )
}

export default SubscribeToNewsletter
