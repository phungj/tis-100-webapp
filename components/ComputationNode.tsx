import {ComputationNodeState} from "@/src/Interpreter";
import {forwardRef, useState} from "react";
import ComputationNodeItem from "@/components/ComputationNodeItem";

type ComputationNodeProps = {
    computationNodeState: ComputationNodeState,
    hasInput: boolean,
    hasOutput: boolean,
}

export const ComputationNode = forwardRef<HTMLTextAreaElement, ComputationNodeProps>(
    ({computationNodeState, hasInput, hasOutput}, ref) => {
        const MAX_LINES = 15;
        const MAX_CHARS_PER_LINE = 18;

        const [code, setCode] = useState<string>("");

        function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
            const currentCode = e.target.value.toUpperCase();
            const lines = currentCode.split("\n");

            if (lines.length > MAX_LINES) {
                return;
            }

            for (const line of lines) {
                if (line.length > MAX_CHARS_PER_LINE) {
                    return;
                }
            }

            setCode(currentCode);
        }

        // TODO: Get the header centered
        // TODO: Try codemirror integration
        // TODO: Try basic highlighting function
        return (
            <div>
                {hasInput ? <h1 className="font-title text-heading text-2xl font-bold text-center">Input</h1> : null}
                <div className="flex">
                    <div className="relative">
                          <textarea value={code} onChange={handleChange} rows={MAX_LINES} ref={ref}
                          className="textarea font-mono leading-snug resize-none bg-black text-white focus:outline-none rounded-none box-content border-4 border-white"
                          style={{width: `${MAX_CHARS_PER_LINE}ch`}}/>
                    </div>
                    <div className="flex flex-col">
                        <ComputationNodeItem name="ACC" value={computationNodeState.acc.toString()}/>
                        <ComputationNodeItem name="BAK" value={computationNodeState.bak.toString()}/>
                        <ComputationNodeItem name="LAST" value="N/A"/>
                        <ComputationNodeItem name="MODE" value="N/A"/>
                        {/* TODO: <ComputationNodeItem name="IDLE" value="N/A"/> */ null}
                    </div>
                </div>
                {hasOutput ? <h1 className="font-title text-heading text-2xl font-bold text-center">Output</h1> : null}
            </div>
        )
    }
);

ComputationNode.displayName = "ComputationNode";
