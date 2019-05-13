import React from "react";

import { Link, graphql } from 'gatsby';

import Layout from "../components/layout";
import SEO from "../components/seo";

import css from './blog.module.scss';

const Post = ({ fields, frontmatter, timeToRead, excerpt }) => {
  const style = {};
  if (frontmatter.tileColor) style.color = frontmatter.tileColor;
  return (
    <li className={css.item}>
      <div className={css.when}>{frontmatter.date}</div>
      <div className={css.title}><Link to={fields.slug}>{frontmatter.title}</Link></div>
      <p className={css.excerpt}>{excerpt}</p>
      <div className={css.cont}><Link to={fields.slug}>continue reading</Link></div>
    </li>
  );
}

const BlogList = ({posts}) => (
  <ol className={css.blog}>
    { posts.map(({ node }) => <Post key={node.id} {...node} />)}
  </ol>
)

export default ({ data }) => (
  <Layout>
    <SEO title="Home" keywords={[`gatsby`, `application`, `react`]} />
    <BlogList posts={data.md.posts} />
  </Layout>
);

// <Link to="/page-2/">Go to page 2</Link>

export const pageQuery = graphql`{
  md: allMarkdownRemark(sort: {fields: frontmatter___date, order: DESC}) {
    posts: edges {
      node {
        id
        fields {
          slug
        }
        excerpt
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