type BuildTuple<L extends number, T extends any[] = []> = 
    T extends { length: L } ? T : BuildTuple<L, [...T, any]>;

type MakeTupleNumber<L> =
     L extends number ? BuildTuple<L> : never;

type Length<T> = 
    T extends { length: infer L } ? L : never;

type Add<A, B> = 
    Length<[...MakeTupleNumber<A>, ...MakeTupleNumber<B>]>;
type Subtract<A, B> = 
    BuildTuple<A> extends [...(infer U), ...MakeTupleNumber<B>]
        ? Length<U>
        : never;

type MultiAdd<
    N, A, I
> = I extends 0 ? A : MultiAdd<N, Add<N, A>, Subtract<I, 1>>;

type EQ<A, B> =
    A extends B
        ? (B extends A ? true : false)
        : false;
type AtTerminus<A, B> = 
    A extends 0
        ? true
        : (B extends 0 ? true : false);
type LT<A, B> = 
    AtTerminus<A, B> extends true
        ? EQ<A, B> extends true
            ? false
            : (A extends 0 ? true : false)
        : LT<Subtract<A, 1>, Subtract<B, 1>>;
type MultiSub<
    N, D, Q
> = LT<N, D> extends true
    ? Q
    : MultiSub<Subtract<N, D>, D, Add<Q, 1>>;

type Multiply<A, B> = 
    MultiAdd<A, 0, B>;
type Divide<A, B> = 
    MultiSub<A, B, 0>;
type Modulo<A, B> = 
    LT<A, B> extends true ? A : Modulo<Subtract<A, B>, B>;

type FromDigit<T>
     = T extends "1" ? 1
     : T extends "2" ? 2
     : T extends "3" ? 3
     : T extends "4" ? 4
     : T extends "5" ? 5
     : T extends "6" ? 6
     : T extends "7" ? 7
     : T extends "8" ? 8
     : T extends "9" ? 9
     : T extends "0" ? 0 : never

type ParseInt<T, Acc=0> = T extends `${infer d1}${infer r}` ? r extends "" ? Add<Multiply<Acc, 10>, FromDigit<T>>: ParseInt<r, Add<Multiply<Acc, 10>, FromDigit<d1>>>: Add<Multiply<Acc, 10>, FromDigit<T>>;


type GroupParens<T, Result extends any[]=[]>
     = T extends "" ? Result
     : T extends `(${infer Rest}` ? GroupParens<Rest, []> extends {closeParen: infer Rest, result: infer Res} ? GroupParens<Rest, [...Result, Res]>: never
     : T extends `)${infer Rest}` ? {closeParen: Rest, result: Result}
     : T extends `${infer Word}${infer Rest}` ? GroupParens<Rest, [...Result, Word]>
     : Result;

type GroupStrings<T, WorkingString extends string="", Result extends any[] = []> 
     = T extends [] ? WorkingString extends "" ? Result : [...Result, WorkingString]
     : T extends [infer Head, ...infer Rest] ? Head extends string ? GroupStrings<Rest, `${WorkingString}${Head}`, Result> : GroupStrings<Rest, "", [...Result, WorkingString, GroupStrings<Head>]> 
     : never;

type SplitOnNewLines<T, Result extends string[]=[]>
     = T extends `\n${infer B}` ? SplitOnNewLines<B, [...Result]>
     : T extends `${infer A}\n${infer B}` ? SplitOnNewLines<B, [...Result, A]>
     : T extends "" ? Result
     : [...Result, T];

type SplitOnSpaces<T, Result extends string[]=[]>
     = T extends ` ${infer B}` ? SplitOnSpaces<B, [...Result]>
     : T extends `${infer A} ${infer B}` ? SplitOnSpaces<B, [...Result, A]>
     : T extends "" ? Result
     : [...Result, T];

type SplitOnSpacesR<T, Result extends any[]=[]>
     = T extends [] ? Result
     : T extends [infer H, ...infer Tail] ? 
          H extends string ? SplitOnSpacesR<Tail, [...Result, ...SplitOnSpaces<H>]>
          : SplitOnSpacesR<Tail, [...Result, SplitOnSpacesR<H>]>
     : never;

type Parse<T> = SplitOnSpacesR<GroupStrings<GroupParens<T>>>

type Lambda<Arg, Body> = {arg: Arg, body: Body};
type Func<Arg, Body, Env> = {lambda: Lambda<Arg, Body>, env: Env};

type Eval<Expr, Env extends {[key: string]: any}={}>
     = Expr extends ["+", infer A, infer B] ? Add<Eval<A, Env>, Eval<B, Env>>
     : Expr extends ["*", infer A, infer B] ? Multiply<Eval<A, Env>, Eval<B, Env>>
     : Expr extends ["/", infer A, infer B] ? Divide<Eval<A, Env>, Eval<B, Env>>
     : Expr extends ["-", infer A, infer B] ? Subtract<Eval<A, Env>, Eval<B, Env>>
     : Expr extends ["if0", infer A, infer T, infer F] ? Eval<A, Env> extends 0 ? Eval<T, Env> : Eval<F, Env>
     : Expr extends ["lambda", infer Arg, infer Body] ? Func<Arg, Body, Env>
     : Expr extends ["let", infer A, infer B, infer C] ? A extends string ? Eval<C, Omit<Env, A> & {[k in A] : Eval<B, Env>}> : never
     : Expr extends string ? ParseInt<Expr> extends never ? Env[Expr] : ParseInt<Expr>
     : Expr extends [infer F, infer Arg] ? Eval<F, Env> extends Func<infer ArgName, infer Body, infer Env> ?
                ArgName extends string ? Eval<Body, Omit<Env, ArgName> & {[k in ArgName] : Eval<Arg, Env>}> : never : never
     : never;

// type t = Eval<Parse<"(lambda x (if0 x 1 2)) 0">>;

type g = Parse<`
let Y 17

0
`>;

type q = Eval<g>;
