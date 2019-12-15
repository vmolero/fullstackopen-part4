db.createUser({
  user: "root",
  pwd: "root",
  roles: [
    {
      role: "readWrite",
      db: "test"
    }
  ]
});
db.createCollection("test");
