"use client";

import {NodeCoordinates, ProblemDescription, ProblemLogic} from "@/data/ProblemSpecificationTypes";
import {useEffect, useLayoutEffect, useRef, useState} from "react";
import {ComputationNodeState, GRID_HEIGHT, GRID_WIDTH, InputNodeState, Interpreter, NodeState} from "@/src/Interpreter";
import ProblemList from "@/components/ProblemList";
import {getProblemLogic} from "@/data/ProblemLogicMapping";
import Sidebar from "@/components/Sidebar";
import CompletionDialog from "@/components/CompletionDialog";
import ErrorDialog from "@/components/ErrorDialog";
import {TISError} from "@/src/Errors";
import Navbar from "@/components/Navbar";
import ComputationNode from "@/components/ComputationNode";
import BrokenNode from "@/components/BrokenNode";

export const MAX_LINES = 15;
export const MAX_CHARS_PER_LINE = 18;

const SAVE_PREFIX = "tis-100/";

type AppProps = {
    problems: ProblemDescription[];
}

// TODO: Further styling
export default function App({problems}: AppProps) {
    const [mounted, setMounted] = useState<boolean>(false);

    const [save, setSave] = useState<string[]>([]);

    const [problemDescription, setProblemDescription] = useState<ProblemDescription | null>(null);
    const interpreter = useRef<Interpreter | null>(null);
    const [nodeState, setNodeState] = useState<NodeState[][]>([]);

    const [instructionValues, setInstructionValues] = useState<string[]>(Array.from({length: GRID_WIDTH * (GRID_HEIGHT - 2)}, () => ""));

    const [displayProblemList, setDisplayProblemList] = useState<boolean>(true);
    const [completed, setCompleted] = useState<boolean>(false);

    const [errored, setErrored] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");

    const [running, setRunning] = useState(false);

    useEffect(() => setMounted(true), []);

    useLayoutEffect(() => {
        if (save.length > 0) {
            // TODO: Refactor this into a function?
            for (let y = 1; y < GRID_HEIGHT - 1; y++) {
                for (let x = 0; x < GRID_WIDTH; x++) {
                    if (nodeState[y][x].type === "COMPUTATION") {
                        const currentNodeIndex = (y - 1) * GRID_WIDTH + x;
                        const currentInstructions = save[currentNodeIndex].trim();

                        interpreter.current?.updateInstructions({x, y}, currentInstructions === "" ? [] : currentInstructions.split("\n"), true);

                    }
                }
            }

            setInstructionValues(save);
        }
    }, [save]);

    // TODO: Possibly attempt to see if there's a way to merge these two useeffects?
    useEffect(() => {
        localStorage.setItem(SAVE_PREFIX + problemDescription?.id, JSON.stringify(instructionValues));
    }, [instructionValues]);

    if (!mounted) {
        return null;
    } else if (displayProblemList) {
        return <ProblemList problems={problems.sort((p1, p2) => p1.order - p2.order)} loadProblem={loadProblem}/>;
    } else {
        // TODO: This will need to be updated for a variety of nodes that can be displayed
        // TODO: Update the computation nodes with refs so you can get their values accordingly
        // TODO: Update to handle named and multiple inputs
        const inputNodeCoordinates = interpreter.current!.getInputNodeCoordinates();

        const outputNodeCoordinates = interpreter.current!.getOutputNodeCoordinates();

        const displayedNodes = nodeState.slice(1, 4);

        return (
            <div>
                <CompletionDialog completed={completed}/>
                <ErrorDialog stopButtonHandler={errorButtonHandler} errored={errored} message={errorMessage}/>
                <Navbar homeButtonHandler={homeButtonHandler}/>
                <div className="flex flex-row">
                    <Sidebar problemDescription={problemDescription!} inputNodeCoordinates={inputNodeCoordinates} outputNodeCoordinates={outputNodeCoordinates} nodeState={nodeState} stopButtonHandler={stopButtonHandler} playButtonHandler={playButtonHandler} stepButtonHandler={stepButtonHandler} fastButtonHandler={fastButtonHandler}/>
                    <div className="grid grid-cols-4 grid-rows-3 w-full min-h-screen">
                        {displayedNodes.flat().map((node, i) => {
                            console.log(nodeState);

                            switch (node.type) {
                                case "COMPUTATION":
                                    const inputNodes = problemDescription!.inputNodes;
                                    const outputNodes = problemDescription!.outputNodes;

                                    const currentNodeCoordinates = {x: i % GRID_WIDTH, y: 1 + Math.floor(i / (GRID_WIDTH))};
                                    const inputIndex = inputNodes.inputNodeCoordinates.findIndex(c => c.x === currentNodeCoordinates.x && c.y === currentNodeCoordinates.y - 1);
                                    const outputIndex = outputNodes.outputNodeCoordinates.findIndex(c => c.x === currentNodeCoordinates.x && c.y === currentNodeCoordinates.y + 1);

                                    let inputName = "";
                                    let outputName = "";

                                    if (inputIndex !== -1) {
                                        const currentInputName = inputNodes.inputNames[inputIndex];

                                        inputName = currentInputName ? `IN.${currentInputName}` : "IN";
                                    } else if (outputIndex !== -1) {
                                        const currentOutputName = outputNodes.outputNames[outputIndex];

                                        outputName = currentOutputName ? `OUT.${currentOutputName}` : "OUT";
                                    }

                                    return <ComputationNode key={i} computationNodeState={node as ComputationNodeState} hasInput={inputIndex !== -1} inputName={inputName} hasOutput={outputIndex !== -1} outputName={outputName} running={running} code={instructionValues[i]} instructionChangeHandler={instructionChangeHandlerFactory(i)}/>
                                case "BROKEN":
                                    return <BrokenNode key={i}/>
                            }
                            })}
                    </div>
                </div>
            </div>
        );
    }

    function loadProblem(problemDescription: ProblemDescription) {
        setProblemDescription(problemDescription);
        interpreter.current = new Interpreter(problemDescription, getProblemLogic(problemDescription.id));

        const save = localStorage.getItem(SAVE_PREFIX + problemDescription.id);

        setSave(save ? JSON.parse(save) : Array.from({ length: 12 }, () => ''));

        setNodeState(interpreter.current!.getNodeSnapshot());

        setDisplayProblemList(false);
        setCompleted(false);
    }

    function homeButtonHandler() {
        setDisplayProblemList(true);
        setRunning(false);
    }

    // TODO:
    function stopButtonHandler() {
        interpreter.current!.reset();
        setNodeState(interpreter.current!.getNodeSnapshot());

        setErrored(false);
        setRunning(false);
    }

    // TODO:
    function playButtonHandler() {
        // TODO: Setinterval here but not as fast
    }


    function stepButtonHandler() {
        for (let y = 1; y < GRID_HEIGHT - 1; y++) {
            for (let x = 0; x < GRID_WIDTH; x++) {
                if (nodeState[y][x].type === "COMPUTATION") {
                    const currentInput = instructionValues[(y - 1) * GRID_WIDTH + x]!.trim();

                    interpreter.current?.updateInstructions({x, y}, currentInput === "" ? [] : currentInput.toUpperCase().split("\n"), false);
                }
            }
        }

        setRunning(true);

        try {
            interpreter.current!.step();
            setNodeState(interpreter.current!.getNodeSnapshot());

            if (interpreter.current!.completed()) {
                setCompleted(true);
            }
        } catch (e) {
            if (e instanceof TISError) {
                setErrored(true);
                setErrorMessage(e.message);
            }
        }
    }

    function fastButtonHandler() {
        // TODO: Setinterval here but really fast
    }

    function errorButtonHandler() {
        setErrored(false);
    }

    function instructionChangeHandlerFactory(i: number): (e: React.ChangeEvent<HTMLTextAreaElement>) => void {
        return (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const currentCode = e.target.value;
            const lines = currentCode.split("\n");

            if (lines.length > MAX_LINES) {
                return;
            }

            for (const line of lines) {
                if (line.length > MAX_CHARS_PER_LINE) {
                    return;
                }
            }

            setInstructionValues(prev => {
                const next = [...prev];
                next[i] = currentCode;
                return next;
            });
        }
    }
}