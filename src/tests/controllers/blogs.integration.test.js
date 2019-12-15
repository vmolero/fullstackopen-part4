const _ = require("lodash");
const supertest = require("supertest");
const mongoose = require("mongoose");
const app = require("../../app");
const Blog = require("../../models/Blog");
const testHelper = require("../testHelper");
const api = supertest(app);

describe("Blog routes IntegrationTests", () => {
  beforeEach(async () => {
    await Blog.deleteMany({});

    await Promise.all(
      testHelper.initialBlogEntries.map(entry => {
        const blogObject = new Blog(entry);

        return blogObject.save();
      })
    );
  });

  afterAll(async () => {
    await Blog.deleteMany({});
    mongoose.connection.close();
  });

  describe("GET /api/blogs", () => {
    test("when the database is empty", async () => {
      await Blog.deleteMany({});
      const result = await api
        .get("/api/blogs")
        .expect(200)
        .expect("Content-Type", /application\/json/u);

      expect(result.body).toEqual([]);
    });

    test("when database contains data", async () => {
      const result = await api.get("/api/blogs");

      expect(result.body.length).toBe(6);
    });

    test("that blog entries are correct", async () => {
      const result = await api.get("/api/blogs");

      result.body.forEach(blog => {
        const entry = _.omit(blog, ["id"]);

        expect(testHelper.initialBlogEntries).toContainEqual(entry);
      });
    });

    test("4.9*: Blog list tests, step2 (there is an id attribute)", async () => {
      const result = await api.get("/api/blogs");

      expect(result.body[0].id).toBeDefined();
    });
  });

  describe("GET /api/blogs", () => {
    test("4.10: Blog list tests, step3 (POST /api/blogs)", async () => {
      const newEntry = {
        title: "I love lego train",
        author: "Daniel Molero",
        url: "http://daniel-molero.com/blog/",
        likes: 7
      };
      const blogsInitialLength = (await Blog.find({})).length;

      const result = await api.post("/api/blogs").send(newEntry);

      expect(result.body.id).toBeDefined();
      const blog = (await Blog.findById(result.body.id)).toJSON();

      expect(_.omit(blog, "id")).toEqual(newEntry);
      const blogsFinalLength = (await Blog.find({})).length;

      expect(blogsFinalLength).toBe(blogsInitialLength + 1);
    });
  });
});
