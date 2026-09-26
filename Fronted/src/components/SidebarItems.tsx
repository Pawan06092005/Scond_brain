import type { ReactElement } from "react";

export function SidebarItems({text,icon,onClick}:{
    text:string;
    icon:ReactElement;
  onClick?: () => void;

}){
  return <div onClick={onClick} className="flex pr-2 mt-2 cursor-pointer hover:bg-gray-200 rounded max-w-48 ">
        <div>
          {icon}
        </div>
        <div>
          {text}
        </div>

    </div>
}