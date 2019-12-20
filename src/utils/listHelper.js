const _ = require('lodash');

const dummy = blogs => 1;

const totalLikes = blogs =>
  blogs
    .map(blog => blog.likes)
    .reduce((operand1, operand2) => operand1 + operand2, 0);

const favoriteBlog = blogs => {
  let maxLikes = 0,
    mostLikedBlog = {};

  for (let index = 0; index < blogs.length; index += 1) {
    const blog = blogs[index];

    if (blog.likes > maxLikes) {
      mostLikedBlog = blog;
      maxLikes = blog.likes;
    }
  }

  return mostLikedBlog;
};

const mostBlogs = blogs => {
  let name = 'Nobody';
  let writtenBlogs = 0;

  if (blogs.length === 0) {
    return { name, blogs: writtenBlogs };
  }

  const groupedByAuthor = _.groupBy(blogs, 'author');

  return _.reduce(
    groupedByAuthor,
    (carry, blogList, author) => {
      if (blogList.length > carry.blogs) {
        return {
          name: author,
          blogs: blogList.length
        };
      }
      return carry;
    },
    { name, blogs: writtenBlogs }
  );
};

const mostLikes = blogs => {
  let author = 'Nobody';
  let likes = 0;

  if (blogs.length === 0) {
    return { author, likes };
  }

  const groupedByAuthor = _.groupBy(blogs, 'author');

  return _.reduce(
    groupedByAuthor,
    (carry, blogList, blogAuthor) => {
      const blogLikes = _.sumBy(blogList, 'likes');

      if (blogLikes > carry.likes) {
        return {
          author: blogAuthor,
          likes: blogLikes
        };
      }
      return carry;
    },
    { author, likes }
  );
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
};
