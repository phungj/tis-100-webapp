import {useEffect, useRef} from "react";

type CompletionDialogProps = {
    completed: boolean
}

export default function CompletionDialog({completed}: CompletionDialogProps) {
    const completionDialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        if (completed) {
            completionDialogRef.current?.show();
        }
    }, [completed]);

    return (
        <dialog ref={completionDialogRef} className="text-center m-auto modal">
            <div className="modal-box bg-gray-950">
                <h1 className="font-title text-heading text-2xl font-bold mb-2">Level Complete!</h1>
                <form method="dialog">
                    <button className="block mx-auto btn btn-sm btn-primary">Continue</button>
                </form>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button/>
            </form>
        </dialog>
    );
}