import {NodeCoordinates, ProblemDescription, ProblemLogic} from "@/data/ProblemSpecificationTypes";
import {IllegalArgumentError, InstructionSyntaxError, NotImplementedError} from "@/src/Errors";

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

        this.reset();
    }

    public step() {
        // TODO: Replace with constants?
        for (let r = 1; r < this.nodes.length - 1; r++) {
            for (let c = 0; c < this.nodes[0].length; c++) {
                const currentNode = this.nodes[r][c];

                if (currentNode.type == "COMPUTATION") {
                    this.executeInstruction(currentNode, {x: c, y: r});
                }
            }
        }
    }

    public reset() {
        this.testCaseIndex = 0;

        const inputNodes = this.problemDescription.inputNodes;
        const currentInputs = this.problemDescription.inputs[this.testCaseIndex];

        for (let i = 0; i < this.problemDescription.inputNodes.length; i++) {
            const inputNode = inputNodes[i];

            this.nodes[inputNode.y][inputNode.x] = {
                type: "INPUT",
                data: currentInputs[i],
                dataPointer: 0
            };
        }

        const outputNodes = this.problemDescription.outputNodes;

        for (let i = 0; i < this.problemDescription.outputNodes.length; i++) {
            const outputNode = outputNodes[i];

            this.nodes[outputNode.y][outputNode.x] = {
                type: "OUTPUT",
                data: [],
                expectedOutput: this.problemLogic.computeExpectedOutput(currentInputs, i),
            };
        }

        const computationNodes = this.getComputationNodeCoordinates();

        for (const computationNodeCoordinates of computationNodes) {
            const currentComputationNode = this.nodes[computationNodeCoordinates.y][computationNodeCoordinates.x];

            if (currentComputationNode.type === "COMPUTATION") {
                this.nodes[computationNodeCoordinates.y][computationNodeCoordinates.x] = {
                    ...currentComputationNode,
                    instructionPointer: 0,
                    acc: 0,
                    bak: 0,
                    writeValue: null,
                    writePort: null
                }
            }
        }
    }

    // TODO: Use this method when appropriate in the app
    public getComputationNodeCoordinates(): NodeCoordinates[] {
        const nodeCoordinates = []

        for (let y = 1; y < GRID_HEIGHT - 1; y++) {
            for (let x = 0; x < GRID_WIDTH; x++) {
                if (this.nodes[y][x].type === "COMPUTATION") {
                    nodeCoordinates.push({x: x, y: y})
                }
            }
        }

        return nodeCoordinates;
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
            throw new IllegalArgumentError(`Node at row ${y}, col ${x} is not a computation node.  If you see this, please report to Jon.`, {x, y}, 0);
        }
    }

    public printNodes() {
        let outputString = "";

        for (const row of this.nodes) {
            for (const node of row) {
                switch (node.type) {
                    case "EMPTY":
                        outputString += "EMPTY "
                        break;
                    case "INPUT":
                        outputString += `INPUT: ${node.data}, ${node.dataPointer} `
                        break;
                    case "OUTPUT":
                        outputString += `OUTPUT: ${node.data}, ${node.expectedOutput} `
                        break;
                    case "COMPUTATION":
                        outputString += `COMPUTATION: ${node.instructions}, ${node.instructionPointer} `
                }
            }

            outputString += "\n";
        }

        console.log(outputString);
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
                        throw new InstructionSyntaxError(`NOP instruction expects ${NOP_COMPONENT_LENGTH} component but had ${instructionComponentsLength}`, {x, y}, node.instructionPointer);
                    } else {
                        this.executeNOP(node);
                        break;
                    }
                case (Instructions.MOV):
                    const MOV_COMPONENT_LENGTH = 3;

                    if (instructionComponentsLength !== MOV_COMPONENT_LENGTH) {
                        throw new InstructionSyntaxError(`MOV instruction expects ${MOV_COMPONENT_LENGTH} components but had ${instructionComponentsLength}`, {x, y}, node.instructionPointer);
                    } else {
                        this.executeMOV(node, {x, y}, instructionComponents);
                        break;
                    }
                case (Instructions.ADD):
                    const ADD_COMPONENT_LENGTH = 2;

                    if (instructionComponentsLength !== ADD_COMPONENT_LENGTH) {
                        throw new InstructionSyntaxError(`ADD instruction expects ${ADD_COMPONENT_LENGTH} components but had ${instructionComponentsLength}`, {x, y}, node.instructionPointer);
                    } else {
                        this.executeADD(node, {x, y}, instructionComponents);
                        break;
                    }
                case (Instructions.SUB):
                    const SUB_COMPONENT_LENGTH = 2;

                    if (instructionComponentsLength !== SUB_COMPONENT_LENGTH) {
                        throw new InstructionSyntaxError(`SUB instruction expects ${SUB_COMPONENT_LENGTH} components but had ${instructionComponentsLength}`, {x, y}, node.instructionPointer);
                    } else {
                        this.executeSUB(node, {x, y}, instructionComponents);
                        break;
                    }
                default:
                    throw new InstructionSyntaxError(`Instruction ${opcode} not defined`, {x, y}, node.instructionPointer);
            }
        }
    }

    // TODO: Implement rest of ports here
    private getNeighborNode(node: ComputationNodeState, {x, y}: NodeCoordinates, port: Port): NodeState | null {
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
                throw new IllegalArgumentError(`Port ${port} not defined`, {x, y}, node.instructionPointer);
        }
    }

    private executeNOP(node: ComputationNodeState) {
        node.instructionPointer++;
    }

    // TODO: Add additional node types here
    private executeMOV(node: ComputationNodeState, {x, y}: NodeCoordinates, instructionComponents: string[]) {
        const readData = this.executeRead(node, {x, y}, this.isValidSource(node, {x, y}, instructionComponents[1]));

        if (readData) {
            this.executeWrite(node, {x, y}, this.isValidPortOrRegister(node, {x, y}, instructionComponents[2]), this.clamp(readData, MIN_VALUE, MAX_VALUE));
        }
    }

    private executeADD(node: ComputationNodeState, {x, y}: NodeCoordinates, instructionComponents: string[]) {
        const readData = this.executeRead(node, {x, y}, this.isValidSource(node, {x, y}, instructionComponents[1]));

        if (readData) {
            node.acc = this.clamp(node.acc + readData, MIN_VALUE, MAX_VALUE);
            node.instructionPointer++;
        }
    }

    private executeSUB(node: ComputationNodeState, {x, y}: NodeCoordinates, instructionComponents: string[]) {
        const readData = this.executeRead(node, {x, y}, this.isValidSource(node, {x, y}, instructionComponents[1]));

        if (readData) {
            node.acc = this.clamp(node.acc - readData, MIN_VALUE, MAX_VALUE);
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
            const sourceNode = this.getNeighborNode(node, {x, y}, sourcePort);

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
                    throw new IllegalArgumentError("BAK cannot be directly read", {x, y}, node.instructionPointer);
                case "NIL":
                    return 0;
            }
        } else {
            return source.value;
        }
    }

    private executeWrite(node: ComputationNodeState, {x, y}: NodeCoordinates, destinationLocation: Location, writeData: number) {
        if (destinationLocation.type === "PORT") {
            const destinationNode = this.getNeighborNode(node, {x, y}, destinationLocation.location);

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
                    throw new IllegalArgumentError("BAK cannot be directly written", {x, y}, node.instructionPointer);
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

    private isValidPortOrRegister(node: ComputationNodeState, {x, y}: NodeCoordinates, input: string): Location {
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
            throw new IllegalArgumentError(`${input} is not a valid location`, {x, y}, node.instructionPointer);
        }
    }

    private isValidInteger(node: ComputationNodeState, {x, y}: NodeCoordinates,input: string): Literal {
        const n = Number(input);

        if (!Number.isInteger(n)) {
            throw new IllegalArgumentError(`${input} was not an integer`, {x, y}, node.instructionPointer);
        }

        return {
            type: "LITERAL",
            value: n
        };
    }

    private isValidSource(node: ComputationNodeState, {x, y}: NodeCoordinates,input: string): Source {
        try {
            return this.isValidInteger(node, {x, y}, input);
        } catch (IllegalArgumentError) {
            return this.isValidPortOrRegister(node, {x, y}, input);
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