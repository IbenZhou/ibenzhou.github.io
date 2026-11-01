import { buildTask } from './task-format.js';

export const browserRead = async (rel) => {
  const r = await fetch(rel, { cache: 'no-cache' });
  return r.ok ? r.text() : null;
};

export async function loadTasks(read) {
  const index = await read('tasks/index.txt');
  if (index === null) throw new Error('tasks/index.txt is missing');

  const ids = index.split('\n').map(s => s.trim()).filter(s => s && !s.startsWith('#'));
  const tasks = [];

  for (const id of ids) {
    const text = await read(`tasks/${id}.md`);
    if (text === null) throw new Error(`tasks/index.txt lists ${id} but tasks/${id}.md does not exist`);
    tasks.push(buildTask(id, text));
  }
  return tasks;
}
