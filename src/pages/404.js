import React from "react"

import Layout from "../components/layout"
import SEO from "../components/seo"

import css from './404.module.scss';

const NotFoundPage = () => (
  <Layout>
    <SEO title="404" />
    <main className={css.main}>
      <h1>NOT FOUND</h1>
      <p>You just hit a route that doesn&#39;t exist... oops.</p>
    </main>
  </Layout>
)

export default NotFoundPage
