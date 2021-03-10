import { runTask, Tasks } from '@engineers/cli-helper';

let tasks: Tasks = {
 test: (x: any, y: any) => {console.log({x, y});}
};
runTask(tasks);
