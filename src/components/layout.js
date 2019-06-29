/**
 * Layout component that queries for data
 * with Gatsby's StaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/static-query/
 */

import React from "react"
import PropTypes from "prop-types"
import { StaticQuery, graphql } from "gatsby"

import Header from "./header"
import "./layout.scss"
import footerCss from './footer.module.scss';
import ExternalLink from './external-link';

const Layout = ({ children, className }) => (
  <StaticQuery
    query={graphql`
      query SiteTitleQuery {
        site {
          siteMetadata {
            title
          }
        }
      }
    `}
    render={data => (
      <>
        <Header siteTitle={data.site.siteMetadata.title} />
        {children}
        <footer className={footerCss.footer}>
          <div>
            &copy; <small>2013&ndash;{(new Date()).getFullYear()} J. Holmes</small>.
            Built with <ExternalLink href="https://www.gatsbyjs.org">Gatsby</ExternalLink>.
          </div>
        </footer>
      </>
    )}
  />
)

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
