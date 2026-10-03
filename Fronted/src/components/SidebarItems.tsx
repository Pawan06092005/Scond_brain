import type { ReactElement } from "react";

export function SidebarItems({text,icon,onClick,active,count}:{
    text:string;
    icon:ReactElement;
  onClick?: () => void;
  active?: boolean;
  count?: number;

}){
  return <button
    type="button"
    onClick={onClick}
    className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-out
      ${active
        ? "bg-purple-50 text-purple-700"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}`}
  >
        {/* Accent bar on the active item */}
        <span className={`absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-purple-600 transition-opacity ${active ? "opacity-100" : "opacity-0"}`} />
        <span className={`flex w-6 items-center justify-center transition-colors ${active ? "text-purple-600" : "text-gray-400 group-hover:text-gray-700"}`}>
          {icon}
        </span>
        <span className="flex-1 text-left">
          {text}
        </span>
        {count !== undefined && (
          <span className={`min-w-6 rounded-full px-2 py-0.5 text-center text-xs ${active ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-500"}`}>
            {count}
          </span>
        )}

    </button>
}
