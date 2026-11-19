import { buildTask } from './task-format.js';

export const browserRead = async (rel) => {
  const r = await fetch(rel, { cache: 'no-cache' });
  return r.ok ? r.text() : null;
};

export async function loadTasks(read, base = 'tasks') {
  const index = await read(`${base}/index.txt`);
  if (index === null) throw new Error(`${base}/index.txt is missing`);

  const ids = index.split('\n').map(s => s.trim()).filter(s => s && !s.startsWith('#'));
  const tasks = [];

  for (const id of ids) {
    const text = await read(`${base}/${id}.md`);
    if (text === null) throw new Error(`${base}/index.txt lists ${id} but ${base}/${id}.md does not exist`);
    tasks.push(buildTask(id, text));
  }
  return tasks;
}
