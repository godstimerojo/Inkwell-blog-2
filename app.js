const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

let nextPostId = 3;
let posts = [
  {
    id: 1,
    title: "A place for small ideas",
    body: "Inkwell is a deliberately simple space for writing. Start with a thought, give it a title, and let it find its shape.",
    createdAt: new Date("2026-08-30T09:00:00")
  },
  {
    id: 2,
    title: "Why keep a blog?",
    body: "Writing in public is a useful way to make your thinking clearer. It leaves a trail of questions, experiments, and moments worth returning to.",
    createdAt: new Date("2026-08-31T14:30:00")
  }
];

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

app.locals.formatDate = (date) => new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "long",
  year: "numeric"
}).format(date);

app.get("/", (req, res) => {
  res.render("index", { posts: [...posts].sort((a, b) => b.createdAt - a.createdAt) });
});

app.get("/posts/new", (req, res) => {
  res.render("form", { post: null, pageTitle: "Write a post", formAction: "/posts", submitLabel: "Publish post" });
});

app.post("/posts", (req, res) => {
  const title = req.body.title?.trim();
  const body = req.body.body?.trim();
  if (!title || !body) return res.status(400).render("form", { post: req.body, pageTitle: "Write a post", formAction: "/posts", submitLabel: "Publish post", error: "Please add both a title and the body of your post." });

  const post = { id: nextPostId++, title, body, createdAt: new Date() };
  posts.push(post);
  res.redirect(`/posts/${post.id}`);
});

app.get("/posts/:id", (req, res) => {
  const post = posts.find((item) => item.id === Number(req.params.id));
  if (!post) return res.status(404).render("not-found");
  res.render("post", { post });
});

app.get("/posts/:id/edit", (req, res) => {
  const post = posts.find((item) => item.id === Number(req.params.id));
  if (!post) return res.status(404).render("not-found");
  res.render("form", { post, pageTitle: "Edit post", formAction: `/posts/${post.id}/update`, submitLabel: "Save changes" });
});

app.post("/posts/:id/update", (req, res) => {
  const post = posts.find((item) => item.id === Number(req.params.id));
  if (!post) return res.status(404).render("not-found");
  const title = req.body.title?.trim();
  const body = req.body.body?.trim();
  if (!title || !body) return res.status(400).render("form", { post: { ...post, ...req.body }, pageTitle: "Edit post", formAction: `/posts/${post.id}/update`, submitLabel: "Save changes", error: "Please add both a title and the body of your post." });

  post.title = title;
  post.body = body;
  res.redirect(`/posts/${post.id}`);
});

app.post("/posts/:id/delete", (req, res) => {
  posts = posts.filter((item) => item.id !== Number(req.params.id));
  res.redirect("/");
});

app.use((req, res) => res.status(404).render("not-found"));

app.listen(PORT, () => console.log(`Inkwell is running at http://localhost:${PORT}`));
