import { BrainIcon } from "../icons/BrainIcon";
import { LogoutIcon } from "../icons/logoutIcon";
import { SidebarItems } from "./SidebarItems";
import { Button } from "./Button";
import { AllIcon } from "../icons/AllIvon";
import { contentTypeOrder, contentTypes, type ContentFilter } from "../contentTypes";

export function Sidebar({
    activeFilter,
    counts,
    open,
    onClose,
    onFilter,
    onSignIn,
    onSignUp,
    onLogout,
}: {
    activeFilter: ContentFilter
    counts: Record<ContentFilter, number>
    open: boolean            // only used on small screens
    onClose: () => void
    onFilter: (filter: ContentFilter) => void
    onSignIn: () => void
    onSignUp: () => void
    onLogout: () => void
}) {
  const isAuthenticated = Boolean(localStorage.getItem('token'));
  const username = localStorage.getItem('username') || 'User';

  const selectFilter = (filter: ContentFilter) => {
    onFilter(filter);
    onClose();
  };

    return <>
      {/* Dark backdrop behind the drawer on mobile */}
      {open && (
        <div onClick={onClose} className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm animate-fade-in md:hidden" />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-gray-200 bg-white transition-transform duration-300 ease-out md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-md shadow-purple-600/30">
            <BrainIcon/>
            </div>
         <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Brainly
         </h1>
         </div>

        {/* Filters */}
        <nav className="flex-1 overflow-y-auto px-4">
            <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Library</p>
            <div className="flex flex-col gap-1">
                <SidebarItems text="All" icon={<AllIcon/>} count={counts.all} active={activeFilter === 'all'} onClick={() => selectFilter('all')}/>
                {contentTypeOrder.map((type) => (
                    <SidebarItems
                        key={type}
                        text={contentTypes[type].label}
                        icon={contentTypes[type].icon}
                        count={counts[type]}
                        active={activeFilter === type}
                        onClick={() => selectFilter(type)}
                    />
                ))}
            </div>
        </nav>

        {/* Account */}
        <div className="border-t border-gray-200 p-4">
            {isAuthenticated ? (
                <div className="flex items-center gap-3 rounded-xl p-2">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-purple-100 font-semibold uppercase text-purple-700">
                        {username.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gray-900">{username}</p>
                        <p className="text-xs text-gray-500">Signed in</p>
                    </div>
                    <Button
                        onClick={onLogout}
                        startIcon={<LogoutIcon/>}
                        size='sm'
                        variant='ghost'
                        ariaLabel='Logout'
                    />
                </div>
            ) : (
                <div className="flex gap-2">
                    <Button onClick={onSignIn} size='md' variant='secondary' text='Sign in' fullWidth />
                    <Button onClick={onSignUp} size='md' variant='primary' text='Sign up' fullWidth />
                </div>
            )}
        </div>
      </aside>
    </>
}
