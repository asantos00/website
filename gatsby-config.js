module.exports = {
  plugins: [
    {
      resolve: `gatsby-theme-blog`,
      options: {},
    },
  ],
  // Customize your site metadata:
  siteMetadata: {
    title: `learning as we go`,
    author: `Alexandre Santos`,
    description: `Helping people solving problems. Software developer, learner, reader, writer`,
    location: {
      city: "Lisbon",
      country: "Portugal",
    },
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
  },
}
