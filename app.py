
import sqlite3
from flask import Flask, render_template, request, redirect, jsonify

import google.generativeai as genai

import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")

def init_db():

    conn = sqlite3.connect("database.db")

    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tasks(
            id INTEGER PRIMARY KEY AUTOINCREMENT,

            title TEXT NOT NULL,

            category TEXT,

            deadline TEXT,

            completed INTEGER DEFAULT 0
)
    """)
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS planner_subjects(

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            subject TEXT NOT NULL,

            priority INTEGER NOT NULL,

            active INTEGER DEFAULT 1

        )
        """)
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS planner_settings(

            id INTEGER PRIMARY KEY,

            study_hours INTEGER,

            start_time TEXT,

            end_time TEXT,

            break_time INTEGER

        )
        """
    )

    conn.commit()
    conn.close()
app = Flask(__name__)

genai.configure(api_key=API_KEY)

@app.route("/")
def home():

    conn = sqlite3.connect("database.db")

    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM tasks")
    total_tasks = cursor.fetchone()[0]

    cursor.execute(
        "SELECT COUNT(*) FROM tasks WHERE completed = 1"
    )

    completed_tasks = cursor.fetchone()[0]

    if total_tasks > 0:

        productivity = int(
            (completed_tasks / total_tasks) * 100
        )

    else:
        productivity = 0
    cursor.execute(
        """
        SELECT * FROM tasks
        WHERE completed = 0
        ORDER BY deadline ASC
        LIMIT 3
        """
    )

    upcoming_tasks = cursor.fetchall()
    conn.close()

    return render_template(
        "index.html",

        total_tasks=total_tasks,
        completed_tasks=completed_tasks,
        productivity=productivity,
        upcoming_tasks=upcoming_tasks
    )

@app.route("/planner")
def planner():
    return render_template("planner.html")

@app.route("/focus")
def focus():
    return render_template("focus.html")

@app.route("/tasks")
def tasks():

    conn = sqlite3.connect("database.db")

    cursor = conn.cursor()

    cursor.execute(
        "SELECT * FROM tasks ORDER BY completed ASC, deadline ASC"
    )

    tasks = cursor.fetchall()

    conn.close()

    return render_template("tasks.html", tasks=tasks)

@app.route("/progress")
def progress():
    return render_template("progress.html")

@app.route("/login")
def login():
    return render_template("login.html")

@app.route("/add-task", methods=["POST"])
def add_task():

    task = request.form["task"]
    category = request.form["category"]
    deadline = request.form["deadline"]

    conn = sqlite3.connect("database.db")

    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO tasks (title, category, deadline)
        VALUES (?, ?, ?)
        """,

        (task, category, deadline)
    )

    conn.commit()
    conn.close()

    return redirect("/tasks")
@app.route("/delete-task/<int:task_id>")

def delete_task(task_id):

    conn = sqlite3.connect("database.db")

    cursor = conn.cursor()

    cursor.execute(
        "DELETE FROM tasks WHERE id = ?",
        (task_id,)
    )

    conn.commit()
    conn.close()

    return redirect("/tasks")
@app.route("/complete-task/<int:task_id>")
def complete_task(task_id):

    conn = sqlite3.connect("database.db")

    cursor = conn.cursor()

    cursor.execute(
        """
        UPDATE tasks
        SET completed = 1
        WHERE id = ?
        """,

        (task_id,)
    )

    conn.commit()
    conn.close()

    return redirect("/tasks")   
@app.route("/save-subject", methods=["POST"])

def save_subject():

    data = request.json

    subject = data["subject"]

    priority = data["priority"]

    active = data["active"]

    conn = sqlite3.connect("database.db")

    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO planner_subjects
        (subject, priority, active)

        VALUES (?, ?, ?)
        """,

        (subject, priority, active)
    )

    conn.commit()
    conn.close()

    return {"message": "saved"}

@app.route("/get-subjects")
def get_subjects():

    conn = sqlite3.connect("database.db")

    cursor = conn.cursor()

    cursor.execute(
        "SELECT * FROM planner_subjects"
    )

    subjects = cursor.fetchall()

    conn.close()

    return {"subjects": subjects}

init_db()


@app.route("/clear-subjects")
def clear_subjects():

    conn = sqlite3.connect("database.db")

    cursor = conn.cursor()

    cursor.execute(
        "DELETE FROM planner_subjects"
    )

    conn.commit()
    conn.close()

    return {"message": "cleared"}

@app.route("/save-settings", methods=["POST"])
def save_settings():

    data = request.json

    conn = sqlite3.connect("database.db")

    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT OR REPLACE INTO planner_settings

        (id, study_hours, start_time, end_time, break_time)

        VALUES (1, ?, ?, ?, ?)
        """,

        (
            data["study_hours"],
            data["start_time"],
            data["end_time"],
            data["break_time"]
        )
    )

    conn.commit()
    conn.close()

    return {"message": "saved"}
