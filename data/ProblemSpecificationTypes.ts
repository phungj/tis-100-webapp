import {Data} from "@/src/Interpreter"

export type Seed = number;

export type NodeCoordinates = {
    x: number,
    y: number
}

export type ProblemDescription = {
    id: string
    title: string,
    description: string,
    seed: Seed,
    inputNodes: NodeCoordinates[],
    inputs: Data[][],
    outputNodes: NodeCoordinates[],
    brokenNodes: NodeCoordinates[],
    stackNodes: NodeCoordinates[]
};

export type ProblemLogic = {
    generateInputs: (seed: Seed) => Data[],
    computeExpectedOutput: (input: Data[], outputIndex: number) => Data
};