"use client"

import Image from "next/image";
import { parse } from "path";
import { useEffect, useState } from "react";

export default function Home() {
  const [projects, setProjects] = useState<{ id: number, name: string, durations: { start: string, end: string | null }[], ongoing: boolean }[]>([
    {
      id: 1, name: "music", durations: [
        { start: "2026-10-01T20:00:01", end: "2026-10-01T21:00:03" },
        { start: "2026-10-02T20:00:01", end: "2026-10-02T21:00:03" },
        { start: "2026-10-02T22:30:01", end: "2026-10-02T23:00:50" },
      ], ongoing: false
    },
    {
      id: 2, name: "music input", durations: [
        { start: "2026-10-01T20:00:01", end: "2026-10-01T21:00:03" },
      ], ongoing: false
    },
  ]);

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("projects");
      if (!saved) {
        return;
      }

      const parsed = JSON.parse(saved);

      // TODO: data validation

      setProjects(parsed);
    } catch (e) {
      console.log("invalid data: ", e)
    } finally {
      setIsLoaded(true)
    }
  }, []);

  const [now, setNow] = useState(new Date());

  setInterval(() => {
    setNow(new Date());
  }, 1000);


  useEffect(() => {
    if (!isLoaded) {
      return;
    }
    localStorage.setItem("projects", JSON.stringify(projects));
  }, [projects, isLoaded]);

  const starter = (id: number) => {
    const started = projects.map(prj => prj.id === id ? {
      id: prj.id, name: prj.name, durations: [...prj.durations, { start: new Date().toISOString().replace("/\.\d{3}Z$/", ""), end: null }], ongoing: true,
    } : prj);
    setProjects(started);
  };
  const stopper = (id: number) => {
    const stopped = projects.map(prj => {
      if (prj.id === id && prj.durations.length > 0) {
        prj.durations[prj.durations.length - 1].end = new Date().toISOString().replace("/\.\d{3}Z$/", "");
        prj.ongoing = false;
      }
      return prj;
    })
    setProjects(stopped);
  };

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
          {
            projects.map(prj => {
              return (
                <Project
                  key={prj.id} id={prj.id} name={prj.name} durations={prj.durations} ongoing={prj.ongoing}
                  starter={starter} stopper={stopper} now={now}
                />
              )
            })
          }
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

function Project(props: {
  id: number,
  name: string,
  durations: { start: string, end: string | null }[],
  ongoing: boolean,
  starter: (id: number) => void, stopper: (id: number) => void,
  now: Date,
}) {
  return (
    <div>
      <p>Task: {props.name}</p>
      <p>Total: {showTotalTime(calcTotalTime(props.durations, props.now))}</p>
      <Toggle key={props.id} id={props.id} ongoing={props.ongoing} starter={props.starter} stopper={props.stopper} />
    </div>
  )
}

function Toggle(props: { id: number, ongoing: boolean, starter: (id: number) => void, stopper: (id: number) => void }) {
  if (props.ongoing) {
    return (
      <button onClick={() => props.stopper(props.id)}>STOP</button>
    );
  }
  return (
    <button onClick={() => props.starter(props.id)}>START</button>
  );
}

function calcTotalTime(durations: { start: string, end: string | null }[], now: Date): number {
  let totalTime: number = 0;
  for (const duration of durations) {
    const startTime = new Date(duration.start).getTime();
    const endTime = duration.end ? new Date(duration.end).getTime() : now.getTime();

    totalTime += endTime - startTime;
  }
  return totalTime;
}

function showTotalTime(milliseconds: number) {
  const seconds = milliseconds / 1000;
  const hr = Math.floor(seconds / 3600);
  const minute = Math.floor((seconds - 3600 * hr) / 60);
  const second = Math.floor(seconds % 60);
  return `${hr} hr ${minute} m ${second} s`;
}
