import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "readify",
  password: "24682468",
  port: 5432,
});

db.connect();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: "false" }));

let notes = [
  {
    id: 1,
    book: "How Minds Change",
    author: "David McRaney",
    date: "25-2-2024",
    rating: "7",
    note: "Note1",
    isbn: "0593190297",
  },
  {
    id: 2,
    book: "Sum: Forty Tales from the Afterlives",
    author: "David Eagleman",
    date: "26-2-2024",
    rating: "9",
    note: "Note2",
    isbn: "0307377342",
  },
];

async function getNotes() {
  const result = await db.query(
    "SELECT *, TO_CHAR(date, 'DD-MM-YYYY') AS formatted_date FROM notes"
  );
  const notes = result.rows;
  return notes;
}

async function getNotesWithID(id) {
  const result = await db.query(
    "SELECT *, TO_CHAR(date, 'MM-DD-YYYY') AS formatted_date FROM notes WHERE id=($1)",
    [id]
  );
  const updatedNote = result.rows[0];
  return updatedNote;
}

const idResult = await db.query("SELECT id FROM notes");
var notesID = idResult.rows;
notesID = notesID.map((note) => note.id);

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get("/notes", async (req, res) => {
  notes = await getNotes();
  res.render("notes.ejs", { notes: notes });
});

app.get("/new", (req, res) => {
  res.render("new.ejs");
});

app.get("/edit:notesID", async (req, res) => {
  const updatedID = req.params.notesID;
  try {
    const updatedNote = await getNotesWithID(updatedID);
    res.render("update.ejs", { note: updatedNote });
  } catch (error) {
    console.log(error);
    res.render("update.ejs", { error: error });
  }
});

app.post("/new", async (req, res) => {
  const book = req.body.book;
  const author = req.body.author;
  const date = req.body.date;
  const rating = req.body.rating;
  const note = req.body.notes;
  const isbn = req.body.isbn;
  try {
    await db.query(
      "INSERT INTO notes(book, author, date, rating, note, isbn) VALUES($1, $2, $3, $4, $5, $6)",
      [book, author, date, rating, note, isbn]
    );
    console.log("Note has been saved successfully.");
    res.redirect("/notes");
  } catch (error) {
    console.log(error);
    res.render("new.ejs", { error: error });
  }
});

app.post("/update:notesID", async (req, res) => {
  const id = req.params.notesID;
  const book = req.body.book;
  const author = req.body.author;
  const date = req.body.date;
  const rating = req.body.rating;
  const note = req.body.notes;
  const isbn = req.body.isbn;

  try {
    await db.query(
      "UPDATE notes SET book=($1), author=($2), date=($3), rating=($4), note=($5), isbn=($6) WHERE id=($7)",
      [book, author, date, rating, note, isbn, id]
    );
    res.redirect("/notes");
  } catch (error) {
    console.log(error);
    const updatedNote = await getNotesWithID(id);
    res.render("update.ejs", { note: updatedNote, error: error });
  }
});

app.post("/delete:NotesID", async (req, res) => {
  const deletedID = req.params.NotesID;
  try {
    await db.query("DELETE FROM notes WHERE id=($1)", [deletedID]);
    res.redirect("/notes");
  } catch (error) {
    console.log("error");
    res.redirect("/notes");
  }
});

app.post("/search", async (req, res) => {
  const bookName = req.body.search;
  console.log(bookName.toLowerCase());
  try {
    const result = await db.query(
      "SELECT * From notes WHERE LOWER(book) LIKE '%'|| $1 ||'%'",
      [bookName.toLowerCase()]
    );
    const searchedNote = result.rows;
    res.render("notes.ejs", { notes: searchedNote });
  } catch (error) {
    console.log(error);
    res.render("index.ejs", { error: error });
  }
});

app.listen(port, () => {
  console.log(`Server is running on the port: ${port}`);
});
