const dummy = blogs => 1;

const totalLikes = blogs => blogs.
    map(blog => blog.likes).
    reduce((operand1, operand2) => operand1 + operand2, 0);

module.exports = {
  dummy,
  totalLikes
};
