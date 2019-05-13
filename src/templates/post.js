import React from "react"
import { graphql } from 'gatsby';
import { Helmet } from "react-helmet"
import Layout from "../components/layout";

import mdCss from './markdown.module.scss';

const Tag = ({tagName}) => (<li className={mdCss.tag}>{tagName}</li>);

const Tags = ({ tags }) => {
  const _tags = tags.flatMap((t, i) => [
    i !== 0 ? ", " : undefined,
    <Tag tagName={t} key={t}/>,
  ]);
  return (<ul className={mdCss.tags}>{_tags}</ul>);
}

export default function Template({ data }) {
  const { markdownRemark: post } = data;
  const { frontmatter, html } = post;
  const { title, date, formattedDate, tags } = frontmatter;

  return (
    <Layout>
      <Helmet
        title={title}
        titleTemplate={`%s @ ${data.site.siteMetadata.title}`}
      />
      <article className={mdCss.article}>
        <h1 className={mdCss.heading}>{title}</h1>
        <div className={mdCss.byline}>
          Posted on <time dateTime={date} className={mdCss.date}>{formattedDate}</time>
          { tags && <>{' in '}<Tags tags={tags.sort()} /></>}
          .
        </div>
        <section
          className={mdCss.content}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </article>
    </Layout>
  );
};

export const pageQuery = graphql`
  query BlogPostByPath($slug: String!) {
    site {
      siteMetadata {
        title
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      frontmatter {
        formattedDate: date(formatString: "MMMM D, YYYY")
        date
        title
        tags
      }
    }
  }
`;
