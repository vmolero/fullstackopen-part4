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

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
};
