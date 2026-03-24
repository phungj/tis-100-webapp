import {OutputNodeState} from "@/src/Interpreter";

type OutputNodeProps = {
    outputNodeState: OutputNodeState
}

// TODO: Update with highlighting of the current input
// TODO: Update with named inputs
// TODO: Possibly remove additional margin on last element
export default function OutputNode({outputNodeState}: OutputNodeProps) {
    return (
        <div className="mr-2">
            <h1 className="font-title text-heading text-2xl font-bold text-center">Output</h1>
            <ol className="list grid border-4 border-white">
                {outputNodeState.data.map((n, i) => <li key={i}>{n}</li>)}
            </ol>
        </div>
    )
}