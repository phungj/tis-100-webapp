import {ComputationNodeState} from "@/src/Interpreter";
import ComputationNodeItem from "@/components/ComputationNodeItem";
import {MAX_CHARS_PER_LINE, MAX_LINES} from "@/components/App";

type ComputationNodeProps = {
    computationNodeState: ComputationNodeState,
    hasInput: boolean,
    hasOutput: boolean,
    running: boolean,
    code: string,
    instructionChangeHandler: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
}

export default function ComputationNode({computationNodeState, hasInput, hasOutput, running, code, instructionChangeHandler}: ComputationNodeProps) {

    // TODO: Get the header centered
    // TODO: Try codemirror integration
    return (
        <div>
            {hasInput ? <h1 className="font-title text-heading text-2xl font-bold text-center">Input</h1> : null}
            <div className="flex">
                <div className="relative">
                          <textarea value={code} disabled={running} onChange={instructionChangeHandler} rows={MAX_LINES}
                                    className="textarea uppercase font-mono leading-snug resize-none bg-black text-white focus:outline-none rounded-none box-content border-4 border-white"
                                    style={{width: `${MAX_CHARS_PER_LINE}ch`}}/>
                </div>
                <div className="flex flex-col">
                    <ComputationNodeItem name="ACC" value={computationNodeState.acc.toString()}/>
                    <ComputationNodeItem name="BAK" value={computationNodeState.bak.toString()}/>
                    <ComputationNodeItem name="LAST" value="N/A"/>
                    <ComputationNodeItem name="IP" value={computationNodeState.instructions.length === 0 ? "0" : (computationNodeState.instructionPointer % computationNodeState.instructions.length).toString()}/>
                    {/* TODO: <ComputationNodeItem name="MODE" value="N/A"/> */ null}
                    {/* TODO: <ComputationNodeItem name="IDLE" value="N/A"/> */ null}
                </div>
            </div>
            {hasOutput ? <h1 className="font-title text-heading text-2xl font-bold text-center">Output</h1> : null}
        </div>
    );
}