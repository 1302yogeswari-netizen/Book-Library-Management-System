import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [started, setStarted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  const [book, setBook] = useState({
    title: "",
    author: "",
    category: "",
  });

  useEffect(() => {
    fetch("https://book-library-management-system-a4h9.onrender.com/api/books")
      .then((response) => response.json())
      .then((data) => setBooks(data))
      .catch((error) => console.error("Error:", error));
  }, []);

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase()) ||
      book.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleChange = (e) => {
    setBook({
      ...book,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        editingBook
          ? `https://book-library-management-system-a4h9.onrender.com/api/books/${editingBook._id}`
          : "https://book-library-management-system-a4h9.onrender.com/api/books",
        {
          method: editingBook ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(book),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save book");
      }

      if (editingBook) {
        setBooks((previousBooks) =>
          previousBooks.map((book) =>
            book._id === data._id ? data : book
          )
        );
      } else {
        setBooks((previousBooks) => [...previousBooks, data]);
      }

      setBook({
        title: "",
        author: "",
        category: "",
      });

      setEditingBook(null);
      setShowForm(false);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to save book");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this book?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `https://book-library-management-system-a4h9.onrender.com/api/books/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete book");
      }

      setBooks((previousBooks) =>
        previousBooks.filter((book) => book._id !== id)
      );

      alert("Book deleted successfully!");
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to delete book");
    }
  };

  const handleEdit = (book) => {
    setEditingBook(book);

    setBook({
      title: book.title,
      author: book.author,
      category: book.category,
    });

    setShowForm(true);
  };

  const handleStatusChange = async (id) => {
    try {
      const response = await fetch(
        `https://book-library-management-system-a4h9.onrender.com/api/books/${id}/status`,
        {
          method: "PATCH",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update status");
      }

      setBooks((previousBooks) =>
        previousBooks.map((book) =>
          book._id === data._id ? data : book
        )
      );
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to update book status");
    }
  };

  return (
    <div className="app">
      {!started ? (
        <div className="landing">
          <div className="landing-content">
            <p className="tag">BOOK LIBRARY MANAGEMENT</p>

            <h1>
              Your books.
              <br />
              Your library.
            </h1>

            <p className="description">
              Manage your books, track your collection, and keep your
              reading world organized in one simple place.
            </p>

            <button onClick={() => setStarted(true)}>
              Get Started
            </button>
          </div>

          <div className="book-image">
            <div className="book book-one">BOOKS</div>
            <div className="book book-two">READ</div>
            <div className="book book-three">LIBRARY</div>
          </div>
        </div>
      ) : (
        <div className="library">
          <header>
            <h1>Book Library</h1>
            <p>Manage your personal book collection</p>
          </header>

          <div className="library-stats">
            <div className="stat-card">
              <h3>Total Books</h3>
              <p>{books.length}</p>
            </div>

            <div className="stat-card">
              <h3>Available</h3>
              <p>
                {
                  books.filter(
                    (book) => book.status === "Available"
                  ).length
                }
              </p>
            </div>

            <div className="stat-card">
              <h3>Issued</h3>
              <p>
                {
                  books.filter(
                    (book) => book.status === "Issued"
                  ).length
                }
              </p>
            </div>
          </div>

          <div className="library-actions">
            <button
              onClick={() => {
                setEditingBook(null);
                setBook({
                  title: "",
                  author: "",
                  category: "",
                });
                setShowForm(true);
              }}
            >
              Add Book
            </button>

            <input
              type="text"
              placeholder="Search books..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {showForm && (
            <form className="book-form" onSubmit={handleSubmit}>
              <h2>
                {editingBook ? "Edit Book" : "Add a New Book"}
              </h2>

              <input
                type="text"
                name="title"
                placeholder="Book title"
                value={book.title}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="author"
                placeholder="Author"
                value={book.author}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="category"
                placeholder="Category"
                value={book.category}
                onChange={handleChange}
                required
              />

              <div>
                <button type="submit">
                  {editingBook ? "Update Book" : "Save Book"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingBook(null);
                    setBook({
                      title: "",
                      author: "",
                      category: "",
                    });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {!showForm && (
            <>
              {books.length === 0 ? (
                <div className="empty-state">
                  <h2>Your library is ready 📚</h2>
                  <p>
                    Start adding books to build your collection.
                  </p>
                </div>
              ) : filteredBooks.length === 0 ? (
                <div className="empty-state">
                  <h2>No books found</h2>
                  <p>
                    Try a different title, author, or category.
                  </p>
                </div>
              ) : (
                <div className="book-list">
                  {filteredBooks.map((book) => (
                    <div
                      className="book-card"
                      key={book._id}
                    >
                      <h2>{book.title}</h2>

                      <p>
                        <strong>Author:</strong> {book.author}
                      </p>

                      <p>
                        <strong>Category:</strong>{" "}
                        {book.category}
                      </p>

                      <p>
                        <strong>Status:</strong> {book.status}
                      </p>

                      <button
                        onClick={() =>
                          handleStatusChange(book._id)
                        }
                      >
                        {book.status === "Available"
                          ? "Issue Book"
                          : "Return Book"}
                      </button>

                      <button
                        onClick={() => handleEdit(book)}
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(book._id)
                        }
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;