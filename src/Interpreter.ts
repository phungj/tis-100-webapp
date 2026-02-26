import {ProblemDescription, ProblemLogic, NodeCoordinates} from "@/data/ProblemSpecificationTypes";

export const MAX_VALUE = 999;
export const MIN_VALUE = -999;

export type Data = number[];
type Pointer = number;

type EmptyState = {};

type InputNodeState = {
    data: Data,
    dataPointer: Pointer
};

type OutputNodeState = {
    data: Data,
    expectedOutput: Data,
    dataPointer: Pointer
};

type RegisterValue = number;

enum Register {
    ACC,
    BAK,
    NIL
}

enum Port {
    UP,
    RIGHT,
    DOWN,
    LEFT,
    ANY,
    LAST
}

// TODO :Create enum for instructions as strings

type ComputationNodeState = {
    instructions: string[],
    instructionPointer: Pointer,
    acc: RegisterValue,
    bak: RegisterValue,
    writeValue: number | null,
    writePort: Port | null
}

type NodeState = InputNodeState | OutputNodeState | ComputationNodeState | EmptyState;

export class Interpreter {
    private readonly GRID_WIDTH = 4;
    private readonly GRID_HEIGHT = 5;

    private readonly nodes: NodeState[][];

    private testCaseIndex: number;

    // TODO: Implement the rest of the node initialization here as necessary
    constructor(problemDescription: ProblemDescription, problemLogic: ProblemLogic) {
        // TODO: Determine if input and output are at the same spot every time
        // TODO: Replace with a for loop that inits the top and bottom with empty nodes and the middle 3 with regular nodes
        this.nodes = [...Array(this.GRID_HEIGHT)].map(_=>Array(this.GRID_WIDTH).fill({}));
        this.testCaseIndex = 0;
        const startingInputs = problemDescription.inputs[this.testCaseIndex];

        const inputNode = problemDescription.inputNode;


        this.nodes[inputNode.y][inputNode.x] = {
            data: startingInputs,
            dataPointer: 0
        };

        const outputNode = problemDescription.outputNode;

        this.nodes[outputNode.y][outputNode.x] = {
            data: [],
            expectedOutput: problemLogic.computeExpectedOutput(startingInputs),
            dataPointer: 0
        };
    }

    public step() {
        for (let r = 1; r < this.nodes.length - 1; r++) {
            for (let c = 0; c < this.nodes[0].length - 1; c++) {
                const currentNode = this.nodes[r][c] as ComputationNodeState;

                // TODO: Add the condition to see if it's a ComputationNode, remove cast
                this.executeInstruction(currentNode, {r, c});
            }
        }
    }

    // TODO :Figure out how to handle syntax errors
    private executeInstruction(node: ComputationNodeState, {x, y}: NodeCoordinates) {
        if (node.instructions) {
            // TODO: Get a regex here for whitespace
            const instructionComponents = node.instructions[node.instructionPointer].split();

            // TODO: Read the opcode
            // TODO: Execute it accordingly
            // TODO: Increment the IP accordingly

            if (node.instructionPointer >= node.instructions.length) {
                node.instructionPointer = 0;
            }
        }
    }
}