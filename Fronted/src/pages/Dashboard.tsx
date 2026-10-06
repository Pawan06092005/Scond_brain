// import './App.css'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { CreateContentModal } from '../components/CreateContentModal'
import { Sidebar } from '../components/Sidebar'
import { AuthModal, type AuthMode } from '../components/AuthModal'
import { ShareModal, type ShareTarget } from '../components/ShareModal'
import { PlusIcon } from '../icons/Plusicon'
import { ShareIcon } from '../icons/ShareIcon'
import { BrainIcon } from '../icons/BrainIcon'
import { useEffect, useState } from 'react'
import { contentTypes, type ContentFilter, type ContentItem } from '../contentTypes'
// import React from 'react'

function Dashboard({ initialAuthMode = null }: { initialAuthMode?: AuthMode | null }) {
  const [modalOpen, setmodalOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [shareTarget, setShareTarget] = useState<ShareTarget | null>(null)
  const [authMode, setAuthMode] = useState<AuthMode | null>(initialAuthMode)
  const [content, setContent] = useState<ContentItem[]>([])
  const [contentFilter, setContentFilter] = useState<ContentFilter>('all')
  const username = localStorage.getItem('username') || 'User'
  const visibleContent = contentFilter === 'all'
    ? content
    : content.filter((item) => item.type === contentFilter)

  // Number of items per type, shown next to each sidebar item
  const counts: Record<ContentFilter, number> = {
    all: content.length,
    youtube: 0,
    twitter: 0,
    linkedin: 0,
    forms: 0,
    notes: 0,
  }
  content.forEach((item) => {
    if (item.type in counts) counts[item.type]++
  })

  const pageTitle = contentFilter === 'all' ? 'All content' : contentTypes[contentFilter].label

  const fetchContent = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setContent([])
      return
    }

    try {
      const response = await fetch('/api/v1/content', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        localStorage.removeItem('token')
        localStorage.removeItem('username')
        setContent([])
        setAuthMode('signin')
        return
      }

      const data = await response.json()
      setContent(data)
    } catch {
      // Backend not reachable - keep whatever is on screen
    }
  }

  const deleteContent = async (id: string) => {
    const token = localStorage.getItem('token')
    const response = await fetch('/api/v1/content', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ contentId: id }),
    })

    if (response.ok) {
      setContent((prev) => prev.filter((item) => item._id !== id))
    }
  }

  useEffect(() => {
    fetchContent()
  }, [])

  // Sharing needs an account, so ask guests to sign in first
  const openShare = (target: ShareTarget) => {
    if (!localStorage.getItem('token')) {
      setAuthMode('signin')
      return
    }
    setShareTarget(target)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    setContent([])
    setContentFilter('all')
    setAuthMode('signin')
  }

  return (
    <>
      <Sidebar
        activeFilter={contentFilter}
        counts={counts}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onFilter={setContentFilter}
        onSignIn={() => setAuthMode('signin')}
        onSignUp={() => setAuthMode('signup')}
        onLogout={handleLogout}
      />
      <main className='min-h-screen bg-gray-50 md:ml-72'>
        {/* Top bar */}
        <header className='sticky top-0 z-30 border-b border-gray-200 bg-gray-50/80 px-4 py-4 backdrop-blur-md sm:px-8'>
          <div className='flex flex-wrap items-center justify-between gap-4'>
            <div className='flex items-center gap-3'>
              {/* Menu button - mobile only */}
              <button
                type='button'
                onClick={() => setSidebarOpen(true)}
                aria-label='Open menu'
                className='rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden'
              >
                <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='size-6'>
                  <path strokeLinecap='round' strokeLinejoin='round' d='M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5' />
                </svg>
              </button>
              <div>
                <p className='text-sm text-gray-500'>Welcome back, <span className='font-medium text-gray-700'>{username}</span> 🙏</p>
                <h1 className='text-2xl font-bold tracking-tight text-gray-900'>
                  {pageTitle}
                  <span className='ml-2 align-middle text-base font-medium text-gray-400'>{visibleContent.length}</span>
                </h1>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <Button onClick={() => openShare({ kind: 'brain' })} startIcon={<ShareIcon />} size='lg' variant='secondary' text="Share Brain" />
              <Button onClick={() => {
                setmodalOpen(true)
              }} startIcon={<PlusIcon />} size='lg' variant='primary' text="Add Content" />
            </div>
          </div>
        </header>

        <CreateContentModal
          open={modalOpen}
          onClose={() => {
            setmodalOpen(false)
          }}
          onAddContent={(item) => setContent((prev) => [item, ...prev])}
        />

        {shareTarget && (
          <ShareModal target={shareTarget} onClose={() => setShareTarget(null)} />
        )}

        <AuthModal
          mode={authMode}
          onModeChange={setAuthMode}
          onClose={() => setAuthMode(null)}
          onAuthenticated={fetchContent}
        />

        <section className='px-4 py-8 sm:px-8'>
          {visibleContent.length === 0 ? (
            /* Empty state */
            <div className='mx-auto mt-12 flex max-w-sm flex-col items-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center animate-fade-in'>
              <div className='mb-4 flex size-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 [&_svg]:size-7'>
                {contentFilter === 'all' ? <BrainIcon /> : contentTypes[contentFilter].icon}
              </div>
              <h2 className='font-semibold text-gray-900'>
                {contentFilter === 'all' ? 'Your brain is empty' : `No ${pageTitle} saved yet`}
              </h2>
              <p className='mt-1 text-sm text-gray-500'>
                Save videos, posts and notes so you can find them later.
              </p>
              <div className='mt-5'>
                <Button onClick={() => setmodalOpen(true)} startIcon={<PlusIcon />} variant='primary' text='Add Content' />
              </div>
            </div>
          ) : (
            <div className='grid grid-cols-[repeat(auto-fill,minmax(18rem,1fr))] gap-6'>
              {visibleContent.map((item, index) => (
                  <Card
                    key={item._id || `${item.title}-${index}`}
                    id={item._id || ''}
                    type={item.type}
                    link={item.link}
                    text={item.text}
                    description={item.description}
                    title={item.title}
                    onDelete={deleteContent}
                    onShare={(id, title) => openShare({ kind: 'item', id, title })}
                  />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  )
}

export default Dashboard
