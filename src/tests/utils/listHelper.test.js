const listHelper = require("../../utils/listHelper");

test("dummy returns one", () => {
  const blogs = [];

  const result = listHelper.dummy(blogs);

  expect(result).toBe(1);
});

describe("total likes", () => {
  test("when list has only one blog equals the likes of that", () => {
    const result = listHelper.totalLikes([
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
    ]);

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

describe("4.5*: helper functions and unit tests, step3 (favoriteBlog)", () => {
  test("when there is no favorite at all", () => {
    const result = listHelper.favoriteBlog([
      {
        _id: "2",
        title: "Title 2",
        author: "Edsger W. Dijkstra",
        url: "http://title2.fi",
        likes: 0,
        __v: 0
      }
    ]);

    expect(result).toEqual({});
  });

  test("when there is only 1 favorite", () => {
    const result = listHelper.favoriteBlog([
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
        likes: 7,
        __v: 0
      }
    ]);

    expect(result).toEqual({
      _id: "2",
      title: "Title 2",
      author: "Edsger W. Dijkstra",
      url: "http://title2.fi",
      likes: 7,
      __v: 0
    });
  });
});

describe("4.6*: helper functions and unit tests, step4 (mostBlogs)", () => {
  test("when there is none", () => {
    const result = listHelper.mostBlogs([]);

    expect(result).toEqual({
      name: "Nobody",
      blogs: 0
    });
  });

  test("when there are two authors and three blogs", () => {
    const result = listHelper.mostBlogs([
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
      },
      {
        _id: "3",
        title: "Title 3",
        author: "Barbara Liskov",
        url: "http://title3.fi",
        likes: 4,
        __v: 0
      }
    ]);

    expect(result).toEqual({
      name: "Edsger W. Dijkstra",
      blogs: 2
    });
  });
});
