import {NodeCoordinates, ProblemDescription, ProblemLogic} from "@/data/ProblemSpecificationTypes";
import {InstructionSyntaxError, NotImplementedError} from "@/src/Errors";

const GRID_WIDTH = 4;
const GRID_HEIGHT = 5;
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

const Registers = {
    ACC: "ACC",
    BAK: "BAK",
    NIL: "NIL",
} as const;

type Register = typeof Registers[keyof typeof Registers];

const Ports = {
    UP: "UP",
    RIGHT: "RIGHT",
    DOWN: "DOWN",
    LEFT: "LEFT",
    ANY: "ANY",
    LAST: "LAST",
} as const;

type Port = typeof Ports[keyof typeof Ports];

type Location = Port | Register;

const OppositePorts = {
    [Ports.UP]: Ports.DOWN,
    [Ports.DOWN]: Ports.UP,
    [Ports.LEFT]: Ports.RIGHT,
    [Ports.RIGHT]: Ports.LEFT,
    [Ports.ANY]: Ports.ANY,
    [Ports.LAST]: Ports.LAST,
} as const;

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
    private readonly nodes: NodeState[][];

    private testCaseIndex: number;

    // TODO: Implement the rest of the node initialization here as necessary
    constructor(problemDescription: ProblemDescription, problemLogic: ProblemLogic) {
        this.nodes = [];

        for (let i = 0; i < GRID_HEIGHT; i++) {
            let fillFunction;

            fillFunction = i == 0 || i == GRID_HEIGHT - 1 ? this.emptyNodeFactory() : this.computationNodeFactory();

            this.nodes.push(Array(GRID_WIDTH).fill(fillFunction));
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


    // TODO:
    public reset() {

    }

    // tODO
    public updateInstructions({x, y}: NodeCoordinates, instructions: string[]) {

    }

    public getNodes(): NodeState[][] {
        return this.nodes;
    }

    private executeInstruction(node: ComputationNodeState, {x, y}: NodeCoordinates) {
        if (node.instructions && !node.writeValue) {
            const instructionComponents = node.instructions[node.instructionPointer].trim().split(/\s+/);

            const instructionComponentsLength = instructionComponents.length;
            const opcode = instructionComponents[0];

            // TODO: Implement the rest of the instructions here alongside comments and labels
            switch (opcode) {
                case (Instructions.NOP):
                    const NOP_COMPONENT_LENGTH = 1;

                    if (instructionComponentsLength !== NOP_COMPONENT_LENGTH) {
                        throw new InstructionSyntaxError(`Instruction expects ${NOP_COMPONENT_LENGTH} component but had ${instructionComponentsLength}`);
                    } else {
                        this.executeNOP(node);
                        break;
                    }
                case (Instructions.MOV):
                    const MOV_COMPONENT_LENGTH = 3;

                    if (instructionComponentsLength !== MOV_COMPONENT_LENGTH) {
                        throw new InstructionSyntaxError(`Instruction expects ${MOV_COMPONENT_LENGTH} component but had ${instructionComponentsLength}`);
                    } else {
                        this.executeMOV(node, {x, y}, instructionComponents);
                        break;
                    }
                default:
                    throw new InstructionSyntaxError(`Instruction ${opcode} not defined`);
            }

            if (node.instructionPointer >= node.instructions.length) {
                node.instructionPointer = 0;
            }
        }
    }

    // TODO: Implement rest of ports here
    private getNeighborNode({x, y}: NodeCoordinates, port: Port): NodeState | null {
        switch (port) {
            case Ports.UP:
                return y === GRID_HEIGHT - 1 ? null : this.nodes[y - 1][x];
            case Ports.RIGHT:
                return x === GRID_WIDTH - 1 ? null : this.nodes[y][x + 1];
            case Ports.DOWN:
                return y === 0 ? null : this.nodes[y - 1][x];
            case Ports.LEFT:
                return x === 0 ? null : this.nodes[y][x - 1];
            default:
                throw new InstructionSyntaxError(`Port ${port} not defined`);
        }
    }

    private executeNOP(node: ComputationNodeState) {
        node.instructionPointer++;
    }

    // TODO: Add additional node types here
    private executeMOV(node: ComputationNodeState, {x, y}: NodeCoordinates, instructionComponents: string[]) {

        // TODO: Update this to handle registers as well
        // TODO: Update the location type with the kind hint for disambaguation
        // TODO: Write helper function ot validate register or node and reuse
        // TODO: Write is valid register function
        // TODO: If it's a valid register, read appropriately
        // TODO: Likewise, if the dest is a valid register, write appropriately
        const sourcePort = Ports[instructionComponents[1]];
        const destinationPort = Ports[instructionComponents[2]];
        const sourceNode = this.getNeighborNode({x, y}, sourcePort);

        let readData;

        if (sourceNode && sourceNode.type == "INPUT") {
            readData = sourceNode.data[sourceNode.dataPointer];

            sourceNode.dataPointer++;
        } else if (sourceNode && sourceNode.type == "COMPUTATION" && sourceNode.writePort === OppositePorts[sourcePort]) {
            readData = sourceNode.writeValue;

            sourceNode.writeValue = null;
            sourceNode.writePort = null;
            sourceNode.instructionPointer++;
        }

        if (readData && this.isValidPort(destinationPort)) {
            node.writeValue = readData;
            node.writePort = Ports[destinationPort];
        }
    }

    // TODO: Write a function that updates the test case index accordingly
    // TODO: Figure out how to handle random test case generation

    private isValidPort(input: string): input is Port {
        return Object.values(Ports).includes(input as Port);
    }

    private isValidRegister(input: string): input is Register {
        return Object.values(Registers).includes(input as Register);
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