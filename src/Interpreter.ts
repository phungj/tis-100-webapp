type InputNodeState = {
    data: number[],
    dataPointer: number
};

type OutputNodeState = {
    data: number[]
};

type ComputationNodeState = {
    instructions: string[],
    instructionPointer: number,
    // TODO: Get the rest of the class attributes here
}

type NodeState = InputNodeState | OutputNodeState | ComputationNodeState;

// TODO: Implement an interpreter class here, decide on data format for storing problems