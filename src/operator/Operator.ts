import {Nymph} from "../merger";

export abstract class Operator {
    merger: Nymph;
    abstract op(): string;

    abstract apply<T>(obj: {
        base: T,
        patches: T[],
    }): T;
}
