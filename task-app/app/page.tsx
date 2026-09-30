"use client"

import Image from "next/image";
import { useState, useEffect, useMemo } from "react";

export default function Home() {
  const [tasks, setTasks] = useState([
    { id: 0, title: "Reactを勉強する", completed: false },
    { id: 1, title: "TypeScriptを復習する", completed: false },
    { id: 2, title: "mapを復習する", completed: true },
  ]);

  const [inputTitle, setInputTitle] = useState("");

  const toggleTask = (id: number) => {
    setTasks(prevTasks => prevTasks.map(task => task.id === id ? { id: task.id, title: task.title, completed: !task.completed } : task));

    console.log("クリックされた");
  };

  const deleteTask = (id: number) => {
    setTasks(prevTasks => prevTasks.filter(task => id !== task.id));
  };

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("learning-tasks");
      if (!saved) {
        return
      }
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) {
        console.log("保存データが配列ではありません。");
        return;
      }
      const isValid = parsed.every(task => {
        return task && typeof task === "object" && typeof task.id === "number" &&
          typeof task.title === "string" && typeof task.completed === "boolean";
      });
      if (!isValid) {
        console.log("invalid objects");
        return;
      }
      setTasks(parsed);
    } catch (e) {
      console.log(`invalid json objects. error: ${e}`)
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    try {
      localStorage.setItem("learning-tasks", JSON.stringify(tasks));
    } catch (e) {
      console.log(`failed to save tasks. error ${e}`)
    }
  }, [tasks, isLoaded])

  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  const visibleTasks = useMemo(() => {
    return tasks.filter(task => {
      switch (filter) {
        case "all":
          return true;
        case "active":
          return task.completed === false;
        case "completed":
          return task.completed === true;
        default:
          return false;
      }
    });
  }, [tasks, filter]);

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert h-5 w-[100px]"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            学習タスク
          </h1>
          <button onClick={() => setFilter("all")}>
            すべて
          </button>
          <button onClick={() => setFilter("active")}>
            未完了
          </button>
          <button onClick={() => setFilter("completed")}>
            完了
          </button>
          <p>条件：{filter}</p>

          <div>
            <p>全件数：{tasks.length}</p>
            <p>未完了件数：{tasks.filter(task => !task.completed).length}</p>
            <p>完了件数：{tasks.filter(task => task.completed).length}</p>
            <p>表示件数：{visibleTasks.length}</p>
          </div>

          {
            visibleTasks.map(task => (
              <TaskItem key={task.id} title={task.title}
                completed={task.completed} onToggle={() => toggleTask(task.id)}
                onDelete={() => deleteTask(task.id)}
              />
            ))
          }
          <form onSubmit={event => {
            event.preventDefault();
            const title = inputTitle.trim()

            if (title) {
              setTasks(prevTasks => {
                const nextId = Math.max(-1, ...prevTasks.map(task => task.id)) + 1;

                return [...prevTasks, { id: nextId, title: title, completed: false }];
              });
              setInputTitle(inputTitle => "");
            }
          }}>
            <label htmlFor="タスク名">タスク名</label>
            <input id="タスク名" type="text" value={inputTitle} onChange={event => setInputTitle(event.currentTarget.value)} />
            <button type="submit">追加</button>
          </form>
          <button onClick={() => {
            localStorage.setItem("learning-tasks", JSON.stringify(tasks));
          }}>保存</button>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert h-[14px] w-4"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={14}
            />
            Deploy Now
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
    </div>
  );
}

function TaskItem(props: { title: string, completed: boolean, onToggle: () => void, onDelete: () => void }) {
  return (
    <div>
      <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
        {props.title} {props.completed ? "完了" : "未完了"}
      </p>

      <button onClick={props.onToggle}>ボタン</button>
      <button onClick={props.onDelete}>削除</button>
    </div>
  )
}