@app.route("/get-settings")
def get_settings():

    conn = sqlite3.connect("database.db")

    cursor = conn.cursor()

    cursor.execute(
        "SELECT * FROM planner_settings WHERE id = 1"
    )

    settings = cursor.fetchone()

    conn.close()

    return {"settings": settings}

@app.route("/toggle-subject", methods=["POST"])
def toggle_subject():

    data = request.json

    subject = data["subject"]

    active = data["active"]

    conn = sqlite3.connect("database.db")

    cursor = conn.cursor()

    cursor.execute(
        """
        UPDATE planner_subjects

        SET active = ?

        WHERE subject = ?
        """,

        (active, subject)
    )

    conn.commit()
    conn.close()

    return {"message": "updated"}
@app.route("/delete-subject", methods=["POST"])
def delete_subject():

    data = request.json

    subject = data["subject"]

    conn = sqlite3.connect("database.db")

    cursor = conn.cursor()

    cursor.execute(
        """
        DELETE FROM planner_subjects

        WHERE subject = ?
        """,

        (subject,)
    )

    conn.commit()
    conn.close()

    return {"message": "deleted"}

@app.route("/chat", methods=["POST"])
def chat():

    data = request.get_json()

    user_message = data["message"]

    model = genai.GenerativeModel(
        "gemini-2.5-flash"
    )

    response = model.generate_content(

        f"""
        You are Nova, the AI assistant of Smart Study Planner.

        About the Website:
        Smart Study Planner is a student productivity platform designed to help students organize their studies, manage tasks, stay focused, and track progress.

        The website contains:

        1. Dashboard

        * Displays total study time.
        * Displays completed study sessions.
        * Displays productivity percentage.
        * Shows today's generated study schedule.
        * Shows upcoming tasks.

        2. Study Planner

        * Users can enter study hours, start time, end time, and break duration.
        * Users can add subjects with High, Medium, or Low priority.
        * Subjects can be enabled or disabled.
        * The system generates a timetable based on subject priorities.
        * Users can mark study sessions as completed.
        * Completed sessions contribute to study statistics.

        3. Focus Mode

        * Customizable study timer.
        * Helps students concentrate during study sessions.
        * Focus sessions contribute to study tracking.

        4. Task Manager

        * Users can create tasks.
        * Tasks have deadlines and priorities.
        * Tasks help students organize their work.

        5. Progress Tracker

        * Displays study statistics.
        * Shows study time trends.
        * Shows subject-wise progress.
        * Shows productivity information.

        Your Role:

        * Act as an intelligent study coach and productivity mentor.
        * Help users understand how to use the website.
        * Answer questions about study techniques, productivity, programming, academics, and career development.
        * Suggest how users can make better use of features within Smart Study Planner.
        * If a user asks where a feature is located, explain which page contains it.
        * If a user asks how to improve productivity, recommend relevant website features such as Planner, Focus Mode, Progress Tracker, or Task Manager.

        Personality:

        * Friendly and approachable.
        * Encouraging but realistic.
        * Clear and concise.
        * Practical and action-oriented.
        * Uses light humor occasionally.
        * Never uses excessive emojis.
        * Explains technical concepts in simple language.
        * Keeps answers brief unless the user asks for more detail.

        Response Style:

        - Keep answers short and conversational.
        - Prefer 2-5 sentences unless the user explicitly asks for detail.
        - Do not give long lists unless requested.
        - Avoid writing user manuals.
        - Give concise practical advice.
        - Use bullet points only when necessary.

        When discussing the website, always behave as if you are the built-in assistant of Smart Study Planner.


        User message:
        {user_message}
    """

    )

    return jsonify({

        "reply": response.text

    })
if __name__ == "__main__":
    app.run(debug=True)
