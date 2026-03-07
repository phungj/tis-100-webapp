import {useEffect, useRef} from "react";

type ErrorDialogProps = {
    stopButtonHandler: () => void,
    errored: boolean,
    message: string
}

export default function ErrorDialog({stopButtonHandler, errored, message}: ErrorDialogProps) {
    const errorDialogRef = useRef<HTMLDialogElement>(null);
    const splitMessage = message.split("\n");

    useEffect(() => {
        if (errored) {
            errorDialogRef.current?.show();
        }
    }, [errored]);

    return (
        <dialog ref={errorDialogRef} className="text-center m-auto modal">
            <div className="modal-box bg-gray-950">
                <h1 className="font-title text-heading text-2xl font-bold mb-2">Error</h1>
                {splitMessage.map((line, i) => <h2 key={i} className={i === splitMessage.length - 1 ? "mb-2" : ""}>{line}</h2>)}
                <form method="dialog">
                    <button onClick={stopButtonHandler} className="block mx-auto btn btn-sm btn-error">Continue</button>
                </form>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button onClick={stopButtonHandler}/>
            </form>
        </dialog>
    );
}