import express from "express";
import bodyParser from "body-parser";
import env from "dotenv";
import pg from "pg";

const app = express();
const port = 3000;
env.config();

const db = new pg.Client({
  user:process.env.PG_USER,
  host:process.env.PG_HOST,
  database:process.env.PG_DATABASE,
  password:process.env.PG_PASSWORD,
  port:5432
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function getItems(){
  const result = await db.query("select * from items order by id asc");
  const items = result.rows;
  return items
};

app.get("/", async (req, res) => {
  const items = await getItems();
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  const result = await db.query("insert into items (title) values ('"+item+"')");
  res.redirect("/");
});

app.post("/edit", async (req, res) => {
  const updateId = req.body.updatedItemId;
  const updatedItem = req.body.updatedItemTitle;
  await db.query("update items set title = '"+updatedItem+"' where id = '"+updateId+"'");
  res.redirect("/");

});

app.post("/delete", async (req, res) => {
  const deleteItem = req.body.deleteItemId;
  console.log('id is - ',deleteItem);
  await db.query("delete from items where id = '"+deleteItem+"'");
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
