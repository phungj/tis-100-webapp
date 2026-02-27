import {NodeCoordinates, ProblemDescription, ProblemLogic} from "@/data/ProblemSpecificationTypes";
import {IllegalArgumentError, InstructionSyntaxError, NotImplementedError} from "@/src/Errors";

export const GRID_WIDTH = 4;
export const GRID_HEIGHT = 5;
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

type RegisterLocation = WithType<"REGISTER"> & {location: Register};
type PortLocation = WithType<"PORT"> & {location: Port};
type Location = RegisterLocation | PortLocation;

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

            fillFunction = i == 0 || i == GRID_HEIGHT - 1 ? this.emptyNodeFactory : this.computationNodeFactory;

            this.nodes.push(Array.from({length: GRID_WIDTH}, () => fillFunction()));
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

    // tODO:
    public completed() {

    }

    // TODO: Wrong function returns indices of mismtaching values

    // tODO
    public updateInstructions({x, y}: NodeCoordinates, instructions: string[]) {
        const node = this.nodes[y][x];

        if (node.type == "COMPUTATION") {
            node.instructions = instructions;
        } else {
            throw new IllegalArgumentError(`Node with coordinates ${x}, ${y} is not a computation node`);
        }
    }

    public printNodes() {
        for (const row of this.nodes) {
            for (const node of row) {
                switch (node.type) {
                    case "EMPTY":
                        process.stdout.write("EMPTY ");
                        break;
                    case "INPUT":
                        process.stdout.write(`INPUT: ${node.data}, ${node.dataPointer} `);
                        break;
                    case "OUTPUT":
                        process.stdout.write(`OUTPUT: ${node.data}, ${node.expectedOutput} `);
                        break;
                    case "COMPUTATION":
                        process.stdout.write(`COMPUTATION: ${node.instructions}, ${node.instructionPointer} `);
                }
            }

            console.log()
        }
    }

    public getNodes(): NodeState[][] {
        return this.nodes;
    }

    private executeInstruction(node: ComputationNodeState, {x, y}: NodeCoordinates) {
        if (node.instructions.length !== 0 && !node.writeValue) {
            if (node.instructionPointer >= node.instructions.length) {
                node.instructionPointer = 0;
            }

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
                return y === 0 ? null : this.nodes[y + 1][x];
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
        const readData = this.executeRead(node, {x, y}, this.isValidPortOrRegister(instructionComponents[1]));

        if (readData) {
            this.executeWrite(node, {x, y}, this.isValidPortOrRegister(instructionComponents[2]), readData);
        }
    }

    // TODO: Write a function that updates the test case index accordingly
    // TODO: Figure out how to handle random test case generation

    private executeRead(node: ComputationNodeState, {x, y}: NodeCoordinates, sourceLocation: Location): number | null {
        if (sourceLocation.type === "PORT") {
            const sourcePort = sourceLocation.location;
            const sourceNode = this.getNeighborNode({x, y}, sourcePort);

            if (sourceNode && sourceNode.type == "INPUT") {
                const readData = sourceNode.data[sourceNode.dataPointer];

                sourceNode.dataPointer++;

                return readData;
            } else if (sourceNode && sourceNode.type == "COMPUTATION" && sourceNode.writePort === OppositePorts[sourcePort]) {
                const readData = sourceNode.writeValue;

                sourceNode.writeValue = null;
                sourceNode.writePort = null;
                sourceNode.instructionPointer++;

                return readData
            } else {
                return null;
            }
        } else {
            switch (sourceLocation.location) {
                case "ACC":
                    return node.acc;
                case "BAK":
                    throw new IllegalArgumentError("BAK cannot be directly read");
                case "NIL":
                    return 0;
            }
        }
    }

    private executeWrite(node: ComputationNodeState, {x, y}: NodeCoordinates, destinationLocation: Location, writeData: number) {
        if (destinationLocation.type === "PORT") {
            const destinationNode = this.getNeighborNode({x, y}, destinationLocation.location);

            if (destinationNode && destinationNode.type == "OUTPUT") {
                destinationNode.data.push(writeData);

                node.instructionPointer++;
            } else {
                node.writeValue = writeData;
                node.writePort = destinationLocation.location;
            }
        } else {
            switch (destinationLocation.location) {
                case "ACC":
                    node.acc = writeData;
                    break;
                case "BAK":
                    throw new IllegalArgumentError("BAK cannot be directly written");
                case "NIL":
                    break;
            }

            node.instructionPointer++;
        }
    }

    private isValidPort(input: string): input is Port {
        return Object.values(Ports).includes(input as Port);
    }

    private isValidRegister(input: string): input is Register {
        return Object.values(Registers).includes(input as Register);
    }

    private isValidPortOrRegister(input: string): Location {
        if (this.isValidPort(input)) {
            return {
                type: "PORT",
                location: Ports[input]
            };
        } else if (this.isValidRegister(input)) {
            return {
                type: "REGISTER",
                location: Registers[input]
            };
        } else {
            throw new InstructionSyntaxError(`${input} is not a valid location`);
        }
    }


    private isValidInteger(input: string): number {

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