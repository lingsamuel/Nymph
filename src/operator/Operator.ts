import {Nymph, NymphDataType, NymphPatchObject} from "../merger";

type NymphOperatorDataType = NymphPatchObject | NymphDataType;

export abstract class Operator {
    merger: Nymph;

    abstract op(): string;

    abstract apply(
        base: any,
        patches: any,
    ): any;

    newOp<T extends Operator>(ctor: new() => T): T {
        const op = new ctor();
        op.merger = this.merger;
        return op;
    };
}
