import { Link } from "gatsby"
import PropTypes from "prop-types"
import React from "react"

import ExternalLink from './external-link';
import css from './header.module.scss';

const Header = ({ siteTitle }) => (
  <header className={css.header}>
    <nav>
      <Link className={css.home} to="/">{siteTitle}</Link>
      {/*<ExternalLink className={css.youtube} href="https://youtube.com/j.holmes.codes">YouTube</ExternalLink>*/}
      {/*<ExternalLink className={css.twitch} href="https://twitch.com/j.holmes.codes">Twitch</ExternalLink>*/}
      {/*<div className={css.sep} />*/}
      <ExternalLink className={css.codepen} href="https://codepen.io/32bitkid">CodePen</ExternalLink>
      <ExternalLink className={css.github} href="https://github.com/32bitkid">GitHub</ExternalLink>
      <ExternalLink className={css.stackoverflow} href="https://stackoverflow.com/users/373378">StackOverflow</ExternalLink>
      <div className={css.sep}/>
      <ExternalLink className={css.twitter} href="https://twitter.com/32bitkid">Twitter</ExternalLink>
      <ExternalLink className={css.linkedin} href="https://www.linkedin.com/in/jamesandrewholmes/">LinkedIn</ExternalLink>
    </nav>
  </header>
)

Header.propTypes = {
  siteTitle: PropTypes.string,
}

Header.defaultProps = {
  siteTitle: ``,
}

export default Header
