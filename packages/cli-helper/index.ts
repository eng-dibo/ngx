import { argv } from 'process';
import parseArgv, {Opts, ParsedArgs} from 'minimist';


// Partial<> converts all required properties into optional,
// so we can delete the property '_
// todo: only convert '_' to be optional
export interface ParsedArgsOptional extends Partial<ParsedArgs> {}

export function parse(options?: Opts): ParsedArgsOptional{
  return parseArgv(argv.slice(2), options);
}

export interface Tasks{
    // todo: ()=>any
    [key: string]: any;
}

/**
 *
 * @param tasks
 *
 */
export function runTask(tasks: Tasks ): void{
// let task = argv.slice(2)[0], params = argv.slice(3);

let parsedArgs = parse(), task = parsedArgs._![0] , params = parsedArgs._!.slice(1);
delete parsedArgs._;
// console.log({task, params, options: parsedArgs});

if (!task) {throw new Error('task not provided!'); }
else if (!(task in tasks)) {throw new Error(`unknown task ${task}`); }

try {
    console.log(`>> running the task: ${task}`);
    tasks[task](...params, parsedArgs);
    console.log('>> Done');
  } catch (error) {
    console.error({error});
    throw new Error(`>> error in task ${task}`);
  }

}

