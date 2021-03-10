const fs = require('fs');
import { execSync } from 'child_process';
import { argv } from 'process';

export interface Tasks{
    // todo: ()=>any
    [key: string]: any;
}

/**
 *
 * @param tasks
 *
 * todo: eable named params, ex: > tasks taskName paramValue --paramName value2
 */
export function runTask(tasks: Tasks ): void{
let task = argv.slice(2)[0], params = argv.slice(3);
if (!task) {throw new Error('task not provided!'); }
else if (!(task in tasks)) {throw new Error(`unknown task ${task}`); }

try {
    console.log(`>> running the task: ${task}`);
    // params.forEach(el => console.log(`  > ${el}`));
    tasks[task](...params);
    console.log('>> Done');
  } catch (error) {
    console.error({error});
    throw new Error(`>> error in task ${task}`);
  }


console.log({task, params});
}

