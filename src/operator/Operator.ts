import {Nymph} from "../merger";

export abstract class Operator {
    merger: Nymph;

    abstract op(): string;

    abstract apply(
        base: any,
        patches: any,
    ): any

    newOp(ctor: new() => Operator) {
        const op = new ctor();
        op.merger = this.merger;
        return op;
    };
}
