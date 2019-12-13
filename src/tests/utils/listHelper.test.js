const listHelper = require("../../utils/listHelper");

test("dummy returns one", () => {
  const blogs = [];

  const result = listHelper.dummy(blogs);

  expect(result).toBe(1);
});

describe("total likes", () => {
  const listWithOneBlog = [
    {
      _id: "1",
      title: "Title 1",
      author: "Edsger W. Dijkstra",
      url: "http://title1.fi",
      likes: 5,
      __v: 0
    },
    {
      _id: "2",
      title: "Title 2",
      author: "Edsger W. Dijkstra",
      url: "http://title2.fi",
      likes: 4,
      __v: 0
    }
  ];

  test("when list has only one blog equals the likes of that", () => {
    const result = listHelper.totalLikes(listWithOneBlog);

    expect(result).toBe(9);
  });

  test("when list is empty", () => {
    const result = listHelper.totalLikes([]);

    expect(result).toBe(0);
  });

  test("when there is a blog with 0 likes", () => {
    const result = listHelper.totalLikes([
      {
        _id: "2",
        title: "Title 2",
        author: "Edsger W. Dijkstra",
        url: "http://title2.fi",
        likes: 0,
        __v: 0
      }
    ]);

    expect(result).toBe(0);
  });
});
