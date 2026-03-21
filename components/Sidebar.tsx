import {ProblemDescription} from "@/data/ProblemSpecificationTypes";
import InputNode from "@/components/InputNode";
import OutputNode from "@/components/OutputNode";
import {NodeCoordinates} from "@/data/ProblemSpecificationTypes";
import ProblemDescriptionComponent from "@/components/ProblemDescriptionComponent";
import {InputNodeState, NodeState, OutputNodeState} from "@/src/Interpreter";
import {faForwardFast, faForwardStep, faPlay, faStop} from "@fortawesome/free-solid-svg-icons";
import SidebarButton from "@/components/SidebarButton";

type SidebarProps = {
    problemDescription: ProblemDescription,
    inputNodeCoordinates: NodeCoordinates[],
    outputNodeCoordinates: NodeCoordinates[],
    nodeState: NodeState[][]
    stopButtonHandler: () => void,
    playButtonHandler: () => void,
    stepButtonHandler: () => void,
    fastButtonHandler: () => void
}

// TODO: update rendering of multiple input and output components to be side by side
export default function Sidebar({problemDescription, inputNodeCoordinates, outputNodeCoordinates, nodeState, stopButtonHandler, playButtonHandler, stepButtonHandler, fastButtonHandler}: SidebarProps) {
    return (
        <div className="flex flex-col mr-5">
            <ProblemDescriptionComponent problemDescription={problemDescription}/>
            <div className="flex flex-row">
                {inputNodeCoordinates.map(({x, y}, i) => <InputNode key={i} inputNodeState={nodeState[y][x] as InputNodeState}/>)}
                {outputNodeCoordinates.map(({x, y}, i) => <OutputNode key={i} outputNodeState={nodeState[y][x] as OutputNodeState}/>)}
            </div>
            <span className="flex flex-row">
                <SidebarButton icon={faStop} label="Stop" onClick={stopButtonHandler}/>
                <SidebarButton icon={faPlay} label="Play" onClick={playButtonHandler}/>
                <SidebarButton icon={faForwardStep} label="Step" onClick={stepButtonHandler}/>
                <SidebarButton icon={faForwardFast} label="Fast" onClick={fastButtonHandler}/>
            </span>
        </div>
    )
}