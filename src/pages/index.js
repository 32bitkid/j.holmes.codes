import React from "react";
import { Link, graphql } from 'gatsby';

import Layout from "../components/layout";
import ExternalLink from '../components/external-link';
import SEO from "../components/seo";

import css from './index.module.scss';

const Post = ({ fields, frontmatter, timeToRead }) => {
  const style = {};
  if (frontmatter.tileColor) style.color = frontmatter.tileColor;
  return (
    <article className={css.item}>
      <Link className={css.post} to={fields.slug}>
        <div className={css.when}>{frontmatter.date}</div>
        <div className={css.title}>{frontmatter.title}</div>
        <div className={css.ttr}>about a {timeToRead} minute read</div>
      </Link>
    </article>
  );
};

const AboutMe = () => (
  <div className={css.aboutMe}>
    <h1 className={css.aboutMe__header}><small>Hi!</small> I am James&hellip;</h1>
    <p>
      I am <em>developer</em> & <em>designer</em> with a focus in
      front-end architecture and interaction design. I have an eclectic range
      of interests that currently include: <small>IoT</small> User-Interface Design,
      vintage-computing (<small>Intel&#x2009;8088</small>, <small>Mos&#x2009;6510</small>),
      video codecs, and retro-game development.
    </p>
    <p>
      Until mid-<small>2019</small>, I was <em>Director of Innovation</em>{" "}
      at <ExternalLink href="niolabs.com">niolabs</ExternalLink> where I
      developed the tools and designs for future <small>IoT</small>-development and
      prototypes for <small>IoT</small>-UX patterns and challenges. Often, I straddle the line
      between engineering and design; equally comfortable in{" "}
      <ExternalLink href="https://www.sketch.com/">Sketch</ExternalLink> as I
      am in <ExternalLink href="https://www.sublimetext.com/">Sublime
      Text</ExternalLink>.
    </p>
    <p>
      You can find me sketching
      designs on <ExternalLink href="https://codepen.io/32bitkid">CodePen</ExternalLink>,
      helping developers on <ExternalLink href="https://stackoverflow.com/users/373378">StackOverflow</ExternalLink>,
      pushing code to <ExternalLink href="https://github.com/32bitkid">GitHub</ExternalLink>,
      or posting on <ExternalLink href="https://twitter.com/32bitkid">Twitter</ExternalLink> about
      my other hobbies/interests (breadcraft, woodworking, pixel-art, retro-development, music, and painting)
    </p>
    <p>
      &hellip;to get in touch, e-mail me at <a href="mailto:j@holmes.codes">j@holmes.codes</a>.
    </p>
  </div>
);

const Blog = ({posts}) => (
  <div className={css.blog}>
    <header className={css.blog__header}>recent thoughts&hellip;</header>
    <div className={css.blog__wrapper}>
      { posts.map(({ node }) => <Post key={node.id} {...node} />)}
    </div>
    <footer className={css.blog__more}><Link to="/blog">more posts&hellip;</Link></footer>
  </div>
);

const SelectProjects = () => (
  <div className={css.projects}>
    <header className={css.projects__header}>select code&hellip;</header>
    <ul>
      <li>
        <dl>
          <dt><ExternalLink href="https://codepen.io/32bitkid/pen/BgwwgG">Quest For Glory II Disks</ExternalLink></dt>
          <dd>
            <iframe height="400" style={{width: "100%"}} scrolling="no" title="Quest For Glory II Disks"
                    src="//codepen.io/32bitkid/embed/preview/BgwwgG/?height=400&theme-id=light&default-tab=result"
                    frameBorder="no" allowTransparency="true" allowFullScreen="true">
              See the Pen <a href='https://codepen.io/32bitkid/pen/BgwwgG/'>Quest For Glory II Disks</a> by James Holmes
              (<a href='https://codepen.io/32bitkid'>@32bitkid</a>) on <a href='https://codepen.io'>CodePen</a>.
            </iframe>
          </dd>
          <dd>Tribute to the classic designs of the 80's and 90's Sierra On-Line adventure game releases.</dd>
        </dl>
      </li>
      <li>
        <dl>
          <dt><ExternalLink href="https://github.com/32bitkid/mpeg">github.com/32bitkid/mpeg</ExternalLink></dt>
          <dd>Author | golang, video, mpeg-2</dd>
          <dd>A <em>pure</em>-Go implementation of a MPEG-2 decoder.</dd>
        </dl>
      </li>
      <li>
        <dl>
          <dt><ExternalLink href="https://github.com/32bitkid/bitreader">github.com/32bitkid/bitreader</ExternalLink></dt>
          <dd>Author | golang, bits</dd>
          <dd>Provides basic interfaces to read and traverse an io.Reader as a stream of bits, rather than a stream of bytes.</dd>
        </dl>
      </li>
      <li>
        <dl>
          <dt><ExternalLink href="https://codepen.io/32bitkid/pen/LKZzMR">Interactive 60% Keyboard</ExternalLink></dt>
          <dd>
            <iframe height="400" style={{width: "100%"}} scrolling="no" title="Interactive 60% Keyboard"
                    src="//codepen.io/32bitkid/embed/preview/LKZzMR/?height=400&theme-id=light&default-tab=result"
                    frameBorder="no" allowTransparency="true" allowFullScreen="true">
              See the Pen <a href='https://codepen.io/32bitkid/pen/LKZzMR/'>Interactive 60% Keyboard</a> by James Holmes
              (<a href='https://codepen.io/32bitkid'>@32bitkid</a>) on <a href='https://codepen.io'>CodePen</a>.
            </iframe>
          </dd>
        </dl>
      </li>
      <li>
        <dl>
          <dt><ExternalLink href="https://github.com/32bitkid/sci">github.com/32bitkid/sci</ExternalLink></dt>
          <dd>Author | sierra, sci-0, EGA</dd>
          <dd>A small collection of utilities/structures for parsing and manipulating <small>sci-0</small> resources from classic Sierra adventure games.</dd>
        </dl>
      </li>
      <li>
        <dl>
          <dt><ExternalLink href="https://github.com/kefirjs/kefir">github.com/kefirjs/kefir</ExternalLink></dt>
          <dd>Contributor | JavaScript</dd>
          <dd>A Reactive Programming library for JavaScript.</dd>
        </dl>
      </li>
      <li>
        <dl>
          <dt><ExternalLink href="https://github.com/gonum/gonum">github.com/gonum/gonum</ExternalLink></dt>
          <dd>Contributor | Go</dd>
          <dd>Gonum is a set of numeric libraries for the Go programming language. It contains libraries for matrices, statistics, optimization, and more.</dd>
        </dl>
      </li>
      <li>
        <dd>
          <dt><ExternalLink href="https://codepen.io/32bitkid/pen/agmYew">Interactive 60% Keyboard</ExternalLink></dt>
          <iframe height="400" style={{width: "100%"}} scrolling="no" title="10 PRINT CHR$(205.5+RND(1)); : GOTO 10"
                  src="//codepen.io/32bitkid/embed/preview/agmYew/?height=400&theme-id=light&default-tab=result"
                  frameBorder="no" allowTransparency="true" allowFullScreen="true">
            See the Pen <a href='https://codepen.io/32bitkid/pen/agmYew/'>10 PRINT CHR$(205.5+RND(1)); : GOTO 10</a> by
            James Holmes
            (<a href='https://codepen.io/32bitkid'>@32bitkid</a>) on <a href='https://codepen.io'>CodePen</a>.
          </iframe>
        </dd>
        <dd>Tribute to the classic Commodore 64 BASIC one-liner. .</dd>
      </li>
    </ul>
  </div>
);

export default ({ data }) => (
  <Layout>
    <AboutMe />
    <SEO title="Home" keywords={[`gatsby`, `application`, `react`]} />
    <Blog posts={data.md.posts} />
    <SelectProjects/>
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
          title
        }
        timeToRead
      }
    }
  }
}`;