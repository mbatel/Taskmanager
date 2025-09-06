import { useState, useEffect } from "react";

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState("");

  const API_URL = "http://127.0.0.1:8000";

  useEffect(() => {
    fetch(`${API_URL}/tasks/`)
      .then(res => res.json())
      .then(data => setTasks(data));
  }, []);

  const addTask = async () => {
    if (!newTitle) return;
    const res = await fetch(`${API_URL}/tasks/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle })
    });
    const task = await res.json();
    setTasks([...tasks, task]);
    setNewTitle("");
  };

  const toggleTask = async (task) => {
    const res = await fetch(`${API_URL}/tasks/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: task.title, completed: !task.completed })
    });
    const updated = await res.json();
    setTasks(tasks.map(t => t.id === updated.id ? updated : t));
  };

  const deleteTask = async (taskId) => {
    await fetch(`${API_URL}/tasks/${taskId}`, { method: "DELETE" });
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  return (
    <div className="container">
      <h1>📝 Task Manager</h1>

      <div style={{ display: 'flex', marginBottom: 20 }}>
        <input
          type="text"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          placeholder="Neue Aufgabe"
          style={{ flex: 1, padding: 10, marginRight: 10, borderRadius: 5, border: "1px solid #ccc" }}
        />
        <button className="add" onClick={addTask}>Hinzufügen</button>
      </div>

      <ul className="task-list" style={{ listStyle: 'none', padding: 0 }}>
        {tasks.map(task => (
          <li key={task.id}>
            <span
              onClick={() => toggleTask(task)}
              className={task.completed ? "task-completed" : ""}
              style={{ flex: 1, cursor: 'pointer' }}
            >
              {task.title}
            </span>
            <button className="delete" onClick={() => deleteTask(task.id)}>Löschen</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
