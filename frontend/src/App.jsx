import React, { useState, useEffect } from "react"; // <-- useState und useEffect importieren
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState("");

  const API_URL = "https://taskmanager-168m.onrender.com/tasks/";


  useEffect(() => {
    fetch(API_URL)  // <-- hier nur API_URL, nicht API_URL + /tasks/
      .then(res => res.json())
      .then(data => setTasks(data));
}, []);


  const addTask = async () => {
    if (!newTitle) return;
    const res = await fetch(API_URL, {  // <-- nur API_URL
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle })
});

    const task = await res.json();
    setTasks([...tasks, task]);
    setNewTitle("");
  };

  const toggleTask = async (task) => {
    const res = await fetch(`${API_URL}${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: task.title, completed: !task.completed })
    });
    const updated = await res.json();
    setTasks(tasks.map(t => t.id === updated.id ? updated : t));
  };

  const deleteTask = async (taskId) => {
    await fetch(`${API_URL}${taskId}`, { method: "DELETE" });
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

    <DragDropContext
      onDragEnd={(result) => {
        if (!result.destination) return; // Abbruch, wenn nicht auf ein Ziel gezogen
        const items = Array.from(tasks);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setTasks(items);
      }}
    >
      <Droppable droppableId="tasks">
        {(provided) => (
          <ul
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="task-list"
            style={{ listStyle: 'none', padding: 0 }}
          >
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                {(provided) => (
                  <li
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{ display: 'flex', marginBottom: 10, ...provided.draggableProps.style }}
                  >
                    <span
                      onClick={() => toggleTask(task)}
                      className={task.completed ? "task-completed" : ""}
                      style={{ flex: 1, cursor: 'pointer' }}
                    >
                      {task.title}
                    </span>
                    <button className="delete" onClick={() => deleteTask(task.id)}>Löschen</button>
                  </li>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </DragDropContext>
  </div>
);
}

export default App;
