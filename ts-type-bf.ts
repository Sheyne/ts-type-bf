type BuildTuple<L extends number, T extends any[] = []> = 
    T extends { length: L } ? T : BuildTuple<L, [...T, any]>;

type Length<T extends any[]> = 
    T extends { length: infer L } ? L : never;

type PerformMoveLeft<T>
     = T extends [[...infer Ls, infer CNew], infer COld, [...infer Rs]] ? [[...Ls], CNew, [COld, ...Rs]] 
     : T extends [[], infer COld, [...infer Rs]] ? [[], [], [COld, ...Rs]]      
     : never;

type PerformMoveRight<T> 
     = T extends [[...infer Ls], infer COld, [infer CNew, ...infer Rs]] ? [[...Ls, COld], CNew, [...Rs]] 
     : T extends [[...infer Ls], infer COld, []] ? [[...Ls, COld], [], []]      
     : never;
     


type PerformCrement<Amt, Tape>
     = Tape extends [[...infer Ls], [...infer C], [...infer Rs]] ? [[...Ls], (Amt extends 1 ? [any, ...C] : (C extends [any, ...infer Cn] ? Cn : [])), [...Rs]]
     : never;

type MoveRight = { move: "right" };
type MoveLeft = { move: "left" };
type Increment = { change: 1 };
type Decrement = { change: -1 };
type Read = { stdio: "in" };
type Write = { stdio: "out" };
type Loop<Body> = { body: Body };

type PerformStep<Step, Tape, StdIn extends number[], StdOut>
     = Step extends MoveRight ? [PerformMoveRight<Tape>, StdIn, StdOut]
     : Step extends MoveLeft ? [PerformMoveLeft<Tape>, StdIn, StdOut]
     : Step extends { change : infer Amt } ? [PerformCrement<Amt, Tape>, StdIn, StdOut]
     : Step extends Write ? (Tape extends [any, [...infer C], any] ? StdOut extends any[] ? [Tape, StdIn, [...StdOut, Length<C>]] : never: never)
     : Step extends Read ? (Tape extends [infer Ls, any, infer Rs] ? 
                              (StdIn extends [infer X, ...infer RStdIn] ? (X extends number ? [[Ls, BuildTuple<X>, Rs], [...RStdIn], StdOut] : never)
                              : (StdIn extends [] ? [[Ls, [], Rs], [], StdOut] : never))
                              : never)
     : never;

type Perform<Steps, StdIn extends number[]=[], StdOut=[], Tape=[[], [], []]> 
     = Steps extends [] ? [Tape, StdIn, StdOut]
     : Steps extends [Loop<infer Body>, ...infer RestSteps] ? (
          Tape extends [any, [], any] ? Perform<RestSteps, StdIn, StdOut, Tape> :
          Perform<Body, StdIn, StdOut, Tape> extends [infer NewTape, infer NewStdIn, infer NewStdOut] ? NewStdIn extends number[] ? Perform<Steps, NewStdIn, NewStdOut, NewTape> : never : never)
     : Steps extends [infer Step, ...infer RestSteps] ? (
          PerformStep<Step, Tape, StdIn, StdOut> extends [infer NewTape, infer NewStdIn, infer NewStdOut] ? NewStdIn extends number[] ?
          Perform<RestSteps, NewStdIn, NewStdOut, NewTape> : never : never)
     : never

type CompileTape<Program, Built extends any[]=[]>
     = Program extends "" ? Built
     : Program extends `+${infer Rest}` ? CompileTape<Rest, [...Built, Increment]>
     : Program extends `-${infer Rest}` ? CompileTape<Rest, [...Built, Decrement]>
     : Program extends `<${infer Rest}` ? CompileTape<Rest, [...Built, MoveLeft]>
     : Program extends `>${infer Rest}` ? CompileTape<Rest, [...Built, MoveRight]>
     : Program extends `.${infer Rest}` ? CompileTape<Rest, [...Built, Write]>
     : Program extends `,${infer Rest}` ? CompileTape<Rest, [...Built, Read]>
     : Program extends `]${infer Rest}` ? {body: Built, closeTag: Rest}
     : Program extends `[${infer Rest}` ? (CompileTape<Rest, []> extends {body: infer Body, closeTag: infer MoreProg} ? CompileTape<MoreProg, [...Built, Loop<Body>]> : never)
     : never;


type RunBF<Program, StdIn extends number[]=[]> 
     = Program extends any[] ? (Perform<Program, StdIn> extends [any, any, infer StdOut] ? StdOut : never)
     : CompileTape<Program, []> extends [...any, {closeTag: any}] ? never
     : CompileTape<Program, []> extends [...infer Steps] ? Perform<Steps, StdIn> extends [any, any, infer StdOut] ? StdOut : never
     : never;

type ASCII = ["\u0000","\u0001","\u0002","\u0003","\u0004","\u0005","\u0006","\u0007","\b","\t","\n","\u000b","\f","\r","\u000e","\u000f","\u0010","\u0011","\u0012","\u0013","\u0014","\u0015","\u0016","\u0017","\u0018","\u0019","\u001a","\u001b","\u001c","\u001d","\u001e","\u001f"," ","!","\"","#","$","%","&","'","(",")","*","+",",","-",".","/","0","1","2","3","4","5","6","7","8","9",":",";","<","=",">","?","@","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","[","\\","]","^","_","`","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","{","|","}","~"];

type ParseAscii<A> = 
     A extends [] ? "" : 
     A extends [infer first, ...infer rest] ? `${first extends number ? ASCII[first] : "Whoops"}${ParseAscii<rest>}` : never;

type out1 = ParseAscii<RunBF<"++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++.">>;
type out2 = RunBF<",>>+<<[>.>[->+<]<[->+<]>>[-<+<+>>]<<<-]", [13]>;
type out3 = RunBF<",>>+<<[>>[->+<]<[->+<]>>[-<+<+>>]<<<-]>.", [5]>;

function fib<T extends number>(x: T) : (RunBF<",>>+<<[>>[->+<]<[->+<]>>[-<+<+>>]<<<-]>.", [T]> extends [infer V] ? V : never) {
     let a = 0;
     let b = 1;

     while (x-- > 0) {
          let temp = b;
          b = a + b;
          a = temp;
     }

     return a as any;
}

const x = fib(8);
console.log(x);
