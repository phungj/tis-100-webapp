type Data = number[];
type Pointer = number;

type InputNodeState = {
    data: Data,
    dataPointer: Pointer
};

type OutputNodeState = {
    data: Data
};

type Register = number;

type ComputationNodeState = {
    instructions: string[],
    instructionPointer: Pointer,
    acc: Register,
    bak: Register
}

type NodeState = InputNodeState | OutputNodeState | ComputationNodeState;

// TODO: Implement an interpreter class here, decide on data format for storing problems