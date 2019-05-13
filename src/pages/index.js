import React from "react";

import { Link, graphql } from 'gatsby';

import Layout from "../components/layout";
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
}

const Blog = ({posts}) => (
  <div className={css.blog}>
    <header className={css.blog__header}>Recent thoughts&hellip;</header>
    <div className={css.blog__wrapper}>
      { posts.map(({ node }) => <Post key={node.id} {...node} />)}
    </div>
    <footer className={css.blog__more}><Link to="/blog">more&hellip;</Link></footer>
  </div>
)

export default ({ data }) => (
  <Layout>
    <SEO title="Home" keywords={[`gatsby`, `application`, `react`]} />
    <Blog posts={data.md.posts} />
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