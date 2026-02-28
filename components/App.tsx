"use client";

import {ProblemDescription, ProblemLogic} from "@/data/ProblemSpecificationTypes";
import {useRef, useState} from "react";
import {ComputationNodeState, GRID_HEIGHT, GRID_WIDTH, InputNodeState, Interpreter, NodeState} from "@/src/Interpreter";
import ProblemList from "@/components/ProblemList";
import {getProblemLogic} from "@/data/ProblemLogicMapping";
import {ComputationNode} from "@/components/ComputationNode";
import Sidebar from "@/components/Sidebar";

type AppProps = {
    problems: ProblemDescription[];
}

// TODO: Further styling
export default function App({problems}: AppProps) {
    const problemDescriptionRef = useRef<ProblemDescription | null>(null);
    const interpreter = useRef<Interpreter | null>(null);
    const [nodeState, setNodeState] = useState<NodeState[][]>([]);

    // TODO: Figure out how to get the refs
    const textAreaRefs = useRef<HTMLTextAreaElement[]>([]);

    const [displayProblemList, setDisplayProblemList] = useState<boolean>(true);

    if (displayProblemList) {
        return <ProblemList problems={problems} loadProblem={loadProblem}/>;
    } else {
        // TODO: This will need to be updated for a variety of nodes that can be displayed
        // TODO: Update the computation nodes with refs so you can get their values accordingly
        // TODO: Update to handle named and multiple inputs
        const inputNodeCoordinates = interpreter.current?.getInputNodeCoordinates();
        const inputNodeColumns = inputNodeCoordinates?.map(({x, y}) => x);

        const outputNodeCoordinates = interpreter.current?.getOutputNodeCoordinates();
        const outputNodeColumns = outputNodeCoordinates?.map(({x, y}) => x);

        const computationNodes = nodeState.slice(1, 4);

        return (
            <div className="flex flex-row">
                <Sidebar problemDescription={problemDescriptionRef.current} inputNodeCoordinates={inputNodeCoordinates} outputNodeCoordinates={outputNodeCoordinates} nodeState={nodeState} stopButtonHandler={stopButtonHandler} playButtonHandler={playButtonHandler} stepButtonHandler={stepButtonHandler} fastButtonHandler={fastButtonHandler}/>
                <div className="grid grid-cols-4 grid-rows-3 w-full h-screen">
                    {computationNodes.flat().map((node, i) => <ComputationNode key={i} ref={el => textAreaRefs.current[i] = el} computationNodeState={node as ComputationNodeState} hasInput={i < GRID_WIDTH && inputNodeColumns.includes(i % GRID_WIDTH)} hasOutput={i >= (2 * GRID_WIDTH) && outputNodeColumns?.includes(i % GRID_WIDTH)}/>)}
                </div>
            </div>
        );
    }

    function loadProblem(problemDescription: ProblemDescription) {
        problemDescriptionRef.current = problemDescription;
        interpreter.current = new Interpreter(problemDescription, getProblemLogic(problemDescription.id));
        setNodeState(interpreter.current.getNodeSnapshot());

        setDisplayProblemList(false);
    }

    // TODO:
    function stopButtonHandler() {

    }

    // TODO:
    function playButtonHandler() {
        // TODO: Setinterval here but not as fast
    }

    function stepButtonHandler() {
        for (let y = 1; y < GRID_HEIGHT - 1; y++) {
            for (let x = 0; x < GRID_WIDTH; x++) {
                const currentInput = textAreaRefs.current[(y - 1) * GRID_WIDTH + x].value.trim();

                interpreter.current?.updateInstructions({x, y}, currentInput === "" ? [] : currentInput.split("\n"));
            }
        }

        // tTODO: Catch any exceptions here and then display a dialog
        interpreter.current?.step();
        setNodeState(interpreter.current?.getNodeSnapshot());

        if (interpreter.current?.completed()) {
            // TODO: Update this with a modal of some sort
            console.log("Win");
        }

        // TODO: Determine how to handle interaction from here, possibly just disable everything for now?
        // TODO: Certainly needs to stop playing or going fast if that's the case
    }

    function fastButtonHandler() {
        // TODO: Setinterval here but really fast
    }
}