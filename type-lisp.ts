type BuildTuple<L extends number, T extends any[] = []> = 
    T extends { length: L } ? T : BuildTuple<L, [...T, any]>;

type MakeTupleNumber<L> =
     L extends number ? BuildTuple<L> : never;

type Length<T> = 
    T extends { length: infer L } ? L : never;

type Add<A, B> = 
    MakeTupleNumber<A> extends any[] ?
    MakeTupleNumber<B> extends any[] ?
    Length<[...MakeTupleNumber<A>, ...MakeTupleNumber<B>]> : never : never;
type Subtract<A, B> = 
    MakeTupleNumber<B> extends any[]?
    MakeTupleNumber<A> extends [...(infer U), ...MakeTupleNumber<B>]
        ? Length<U>
        : never : never;

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

type Replace<T, K extends string, V extends string, Acc extends string="">
    = T extends `${K}${infer B}` ? Replace<B, K, V, `${Acc}${V}`>
    : T extends `${infer A}${infer B}` ? Replace<B, K, V, `${Acc}${A}`>
    : T extends "" ? Acc
    : never;

type t = Replace<"abcdeabcde", "c", "f">

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

type Parse<T> = SplitOnSpacesR<GroupStrings<GroupParens<Replace<Replace<T, "\t", " ">, "\n", " ">>>>

type Lambda<Arg, Body> = {arg: Arg, body: Body};
type Func<Arg, Body, Env> = {lambda: Lambda<Arg, Body>, env: Env};

type UpdateStore<Store extends any[], Location extends any[], Value, Accum extends any[]=[]>
    = Location extends [] ? Store extends [any, ...infer Rest] ? [...Accum, Value, ...Rest] : never
    : Location extends [any, ...infer NewLoc] ? Store extends [infer Head, ...infer Rest] ? UpdateStore<Rest, NewLoc, Value, [...Accum, Head]>
    : never : never;

type hjdsaj = UpdateStore<[1, 2, 3, 4, 5], [any, any, any, any], 5>;

type Eval<Expr, Env extends {[key: string]: any}, Store>
     = Expr extends ["make-box"] ? Store extends [...infer StoreContent] ? {value: {reference: Length<Store>}, store: [...StoreContent, undefined]} : never
     : Expr extends ["get", infer A] ? Eval<A, Env, Store> extends {value: infer Ar, store: infer Store1} ? Store1 extends [...any] ? Ar extends {reference: number} ? {value: Store1[Ar['reference']], store: Store1} : {"error": "not a box"} : never : never
     : Expr extends ["set", infer A, infer B] ? 
        (Eval<A, Env, Store> extends {value: infer Ar, store: infer Store1} ? 
        Eval<B, Env, Store1> extends {value: infer Br, store: infer Store2} ?
        Store2 extends [...any] ? 
        Ar extends {reference: infer Ref} ? MakeTupleNumber<Ref> extends any[] ? {value: MakeTupleNumber<Ref>, store: UpdateStore<Store2, MakeTupleNumber<Ref>, Br>} : {"error": "not a box"} : never : never : never : never)
     : Expr extends [infer X] ? Eval<X, Env, Store>
     : Expr extends ["+", infer A, infer B] ? 
            Eval<A, Env, Store> extends {value: infer Ar, store: infer Store1} ? Eval<B, Env, Store1> extends {value: infer Br, store: infer Store2} ? {value: Add<Ar, Br>, store: Store2} : never : never
     : Expr extends ["*", infer A, infer B] ?
            Eval<A, Env, Store> extends {value: infer Ar, store: infer Store1} ? Eval<B, Env, Store1> extends {value: infer Br, store: infer Store2} ? {value: Multiply<Ar, Br>, store: Store2} : never : never
     : Expr extends ["/", infer A, infer B] ?
            Eval<A, Env, Store> extends {value: infer Ar, store: infer Store1} ? Eval<B, Env, Store1> extends {value: infer Br, store: infer Store2} ? {value: Divide<Ar, Br>, store: Store2} : never : never
     : Expr extends ["-", infer A, infer B] ?
            Eval<A, Env, Store> extends {value: infer Ar, store: infer Store1} ? Eval<B, Env, Store1> extends {value: infer Br, store: infer Store2} ? {value: Subtract<Ar, Br>, store: Store2} : never : never
     : Expr extends ["if0", infer A, infer T, infer F] ?
        Eval<A, Env, Store> extends {value: infer V, store: infer Store1} ? (V extends 0 ? Eval<T, Env, Store1> : Eval<F, Env, Store1>) : never
     : Expr extends ["lambda", [infer Arg], infer Body] ? {value: Func<Arg, Body, Env>, store: Store}
     : Expr extends ["let", [infer A, infer B], infer C] ? 
        A extends string ?
        Eval<B, Env, Store> extends {value: infer V, store: infer Store1} ?
        Eval<C, Omit<Env, A> & {[k in A] : V}, Store1> : never : never
     : Expr extends string ? {value: (ParseInt<Expr> extends never ? Env[Expr] : ParseInt<Expr>), store: Store}
     : Expr extends [infer F, infer Arg] ? 
        Eval<F, Env, Store> extends {value: Func<infer ArgName, infer Body, infer FEnv>, store: infer Store1} ?
        ArgName extends string ? 
        Eval<Arg, Env, Store1> extends {value: infer ArgVal, store: infer Store2} ?
        Eval<Body, Omit<FEnv, ArgName> & {[k in ArgName] : ArgVal}, Store2> : never : never : never
     : never;

type MacroExpand<Expr, Accum extends any[]=[]>
    = Expr extends [] ? Accum
    : Expr extends ["let", [infer K, infer V], infer Rest1, infer Rest2, ...infer Rest] ? ["let", [K, MacroExpand<V>], MacroExpand<["let", Rest1, Rest2, ...Rest]>]
    : Expr extends [infer A, ...infer Rest] ? MacroExpand<Rest, [...Accum, MacroExpand<A>]>
    : Expr;

// type program = `
// let
// (Y (lambda (X)
//       ((lambda (procedure)
//          (X (lambda (arg) ((procedure procedure) arg))))
//        (lambda (procedure)
//          (X (lambda (arg) ((procedure procedure) arg)))))))

// (Fib* (lambda (func-arg) 
//     (lambda (n) (if0 (- n 2) n (+ (func-arg (- n 1)) (func-arg (- n 2)))))))
// (fib (Y Fib*))

// (F* (lambda (func-arg) (lambda (n) 
//     (if0 n 
//          1
//         (* n (func-arg (- n 1)))))))
// (fact (Y F*))

// (fact 3)
// `;

type h = MacroExpand<Parse<`
let 
    (fact-box (make-box))
    (fib-box (make-box))
    (fib (lambda (n) 
        (if0 n 0 (if0 (- n 1) n (+ ((get fib-box) (- n 1)) ((get fib-box) (- n 2)))))))
    (u (set fib-box fib))
    (fact (lambda (n)
    (if0 n 
        1
    (* n ((get fact-box) (- n 1))))))
    (u (set fact-box fact))

(fact 4)
`>>;
type q = Eval<h, {}, []>;
