require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const schema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, trim: true, maxlength: 1000, default: "" },
  status: { type: String, enum: ["Pending", "In Progress", "Completed"], default: "Pending" },
  priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
  dueDate: { type: Date, default: null }
}, { timestamps: true });
const Task = mongoose.model("Task", schema);
const validStatus = s => ["Pending", "In Progress", "Completed"].includes(s);
const validPriority = s => ["Low", "Medium", "High"].includes(s);
const formatDate = d => d ? new Date(d).toISOString().slice(0, 10) : "";

app.get("/", async (req, res) => {
  try {
    const filter = {};
    if (validStatus(req.query.status)) filter.status = req.query.status;
    const search = (req.query.search || "").trim();
    if (search) filter.title = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    const [tasks, all] = await Promise.all([Task.find(filter).sort({ createdAt: -1 }).lean(), Task.find().lean()]);
    res.render("index", {
      tasks, search, selectedStatus: req.query.status || "", formatDate, error: req.query.error || "",
      counts: { total: all.length, pending: all.filter(t => t.status === "Pending").length,
        progress: all.filter(t => t.status === "In Progress").length, completed: all.filter(t => t.status === "Completed").length }
    });
  } catch (e) { console.error(e); res.status(500).send("Could not load tasks. Check your MongoDB connection."); }
});
app.post("/tasks", async (req, res) => {
  try {
    const { title, description, priority, dueDate } = req.body;
    if (!title || !title.trim()) return res.redirect("/?error=Please+enter+a+task+title");
    await Task.create({ title: title.trim(), description: (description || "").trim(),
      priority: validPriority(priority) ? priority : "Medium", dueDate: dueDate ? new Date(dueDate + "T12:00:00") : null });
    res.redirect("/");
  } catch (e) { console.error(e); res.status(500).send("Unable to create task."); }
});
app.post("/tasks/:id/update", async (req, res) => {
  try {
    const { title, description, priority, status, dueDate } = req.body;
    if (!title || !title.trim()) return res.redirect("/?error=Task+title+cannot+be+empty");
    await Task.findByIdAndUpdate(req.params.id, { title: title.trim(), description: (description || "").trim(),
      priority: validPriority(priority) ? priority : "Medium", status: validStatus(status) ? status : "Pending",
      dueDate: dueDate ? new Date(dueDate + "T12:00:00") : null }, { runValidators: true });
    res.redirect("/");
  } catch (e) { console.error(e); res.status(500).send("Unable to update task."); }
});
app.post("/tasks/:id/status", async (req, res) => {
  try { if (validStatus(req.body.status)) await Task.findByIdAndUpdate(req.params.id, { status: req.body.status }); res.redirect("/"); }
  catch (e) { console.error(e); res.status(500).send("Unable to change task status."); }
});
app.post("/tasks/:id/delete", async (req, res) => {
  try { await Task.findByIdAndDelete(req.params.id); res.redirect("/"); }
  catch (e) { console.error(e); res.status(500).send("Unable to delete task."); }
});
async function start() {
  try { await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/task_manager"); console.log("Connected to MongoDB"); }
  catch (e) { console.error("MongoDB connection failed:", e.message); console.error("Start MongoDB or set MONGODB_URI in .env."); process.exit(1); }
  app.listen(PORT, () => console.log(`Task Manager running at http://localhost:${PORT}`));
}
start();