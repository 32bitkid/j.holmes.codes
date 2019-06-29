import React from "react";
import { Link, graphql } from 'gatsby';

import Layout from "../components/layout";
import ExternalLink from '../components/external-link';
import SEO from "../components/seo";

import css from './index.module.scss';

const AboutMe = () => (
  <div className={css.aboutMe}>
    <hgroup className={css.aboutMe__header}>
      <h1 >Hello!</h1>
      <h2>I{"\u2019"}m James&hellip;</h2>
    </hgroup>
    <p>
      I am a <em>developer</em> & <em>designer</em> with a focus in
      front-end architecture and interaction design. I have eclectic range
      of interests that currently include: <small>IoT</small> UI Design,
      80's vintage computers (IBM PC<em>jr</em>, Apple //e, C64),
      embedded computing, video codecs, and retro-styled pixel-art.
    </p>
    <p>
      Until mid-<small>2019</small> I was <small>Director of Innovation</small>{" "}
      at <ExternalLink href="https://niolabs.com">niolabs</ExternalLink>, where I
      developed prototypes, tools, and designs for future <small>IoT</small>{" "}
      development and deployment. To me, there isn't a line between engineering and design;
      I'm equally comfortable in <ExternalLink href="https://www.sketch.com/">Sketch</ExternalLink> as
      I'm in <ExternalLink href="https://www.sublimetext.com/">Sublime Text</ExternalLink>.
    </p>
    <p>
      You can find me doodling on <ExternalLink href="https://codepen.io/32bitkid">CodePen</ExternalLink>,
      helping developers on <ExternalLink href="https://stackoverflow.com/users/373378">StackOverflow</ExternalLink>,
      pushing code to <ExternalLink href="https://github.com/32bitkid">GitHub</ExternalLink>,
      or posting on <ExternalLink href="https://twitter.com/32bitkid">Twitter</ExternalLink> about
      my other hobbies/interests.
    </p>
    <p className={css.getInTouch}>
      &hellip;to get in touch, e-mail me at <a href="mailto:j@holmes.codes">j@holmes.codes</a>.
    </p>
  </div>
);

const Post = ({ fields, excerpt, frontmatter, timeToRead }) => {
  const style = {};
  if (frontmatter.tileColor) style.color = frontmatter.tileColor;
  return (
    <Link className={css.blog__post} to={fields.slug}>
      <h3 className={css.blog__title}>{frontmatter.title}</h3>
      <time dateTime={frontmatter.rawDate} className={css.blog__when}>{frontmatter.date}</time>
      <div className={css.blog__excerpt}>{ excerpt }</div>
      <div className={css.blog__ttr}>&hellip;about a {timeToRead} minute read</div>
    </Link>
  );
};

const Blog = ({posts}) => (
  <div className={css.blog}>
    <h2 className={css.blog__header}>thoughts&hellip;</h2>
    <ol className={css.blog__list}>
      { posts.map(({ node }) => <Post key={node.id} {...node} />)}
    </ol>
    <footer className={css.blog__more}><Link to="/blog">more posts</Link></footer>
  </div>
);

