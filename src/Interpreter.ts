import {NodeCoordinates, ProblemDescription, ProblemLogic} from "@/data/ProblemSpecificationTypes";
import {
    TISIllegalArgumentError,
    InstructionSyntaxError,
    NotImplementedError,
    TISError
} from "@/src/Errors";

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

type BrokenState = WithType<"BROKEN">;

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
type Operand = Literal | Location;

const OppositePorts = {
    [Ports.UP]: Ports.DOWN,
    [Ports.DOWN]: Ports.UP,
    [Ports.LEFT]: Ports.RIGHT,
    [Ports.RIGHT]: Ports.LEFT,
    [Ports.ANY]: Ports.ANY,
    [Ports.LAST]: Ports.LAST,
} as const;

enum Opcode {
    NOP,
    MOV,
    SWP,
    SAV,
    ADD,
    SUB,
    NEG,
    JMP,
    JEZ,
    JNZ,
    JGZ,
    JLZ,
    JRO,
}

type Instruction = {
    opcode: Opcode,
    src?: Operand,
    dst?: Operand
    lineNumber: number
}


export type ComputationNodeState = WithType<"COMPUTATION"> & {
    instructions: Instruction[],
    instructionPointer: Pointer,
    acc: RegisterValue,
    bak: RegisterValue,
    writeValue: number | null,
    writePort: Port | null
}

