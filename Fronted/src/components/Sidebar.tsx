import { BrainIcon } from "../icons/BrainIcon";
import { XcomIcon } from "../icons/XcomIcon";
import { YourubeIcon } from "../icons/YoutubeIcon";
import { LogoutIcon } from "../icons/logoutIcon";
import { SidebarItems } from "./SidebarItems";
import { Button } from "./Button";
import { NotesIcon } from "../icons/NotesIcon";
import { AllIcon } from "../icons/AllIvon";

type ContentFilter = 'twitter' | 'youtube' | 'notes' | 'all'

export function Sidebar({ onFilter }: { onFilter: (filter: ContentFilter) => void }){
  const isAuthenticated = Boolean(localStorage.getItem('token'));

    return <div className="h-screen bg- white border-r w-72 fixed">
        <div className="flex text-3xl pl-4 items-center pb-4 m-2">
            <div className="text-purple-600 m-5 flex justify-center ">
            <BrainIcon/>
            </div>
         <h1>
            Brainly
         </h1>
         </div  >

        <div className="m-2 flex">
            <div className="flex flex-col justify-center ml-4 gap-3 font-semibold">
                <SidebarItems text="All" icon={<AllIcon/>} onClick={() => onFilter('all')}/>
                <SidebarItems text="X.com" icon={<XcomIcon/>} onClick={() => onFilter('twitter')}/>
                <SidebarItems text="Youtube" icon={<YourubeIcon/>} onClick={() => onFilter('youtube')}/>
                <SidebarItems text="Notes" icon={<NotesIcon/>} onClick={() => onFilter('notes')}/>
            </div>

            <div className="flex flex-col gap-2 m-3 absolute bottom-0 left-0">
                <div className="flex gap-2">
                    <Button
                        onClick={() => { window.location.href = '/signin' }}
                        size='md'
                        variant='primary'
                        text='Sign in'
                    />
                    <Button
                        onClick={() => { window.location.href = '/signup' }}
                        size='md'
                        variant='primary'
                        text='Sign up'
                    />
                </div>
                {isAuthenticated && (
                        <Button
                            onClick={() => {
                              localStorage.removeItem('token')
                              localStorage.removeItem('username')
                              window.location.href = '/signin'
                            }}
                            startIcon={<LogoutIcon/>}
                            size='md'
                            variant='secondary'
                            text='Logout'
                        />
                )}
            </div>
        </div>
    </div>
}