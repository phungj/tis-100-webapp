import {NodeCoordinates, ProblemDescription, ProblemLogic} from "@/data/ProblemSpecificationTypes";
import {IllegalArgumentError, InstructionSyntaxError, NotImplementedError} from "@/src/Errors";
import {read} from "fs";

export const GRID_WIDTH = 4;
export const GRID_HEIGHT = 5;
export const MAX_VALUE = 999;
export const MIN_VALUE = -999;

export type Data = number[];
type Pointer = number;

type WithType<T extends string> = {
    type: T
};

type EmptyState = WithType<"EMPTY">;

// TODO: Add a name to inputs and outputs so you can label them accordingly and have multiple
export type InputNodeState = WithType<"INPUT"> & {
    data: Data,
    dataPointer: Pointer
};

export type OutputNodeState = WithType<"OUTPUT"> & {
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

type Literal = WithType<"LITERAL"> & {value: number};
type Source = Literal | Location;

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

export type ComputationNodeState = WithType<"COMPUTATION"> & {
    instructions: string[],
    instructionPointer: Pointer,
    acc: RegisterValue,
    bak: RegisterValue,
    writeValue: number | null,
    writePort: Port | null
}

export type NodeState = InputNodeState | OutputNodeState | ComputationNodeState | EmptyState;

// TODO: Handle commas?
export class Interpreter {
    private readonly nodes: NodeState[][];

    private readonly problemDescription: ProblemDescription;
    private readonly problemLogic: ProblemLogic;

    private testCaseIndex: number;

    // TODO: Implement the rest of the node initialization here as necessary
    constructor(problemDescription: ProblemDescription, problemLogic: ProblemLogic) {
        this.nodes = [];
        this.problemDescription = problemDescription;
        this.problemLogic = problemLogic;
        this.testCaseIndex = 0;

        for (let i = 0; i < GRID_HEIGHT; i++) {
            let fillFunction;

            fillFunction = i == 0 || i == GRID_HEIGHT - 1 ? this.emptyNodeFactory : this.computationNodeFactory;

            this.nodes.push(Array.from({length: GRID_WIDTH}, () => fillFunction()));
        }

        this.reset(problemDescription, problemLogic);
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

    public reset(problemDescription: ProblemDescription, problemLogic: ProblemLogic) {
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


    public completed(): boolean {
        for (const outputNode of this.problemDescription.outputNodes) {
            const currentOutputNode = this.nodes[outputNode.y][outputNode.x];

            if (currentOutputNode.type == "OUTPUT" && currentOutputNode.data.length !== currentOutputNode.expectedOutput.length) {
                return false;
            } else if (currentOutputNode.type == "OUTPUT") {
                for (let i = 0; i < currentOutputNode.data.length; i++) {
                    if (currentOutputNode.data[i] !== currentOutputNode.expectedOutput[i]) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    // TODO: Wrong function returns indices of mismtaching values

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

    public getNodeSnapshot(): NodeState[][] {
        return this.nodes.map(row => {
            return row.map(node => structuredClone(node))
        });
    }

    public getInputNodeCoordinates(): NodeCoordinates[] {
        return this.problemDescription.inputNodes;
    }

    public getOutputNodeCoordinates(): NodeCoordinates[] {
        return this.problemDescription.outputNodes;
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
                case (Instructions.ADD):
                    const ADD_COMPONENT_LENGTH = 2;

                    if(instructionComponentsLength !== ADD_COMPONENT_LENGTH) {
                        throw new InstructionSyntaxError(`Instruction expects ${ADD_COMPONENT_LENGTH} but had ${instructionComponentsLength}`)
                    } else {
                        this.executeAdd(node, {x, y}, instructionComponents);
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
                throw new IllegalArgumentError(`Port ${port} not defined`);
        }
    }

    private executeNOP(node: ComputationNodeState) {
        node.instructionPointer++;
    }

    // TODO: Add additional node types here
    private executeMOV(node: ComputationNodeState, {x, y}: NodeCoordinates, instructionComponents: string[]) {
        const readData = this.executeRead(node, {x, y}, this.isValidSource(instructionComponents[1]));

        if (readData) {
            this.executeWrite(node, {x, y}, this.isValidPortOrRegister(instructionComponents[2]), readData);
        }
    }

    private executeAdd(node: ComputationNodeState, {x, y}: NodeCoordinates, instructionComponents: string[]) {
        const readData = this.executeRead(node, {x, y}, this.isValidSource(instructionComponents[1]));

        if (readData) {
            node.acc = this.clamp(readData + node.acc, MIN_VALUE, MAX_VALUE)
            node.instructionPointer++;
        }
    }

    private clamp(x, min, max) {
        return Math.min(max, Math.max(min, x));
    }

    // TODO: Write a function that updates the test case index accordingly
    // TODO: Figure out how to handle random test case generation

    private executeRead(node: ComputationNodeState, {x, y}: NodeCoordinates, source: Source): number | null {
        if (source.type === "PORT") {
            const sourcePort = source.location;
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
        } else if (source.type === "REGISTER") {
            switch (source.location) {
                case "ACC":
                    return node.acc;
                case "BAK":
                    throw new IllegalArgumentError("BAK cannot be directly read");
                case "NIL":
                    return 0;
            }
        } else {
            return source.value;
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
            throw new IllegalArgumentError(`${input} is not a valid location`);
        }
    }

    private isValidInteger(input: string): Literal {
        const n = Number(input);

        if (!Number.isInteger(n)) {
            throw new IllegalArgumentError("Not an integer");
        }

        return {
            type: "LITERAL",
            value: n
        };
    }

    private isValidSource(input: string): Source {
        try {
            return this.isValidInteger(input);
        } catch (IllegalArgumentError) {
            return this.isValidPortOrRegister(input);
        }
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