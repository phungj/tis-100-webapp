import {NodeCoordinates} from "@/data/ProblemSpecificationTypes";

export class TISError extends Error {
    constructor(message: string, {x, y}: NodeCoordinates, lineNumber: number) {
        const errorMessage = `Node in row ${y}, col ${x}\nLine ${lineNumber}\n${message}`

        super(errorMessage);
    }
}

export class InstructionSyntaxError extends TISError {
    constructor(message: string, {x, y}: NodeCoordinates, lineNumber: number) {
        super(message, {x, y}, lineNumber);
    }
}

export class IllegalArgumentError extends TISError {
    constructor(message: string, {x, y}: NodeCoordinates, lineNumber: number) {
        super(message, {x, y}, lineNumber);
    }
}

export class NotImplementedError extends TISError {
    constructor(message: string, {x, y}: NodeCoordinates, lineNumber: number) {
        super(message, {x, y}, lineNumber);
    }
}