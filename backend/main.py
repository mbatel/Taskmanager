from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from pathlib import Path
import json
from fastapi.middleware.cors import CORSMiddleware

# ----------------------------
# FastAPI App
# ----------------------------
app = FastAPI(title="Task Manager API")

# ----------------------------
# CORS: erlaubt Zugriff vom Frontend
# ----------------------------
origins = ["https://taskmanager-168m-frontend.onrender.com"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# ----------------------------
# Datenmodelle
# ----------------------------
class Task(BaseModel):
    id: int
    title: str
    completed: bool = False

class TaskCreate(BaseModel):
    title: str
    completed: bool = False

# ----------------------------
# Speicher (JSON-Datei) – Achtung: auf Render nicht persistent
# ----------------------------
TASK_FILE = Path("tasks.json")
tasks: List[Task] = []

def load_tasks():
    global tasks
    if TASK_FILE.exists():
        with open(TASK_FILE, "r") as f:
            tasks_data = json.load(f)
            tasks = [Task(**td) for td in tasks_data]

def save_tasks():
    with open(TASK_FILE, "w") as f:
        json.dump([t.dict() for t in tasks], f, indent=4)

# Initial Tasks laden
load_tasks()

# ----------------------------
# GET: Alle Tasks
# ----------------------------
@app.get("/tasks/", response_model=List[Task])
def get_tasks():
    return tasks

# ----------------------------
# POST: Neue Aufgabe anlegen
# ----------------------------
@app.post("/tasks/", response_model=Task)
def create_task(task: TaskCreate):
    new_id = max([t.id for t in tasks], default=0) + 1
    new_task = Task(id=new_id, title=task.title, completed=task.completed)
    tasks.append(new_task)
    save_tasks()
    return new_task

# ----------------------------
# PUT: Task aktualisieren
# ----------------------------
@app.put("/tasks/{task_id}", response_model=Task)
def update_task(task_id: int, updated_task: TaskCreate):
    for index, task in enumerate(tasks):
        if task.id == task_id:
            tasks[index] = Task(id=task_id, title=updated_task.title, completed=updated_task.completed)
            save_tasks()
            return tasks[index]
    raise HTTPException(status_code=404, detail="Task nicht gefunden")

# ----------------------------
# DELETE: Task löschen
# ----------------------------
@app.delete("/tasks/{task_id}")
def delete_task(task_id: int):
    for index, task in enumerate(tasks):
        if task.id == task_id:
            tasks.pop(index)
            save_tasks()
            return {"message": f"Task {task_id} wurde gelöscht"}
    raise HTTPException(status_code=404, detail="Task nicht gefunden")
