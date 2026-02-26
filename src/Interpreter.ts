import {NodeCoordinates, ProblemDescription, ProblemLogic} from "@/data/ProblemSpecificationTypes";

export const MAX_VALUE = 999;
export const MIN_VALUE = -999;

export type Data = number[];
type Pointer = number;

// TODO: Do the typeof thing for this guy if possible and necessary?
type NodeTypes = "EMPTY" | "INPUT" | "OUTPUT" | "COMPUTATION";

type WithType<T extends NodeTypes> = {
    type: T
};

type EmptyState = WithType<"EMPTY">;

type InputNodeState = WithType<"INPUT"> & {
    data: Data,
    dataPointer: Pointer
};

type OutputNodeState = WithType<"OUTPUT"> & {
    data: Data,
    expectedOutput: Data,
    dataPointer: Pointer
};

type RegisterValue = number;

// TODO: Do the typeof thing for this guy if possible and necessary?
enum Register {
    ACC,
    BAK,
    NIL
}

// TODO: Do the typeof thing for this guy if possible and necessary?
enum Port {
    UP,
    RIGHT,
    DOWN,
    LEFT,
    ANY,
    LAST
}

const Instructions = {
    NOP: "NOP",
    MOV: "MOV",
    SWP: "SWP",
    SAV: "SAV",
    ADD: "ADD",
    SUB: "SUB",
    NEG: "NEG",
    JMP: "JMP",
    JEZ: "JEZ",
    JNZ: "JNZ",
    JGZ: "JGZ",
    JLZ: "JLZ",
    JRO: "JRO",
} as const;

type Instruction = typeof Instructions[keyof typeof Instructions];

type ComputationNodeState = WithType<"COMPUTATION"> & {
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
        this.nodes = [];

        for (let i = 0; i < this.GRID_HEIGHT; i++) {
            let fillFunction;

            fillFunction = i == 0 || i == this.GRID_HEIGHT - 1 ? this.emptyNodeFactory() : this.computationNodeFactory();

            this.nodes.push(Array(this.GRID_WIDTH).fill(fillFunction));
        }

        this.testCaseIndex = 0;

        const inputNodes = problemDescription.inputNodes;
        const currentInputs = problemDescription.inputs[this.testCaseIndex];

        for (let i = 0; i < problemDescription.inputNodes.length; i++) {
            const inputNode = inputNodes[i];

            this.nodes[inputNode.y][inputNode.x] = {
                type: "INPUT",
                data: currentInputs[i],
                dataPointer: 0
            };
        }

        const outputNodes = problemDescription.outputNodes;

        for (let i = 0; i < problemDescription.outputNodes.length; i++) {
            const outputNode = outputNodes[i];

            this.nodes[outputNode.y][outputNode.x] = {
                type: "OUTPUT",
                data: [],
                expectedOutput: problemLogic.computeExpectedOutput(currentInputs, i),
                dataPointer: 0
            };
        }
    }

    public step() {
        for (let r = 1; r < this.nodes.length - 1; r++) {
            for (let c = 0; c < this.nodes[0].length - 1; c++) {
                const currentNode = this.nodes[r][c];

                if (currentNode.type == "COMPUTATION") {
                    this.executeInstruction(currentNode, {x: c, y: r});
                }
            }
        }
    }

    private executeInstruction(node: ComputationNodeState, {x, y}: NodeCoordinates) {
        if (node.instructions && !node.writeValue) {
            const instructionComponents = node.instructions[node.instructionPointer].trim().split(/\s+/);

            // TODO: Create a custom exception and throw it on error
            // TODO: Create a not implemented exception and throw it when necessary
            // TODO: Implement the rest of the instructions here alongside comments and labels
            switch (instructionComponents[0]) {
                case (Instructions.NOP):
                    if (instructionComponents.length !== 1) {
                        // TODO: Throw
                    } else {
                        node.instructionPointer++;
                        break;
                    }
                case (Instructions.MOV):
                    if (instructionComponents.length !== 3) {
                        // TODO: Throw
                    } else {
                        // TODO: Attempt to read the source value, block if not available
                        // TODO: Write the read value in the given direction
                        break;
                    }
            }

            if (node.instructionPointer >= node.instructions.length) {
                node.instructionPointer = 0;
            }
        }
    }


    // TODO:
    public reset() {

    }

    // tODO
    public updateInstructions({x, y}: NodeCoordinates, instructions: string[]) {

    }

    public getNodes(): NodeState[][] {
        return this.nodes;
    }

    private emptyNodeFactory(): EmptyState {
        return {type: "EMPTY"};
    }

    private computationNodeFactory(): ComputationNodeState {
        return {
            type: "COMPUTATION",
            instructions: [],
            instructionPointer: 0,
            acc: 0,
            bak: 0,
            writeValue: null,
            writePort: null
        };
    }
}