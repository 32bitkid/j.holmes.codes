const path = require("path")

exports.createPages = async ({ actions: { createPage }, graphql }) => {
  const result = await graphql(`{
    allMarkdownRemark(
      sort: { order: DESC, fields: [frontmatter___date] }
      limit: 1000
    ) {
      edges {
        node {
          fields {
            slug
          }
        }
      }
    }
  }`)

  if (result.errors) { throw result.errors }
  const blogPostTemplate = path.resolve('src', 'templates', 'post.js');
  result.data.allMarkdownRemark.edges.forEach(({ node }) => {
    createPage({
      path: node.fields.slug,
      component: blogPostTemplate,
      context: {
        slug: node.fields.slug,
      },
    });
  });
};

const dtSlug = (dt) => (
  dt.split(/[: T-]/)
    .map(i => (
      parseInt(i, 10)
        .toString(10)
        .padStart(2, '0')
    ))
    .splice(0, 3)
    .join('')
);

const { createFilePath } = require(`gatsby-source-filesystem`)
exports.onCreateNode = ({ node, getNode, actions }) => {
  if (node.internal.type === `MarkdownRemark`) {
    const { createNodeField } = actions;
    const title = node.frontmatter.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-');

    const date = dtSlug(node.frontmatter.date);
    // const slug = createFilePath({ node, getNode, basePath: `src/posts` });
    const slug = (date.length > 0 && title.length > 0) ?
      `/${date}-${title}/` :
      createFilePath({ node, getNode, basePath: `src/posts` });

    createNodeField({
      node,
      name: `slug`,
      value: slug,
    });
  }
}