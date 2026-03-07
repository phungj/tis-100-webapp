import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {IconDefinition} from "@fortawesome/fontawesome-svg-core";

type SidebarButtonProps = {
    icon: IconDefinition,
    label: string,
    onClick: () => void
}

export default function SidebarButton({icon, label, onClick}: SidebarButtonProps) {
    return (
        <div onClick={onClick} className="flex flex-col items-center border-4 border-white">
            <FontAwesomeIcon icon={icon}/>
            <p className="select-none">{label}</p>
        </div>
    );
}