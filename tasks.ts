import { runTask, Tasks } from '@engineers/cli-helper';
import { execSync } from 'child_process';

function exec(cmd: string): void{
    // display the output
    // https://stackoverflow.com/a/31104898/12577650
    execSync(cmd, {stdio: 'inherit'}).toString();
}

let tasks: Tasks = {
 /**
  * run `npm run script`
  * @example 'node tasks cms/start:dev' => `npm run start:dev --prefix cms`
  * @param target
  */
 run(value: string ): void{
   let [target, script] = value.split('/');
   let cmd = `npm run ${script}`;
   if (target && target.trim() !== ''){
      let dir = (target.substr(0, 4) === 'pkg:' ? `packages/${target.substr(5)}` : `projects/${target}`).trim();
      cmd += ` --prefix ${dir}` ;
      }

   console.log(` > ${cmd}`);
   execSync(cmd);
  }

 };



runTask(tasks);
