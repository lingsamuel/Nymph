import {Nymph, NymphDataType, NymphOperatorType, NymphPatchObject} from "../merger";

type NymphOperatorDataType = NymphPatchObject | NymphDataType;

export abstract class Operator {
    merger: Nymph;

    abstract op(): string;

    abstract apply(
        base: NymphOperatorDataType,
        patches: NymphOperatorType,
    ): NymphOperatorDataType;

    newOp<T extends Operator>(ctor: new() => T): T {
        const op = new ctor();
        op.merger = this.merger;
        return op;
    };
}
