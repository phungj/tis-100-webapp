"use client";

import {NodeCoordinates, ProblemDescription, ProblemLogic} from "@/data/ProblemSpecificationTypes";
import {useRef, useState} from "react";
import {ComputationNodeState, GRID_HEIGHT, GRID_WIDTH, InputNodeState, Interpreter, NodeState} from "@/src/Interpreter";
import ProblemList from "@/components/ProblemList";
import {getProblemLogic} from "@/data/ProblemLogicMapping";
import Sidebar from "@/components/Sidebar";
import CompletionDialog from "@/components/CompletionDialog";
import ErrorDialog from "@/components/ErrorDialog";
import {TISError} from "@/src/Errors";
import Navbar from "@/components/Navbar";
import ComputationNode from "@/components/ComputationNode";

const SAVE_PREFIX = "tis-100/";

type AppProps = {
    problems: ProblemDescription[];
}

// TODO: Further styling
export default function App({problems}: AppProps) {
    const [problemDescription, setProblemDescription] = useState<ProblemDescription | null>(null);
    const interpreter = useRef<Interpreter | null>(null);
    const [nodeState, setNodeState] = useState<NodeState[][]>([]);

    // TODO: Redo this with ref forwarding now that you need to load save files
    const instructionValuesRef = useRef<string[]>(Array.from({length: GRID_WIDTH * (GRID_HEIGHT - 2)}, () => ""));

    const [displayProblemList, setDisplayProblemList] = useState<boolean>(true);
    const [completed, setCompleted] = useState<boolean>(false);

    const [errored, setErrored] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");

    const [running, setRunning] = useState(false);

    if (displayProblemList) {
        return <ProblemList problems={problems.sort((p1, p2) => p1.order - p2.order)} loadProblem={loadProblem}/>;
    } else {
        // TODO: This will need to be updated for a variety of nodes that can be displayed
        // TODO: Update the computation nodes with refs so you can get their values accordingly
        // TODO: Update to handle named and multiple inputs
        const inputNodeCoordinates = interpreter.current!.getInputNodeCoordinates();
        const inputNodeColumns = inputNodeCoordinates.map(({x, y}) => x);

        const outputNodeCoordinates = interpreter.current!.getOutputNodeCoordinates();
        const outputNodeColumns = outputNodeCoordinates.map(({x, y}) => x);

        const computationNodes = nodeState.slice(1, 4);

        return (
            <div>
                <CompletionDialog completed={completed}/>
                <ErrorDialog stopButtonHandler={stopButtonHandler} errored={errored} message={errorMessage}/>
                <Navbar homeButtonHandler={homeButtonHandler}/>
                <div className="flex flex-row">
                    <Sidebar problemDescription={problemDescription!} inputNodeCoordinates={inputNodeCoordinates} outputNodeCoordinates={outputNodeCoordinates} nodeState={nodeState} stopButtonHandler={stopButtonHandler} playButtonHandler={playButtonHandler} stepButtonHandler={stepButtonHandler} fastButtonHandler={fastButtonHandler}/>
                    <div className="grid grid-cols-4 grid-rows-3 w-full h-screen">
                        {computationNodes.flat().map((node, i) => <ComputationNode key={i} computationNodeState={node as ComputationNodeState} hasInput={i < GRID_WIDTH && inputNodeColumns.includes(i % GRID_WIDTH)} hasOutput={i >= (2 * GRID_WIDTH) && outputNodeColumns?.includes(i % GRID_WIDTH)} running={running} instructionChangeHandler={instructionChangeHandlerFactory(i)}/>)}
                    </div>
                </div>
            </div>
        );
    }

    function loadProblem(problemDescription: ProblemDescription) {
        setProblemDescription(problemDescription);
        interpreter.current = new Interpreter(problemDescription, getProblemLogic(problemDescription.id));

        const save = localStorage.getItem(SAVE_PREFIX + problemDescription.id);

        if (save) {
            const parsedSave = JSON.parse(save);

            // TODO: Update this accordingly
            // TODO: Refactor this into a function
            for (let y = 1; y < GRID_HEIGHT - 1; y++) {
                for (let x = 0; x < GRID_WIDTH; x++) {
                    const currentInput = parsedSave[(y - 1) * GRID_WIDTH + x].trim();

                    interpreter.current?.updateInstructions({x, y}, currentInput === "" ? [] : currentInput.split("\n"));
                }
            }
        }

        setNodeState(interpreter.current!.getNodeSnapshot());

        setDisplayProblemList(false);
        setCompleted(false);
    }

    function homeButtonHandler() {
        setDisplayProblemList(true);
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
                const currentInput = instructionValuesRef.current[(y - 1) * GRID_WIDTH + x].trim();

                interpreter.current?.updateInstructions({x, y}, currentInput === "" ? [] : currentInput.split("\n"));
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


        // TODO: Determine how to handle interaction from here, possibly just   disable everything for now?
        // TODO: Certainly needs to stop playing or going fast if that's the case
    }

    function fastButtonHandler() {
        // TODO: Setinterval here but really fast
    }

    function instructionChangeHandlerFactory(i: number): (instructions: string) => void {
        return (instructions: string) => {
            instructionValuesRef.current[i] = instructions.trim();

            localStorage.setItem(SAVE_PREFIX + problemDescription?.id, JSON.stringify(instructionValuesRef.current));
        }
    }
}