import {Data} from "@/src/Interpreter"

type Seed = number;

export type NodeCoordinates = {
    x: number,
    y: number
}

export type ProblemDescription = {
    id: string
    title: string,
    description: string,
    seed: Seed,
    inputNode: NodeCoordinates,
    inputs: Data[][],
    outputNode: NodeCoordinates,
    brokenNodes: NodeCoordinates[],
    stackNodes: NodeCoordinates[]
};

export type ProblemLogic = {
    generateInputs: (seed: Seed) => Data[],
    computeExpectedOutput: (input: Data[]) => Data
};