export type NodeState = InputNodeState | OutputNodeState | ComputationNodeState | EmptyState | BrokenState;

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

        for (const brokenNodeCoordinates of problemDescription.brokenNodes) {
            this.nodes[brokenNodeCoordinates.y][brokenNodeCoordinates.x] = {type: "BROKEN"};
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
        const currentInputs = inputNodes.inputValues[this.testCaseIndex];
        const inputNodeCoordinates = inputNodes.inputNodeCoordinates;

        for (let i = 0; i < inputNodeCoordinates.length; i++) {
            const currentInputNodeCoordinates = inputNodeCoordinates[i];

            this.nodes[currentInputNodeCoordinates.y][currentInputNodeCoordinates.x] = {
                type: "INPUT",
                data: currentInputs[i],
                dataPointer: 0
            };
        }

        const outputNodes = this.problemDescription.outputNodes;
        const outputNodeCoordinates = outputNodes.outputNodeCoordinates;

        for (let i = 0; i < outputNodeCoordinates.length; i++) {
            const currentOutputNodeCoordinates = outputNodeCoordinates[i];

            this.nodes[currentOutputNodeCoordinates.y][currentOutputNodeCoordinates.x] = {
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
        for (const outputNodeCoordinates of this.problemDescription.outputNodes.outputNodeCoordinates) {
            const currentOutputNode = this.nodes[outputNodeCoordinates.y][outputNodeCoordinates.x];

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

    public updateInstructions({x, y}: NodeCoordinates, instructions: string[], loading: boolean) {
        const node = this.nodes[y][x];

        if (node.type == "COMPUTATION") {
            if (loading) {
                try {
                    this.compileInstructions({x, y}, node, instructions);
                } catch (e) {
                    if (e instanceof TISError) {

                    }
                }
            } else {
                this.compileInstructions({x, y}, node, instructions);
            }

        } else {
            throw new TISIllegalArgumentError(`Node at row ${y}, col ${x} is not a computation node.  If you see this, please report to Jon.`, {x, y}, 0);
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
                        outputString += `COMPUTATION: ${node.instructions[node.instructionPointer]} ${node.writePort} ${node.writeValue} `
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
        return this.problemDescription.inputNodes.inputNodeCoordinates;
    }

    public getOutputNodeCoordinates(): NodeCoordinates[] {
        return this.problemDescription.outputNodes.outputNodeCoordinates;
    }

    private compileInstructions({x, y}: NodeCoordinates, node: ComputationNodeState, instructions: string[]) {
        node.instructions = [];

        const instructionOperands = [];
        const labelMapping = new Map<String, Pointer>();

        for (let i = 0; i < instructions.length; i++) {
            const trimmedInstruction = instructions[i].trim();

            if (trimmedInstruction.startsWith("#")) {
                continue;
            }

            const colonIndex = trimmedInstruction.indexOf(":");

            if (colonIndex !== -1) {
                labelMapping.set(trimmedInstruction.substring(0, colonIndex), node.instructions.length);

                if (colonIndex === trimmedInstruction.length - 1) {
                    continue;
                }
            }

            const remainingInstruction = trimmedInstruction.substring(colonIndex + 1, trimmedInstruction.length).trim();

            const [opcodeStr, ...operands] = remainingInstruction.split(/\s+/);

            const opcode = Opcode[opcodeStr as keyof typeof Opcode];

            if (opcode === undefined) {
                throw new InstructionSyntaxError(`Instruction ${opcode} not defined`, {x, y}, i);
            }

            node.instructions.push({
                opcode,
                lineNumber: i + 1
            })

            instructionOperands.push(operands);
        }

        for (let i = 0; i < node.instructions.length; i++) {
            const currentInstruction = node.instructions[i];
            const currentInstructionOpcode = currentInstruction.opcode;
            const currentInstructionOperands = instructionOperands[i];
            const currentInstructionOperandsLength = currentInstructionOperands.length;

            let expectedOperandCount;

            switch (currentInstructionOpcode) {
                case Opcode.NOP:
                case Opcode.SAV:
                case Opcode.SWP:
                case Opcode.NEG:
                    expectedOperandCount = 0;

                    if (currentInstructionOperands.length !== expectedOperandCount) {
                        throw new InstructionSyntaxError(`${Opcode[currentInstructionOpcode]} instruction expects ${expectedOperandCount} operands but had ${currentInstructionOperandsLength}`, {x, y}, currentInstruction.lineNumber);
                    }

                    break;
                case Opcode.MOV:
                    expectedOperandCount = 2;

                    if (currentInstructionOperandsLength !== expectedOperandCount) {
                        throw new InstructionSyntaxError(`${Opcode[currentInstructionOpcode]} instruction expects ${expectedOperandCount} operands but had ${currentInstructionOperandsLength}`, {x, y}, currentInstruction.lineNumber);
                    } else {
                        currentInstruction.src = this.isValidSource(node, {x, y}, currentInstructionOperands[0]);
                        currentInstruction.dst = this.isValidPortOrRegister(node, {x, y}, currentInstructionOperands[1]);

                        break;
                    }
                case Opcode.ADD:
                case Opcode.SUB:
                    expectedOperandCount = 1;

                    if (currentInstructionOperandsLength !== expectedOperandCount) {
                        throw new InstructionSyntaxError(`${Opcode[currentInstructionOpcode]} instruction expects ${expectedOperandCount} operand but had ${currentInstructionOperandsLength}`, {x, y}, currentInstruction.lineNumber);
                    } else {
                        currentInstruction.src = this.isValidSource(node, {x, y}, currentInstructionOperands[0]);

                        break;
                    }
                case Opcode.JMP:
                case Opcode.JEZ:
                case Opcode.JNZ:
                case Opcode.JGZ:
                case Opcode.JLZ:
                    expectedOperandCount = 1;

                    if (currentInstructionOperandsLength !== expectedOperandCount) {
                        throw new InstructionSyntaxError(`${Opcode[currentInstructionOpcode]} instruction expects ${expectedOperandCount} operand but had ${currentInstructionOperandsLength}`, {x, y}, currentInstruction.lineNumber);
                    } else {
                        const targetLabel = currentInstructionOperands[0];
                        const targetLabelMapping = labelMapping.get(targetLabel);

                        if (targetLabelMapping === undefined) {
                            throw new TISIllegalArgumentError(`Unknown label ${targetLabel}`, {x, y}, currentInstruction.lineNumber);
                        }

                        currentInstruction.dst = {type: "LITERAL", value: targetLabelMapping};

                        break;
                    }
                case Opcode.JRO:
                    expectedOperandCount = 1;

                    if (currentInstructionOperandsLength !== expectedOperandCount) {
                        throw new InstructionSyntaxError(`${Opcode[currentInstructionOpcode]} instruction expects ${expectedOperandCount} operand but had ${currentInstructionOperandsLength}`, {x, y}, currentInstruction.lineNumber);
                    } else {
                        try {
                            currentInstruction.dst = this.isValidInteger(node, {x, y}, currentInstructionOperands[0]);
                        } catch (e) {
                            if (e instanceof TISIllegalArgumentError) {
                                currentInstruction.dst = this.isValidPortOrRegister(node, {x, y}, currentInstructionOperands[0]);
                            }
                        }

                        break;
                    }
                default:
                    throw new InstructionSyntaxError(`Instruction ${currentInstructionOpcode} not defined`, {x, y}, currentInstruction.lineNumber);
            }
        }
    }

    private executeInstruction(node: ComputationNodeState, {x, y}: NodeCoordinates) {
        if (node.instructions.length !== 0 && !node.writeValue) {
            if (node.instructionPointer >= node.instructions.length) {
                node.instructionPointer = 0;
            }

            const currentInstruction = node.instructions[node.instructionPointer];
            const currentInstructionOpcode = currentInstruction.opcode;

            // TODO: Implement the rest of the instructions here
            switch (currentInstructionOpcode) {
                case Opcode.NOP:
                    this.executeNOP(node);
                    break;
                case Opcode.MOV:
                    this.executeMOV(node, {x, y}, currentInstruction.src!, currentInstruction.dst!);
                    break;
                case Opcode.ADD:
                    this.executeADD(node, {x, y}, currentInstruction.src!);
                    break;
                case Opcode.SUB:
                    this.executeSUB(node, {x, y}, currentInstruction.src!);
                    break;
                case Opcode.SWP:
                    this.executeSWP(node);
                    break;
                case Opcode.SAV:
                    this.executeSAV(node);
                    break;
                case Opcode.NEG:
                    this.executeNEG(node);
                    break;
                case Opcode.JMP:
                    this.executeJMP(node, (currentInstruction.dst! as Literal).value);
                    break;
                case Opcode.JEZ:
                    this.executeJEZ(node, (currentInstruction.dst! as Literal).value);
                    break;
                case Opcode.JNZ:
                    this.executeJNZ(node, (currentInstruction.dst! as Literal).value);
                    break;
                case Opcode.JGZ:
                    this.executeJGZ(node, (currentInstruction.dst! as Literal).value);
                    break;
                case Opcode.JLZ:
                    this.executeJLZ(node, (currentInstruction.dst! as Literal).value);
                    break;
                case Opcode.JRO:
                    this.executeJRO(node, {x, y}, currentInstruction.dst!);
                    break;
                default:
                    throw new InstructionSyntaxError(`Instruction ${currentInstructionOpcode} not defined`, {x, y}, node.instructionPointer);
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
                throw new TISIllegalArgumentError(`Port ${port} not defined`, {x, y}, node.instructionPointer);
        }
    }

    private executeNOP(node: ComputationNodeState) {
        node.instructionPointer++;
    }

    // TODO: Add additional node types here
    private executeMOV(node: ComputationNodeState, {x, y}: NodeCoordinates, src: Operand, dst: Operand) {
        const readData = this.executeRead(node, {x, y}, src);

        if (readData !== null) {
            this.executeWrite(node, {x, y}, dst as Location, this.clamp(readData, MIN_VALUE, MAX_VALUE));
        }
    }

    private executeADD(node: ComputationNodeState, {x, y}: NodeCoordinates, src: Operand) {
        const readData = this.executeRead(node, {x, y}, src);

        if (readData) {
            node.acc = this.clamp(node.acc + readData, MIN_VALUE, MAX_VALUE);
            node.instructionPointer++;
        }
    }

    private executeSUB(node: ComputationNodeState, {x, y}: NodeCoordinates, src: Operand) {
        const readData = this.executeRead(node, {x, y}, src);

        if (readData) {
            node.acc = this.clamp(node.acc - readData, MIN_VALUE, MAX_VALUE);
            node.instructionPointer++;
        }
    }

    private executeSWP(node: ComputationNodeState) {
        const currentACC = node.acc;

        node.acc = node.bak;
        node.bak = currentACC;

        node.instructionPointer++;
    }

    private executeSAV(node: ComputationNodeState) {
        node.bak = node.acc;

        node.instructionPointer++;
    }

    private executeNEG(node: ComputationNodeState) {
        node.acc = -node.acc;

        node.instructionPointer++;
    }

    private clamp(x: number, min: number, max: number): number {
        return Math.min(max, Math.max(min, x));
    }

    // TODO: Write a function that updates the test case index accordingly
    // TODO: Figure out how to handle random test case generation

    private executeRead(node: ComputationNodeState, {x, y}: NodeCoordinates, source: Operand): number | null {
        if (source.type === "PORT") {
            const sourcePort = source.location;
            const sourceNode = this.getNeighborNode(node, {x, y}, sourcePort);

            if (sourceNode && sourceNode.type == "INPUT" && sourceNode.dataPointer < sourceNode.data.length) {
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
                    throw new TISIllegalArgumentError("BAK cannot be directly read", {x, y}, node.instructionPointer);
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
                    throw new TISIllegalArgumentError("BAK cannot be directly written", {x, y}, node.instructionPointer);
                case "NIL":
                    break;
            }

            node.instructionPointer++;
        }
    }

    private executeJMP(node: ComputationNodeState, instructionPointer: Pointer) {
        node.instructionPointer = instructionPointer;
    }

    private executeJEZ(node: ComputationNodeState, instructionPointer: Pointer) {
        node.instructionPointer = node.acc === 0 ? instructionPointer : node.instructionPointer + 1;
    }

    private executeJNZ(node: ComputationNodeState, instructionPointer: Pointer) {
        node.instructionPointer = node.acc !== 0 ? instructionPointer : node.instructionPointer + 1;
    }

    private executeJGZ(node: ComputationNodeState, instructionPointer: Pointer) {
        node.instructionPointer = node.acc > 0 ? instructionPointer : node.instructionPointer + 1;
    }

    private executeJLZ(node: ComputationNodeState, instructionPointer: Pointer) {
        node.instructionPointer = node.acc < 0 ? instructionPointer : node.instructionPointer + 1;
    }

    private executeJRO(node: ComputationNodeState, {x, y}: NodeCoordinates, sourceLocation: Operand) {
        const offset = this.executeRead(node, {x, y}, sourceLocation);

        if (offset !== null) {
            node.instructionPointer += offset;
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
            throw new TISIllegalArgumentError(`${input} is not a valid location`, {x, y}, node.instructionPointer);
        }
    }

    private isValidInteger(node: ComputationNodeState, {x, y}: NodeCoordinates,input: string): Literal {
        const n = Number(input);

        if (!Number.isInteger(n)) {
            throw new TISIllegalArgumentError(`${input} was not an integer`, {x, y}, node.instructionPointer);
        }

        return {
            type: "LITERAL",
            value: n
        };
    }

    private isValidSource(node: ComputationNodeState, {x, y}: NodeCoordinates,input: string): Operand {
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