const SelectedProjects = () => (
  <div className={css.projects}>
    <h2 className={css.projects__header}>codes&hellip;</h2>
    <ul>
      <li className={css.project}>
        <iframe height="300" style={{width: "100%"}} scrolling="no" title="Quest For Glory II Disks"
                src="//codepen.io/32bitkid/embed/preview/BgwwgG/?height=300&theme-id=light&default-tab=result"
                frameBorder="no" allowtransparency="true" allowFullScreen={true}>
          See the Pen <a href='https://codepen.io/32bitkid/pen/BgwwgG/'>Quest For Glory II Disks</a> by James Holmes
          (<a href='https://codepen.io/32bitkid'>@32bitkid</a>) on <a href='https://codepen.io'>CodePen</a>.
        </iframe>
      </li>
      <li className={css.project}>
        <dl>
          <dt><ExternalLink href="https://github.com/32bitkid/mpeg">github.com/32bitkid/mpeg</ExternalLink></dt>
          <dd className={css.project__meta}>[Author] golang, video, mpeg-2</dd>
          <dd className={css.project__desc}>A <em>pure</em>-Go implementation of a MPEG-2 decoder.</dd>
        </dl>
      </li>
      <li className={css.project}>
        <dl>
          <dt><ExternalLink href="https://github.com/32bitkid/bitreader">github.com/32bitkid/bitreader</ExternalLink></dt>
          <dd className={css.project__meta}>[Author] golang, bits</dd>
          <dd className={css.project__desc}>Provides basic interfaces to read and traverse an io.Reader as a stream of bits, rather than a stream of bytes.</dd>
        </dl>
      </li>
      <li className={css.project}>
        <iframe height="300" style={{width: "100%"}} scrolling="no" title="Interactive 60% Keyboard"
                src="//codepen.io/32bitkid/embed/preview/LKZzMR/?height=300&theme-id=light&default-tab=result"
                frameBorder="no" allowtransparency="true" allowFullScreen={true}>
          See the Pen <a href='https://codepen.io/32bitkid/pen/LKZzMR/'>Interactive 60% Keyboard</a> by James Holmes
          (<a href='https://codepen.io/32bitkid'>@32bitkid</a>) on <a href='https://codepen.io'>CodePen</a>.
        </iframe>
      </li>
      <li className={css.project}>
        <dl>
          <dt><ExternalLink href="https://github.com/32bitkid/sci">github.com/32bitkid/sci</ExternalLink></dt>
          <dd className={css.project__meta}>[Author] Sierra On-Line, sci01, EGA</dd>
          <dd className={css.project__desc}>A small collection of utilities/structures for parsing and manipulating SCI0/SCI01 resources from classic Sierra adventure games.</dd>
        </dl>
      </li>
      <li className={css.project}>
        <dl>
          <dt><ExternalLink href="https://github.com/kefirjs/kefir">github.com/kefirjs/kefir</ExternalLink></dt>
          <dd className={css.project__meta}>[Contributor] JavaScript</dd>
          <dd className={css.project__desc}>A Reactive Programming library for JavaScript.</dd>
        </dl>
      </li>
      <li className={css.project}>
        <dl>
          <dt><ExternalLink href="https://github.com/gonum/gonum">github.com/gonum/gonum</ExternalLink></dt>
          <dd className={css.project__meta}>[Contributor] Go</dd>
          <dd className={css.project__desc}>Gonum is a set of numeric libraries for the Go programming language. It contains libraries for matrices, statistics, optimization, and more.</dd>
        </dl>
      </li>
      <li className={css.project}>
        <iframe height="300" style={{width: "100%"}} scrolling="no" title="10 PRINT CHR$(205.5+RND(1)); : GOTO 10"
                src="//codepen.io/32bitkid/embed/preview/agmYew/?height=300&theme-id=light&default-tab=result"
                frameBorder="no" allowtransparency="true" allowFullScreen={true}>
          See the Pen <a href='https://codepen.io/32bitkid/pen/agmYew/'>10 PRINT CHR$(205.5+RND(1)); : GOTO 10</a> by
          James Holmes
          (<a href='https://codepen.io/32bitkid'>@32bitkid</a>) on <a href='https://codepen.io'>CodePen</a>.
        </iframe>
      </li>
    </ul>
  </div>
);

export default ({ data }) => (
  <Layout>
    <AboutMe />
    <SEO title="Home" keywords={[`gatsby`, `application`, `react`]} />
    <Blog posts={data.md.posts} />
    <SelectedProjects/>
  </Layout>
);

// <Link to="/page-2/">Go to page 2</Link>

export const pageQuery = graphql`{
  md: allMarkdownRemark(sort: {fields: frontmatter___date, order: DESC}, limit: 7) {
    posts: edges {
      node {
        id
        fields {
          slug
        }
        frontmatter {
          tags
          date(formatString: "MMMM D, YYYY")
          rawDate: date(formatString: "YYYY-MM-DD")
          title
        }
        excerpt
        timeToRead
      }
    }
  }
}`;
