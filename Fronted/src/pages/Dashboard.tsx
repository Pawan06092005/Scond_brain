// import './App.css'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { CreateContentModal } from '../components/CreateContentModal'
import { Sidebar } from '../components/Sidebar'
import { PlusIcon } from '../icons/Plusicon'
import { ShareIcon } from '../icons/ShareIcon'
import { useEffect, useState } from 'react'
// import React from 'react'

type ContentItem = {
  _id?: string
  title: string
  link: string
  text?: string
  type: 'twitter' | 'youtube' | 'notes'
}

type ContentFilter = 'twitter' | 'youtube' | 'notes' | 'all'

function Dashboard() {
  const [modalOpen, setmodalOpen] = useState(false)
  const [content, setContent] = useState<ContentItem[]>([])
  const [contentFilter, setContentFilter] = useState<ContentFilter>('all')
  const username = localStorage.getItem('username') || 'User'
  const visibleContent = contentFilter === 'all'
    ? content
    : content.filter((item) => item.type === contentFilter)

  const fetchContent = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      window.location.href = '/signin'
      return
    }

    const response = await fetch('/api/v1/content', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      window.location.href = '/signin'
      return
    }

    const data = await response.json()
    setContent(data)
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

  return (
    <>
      <Sidebar onFilter={setContentFilter} />
      <div className='p-4 position-relative ml-72 min-h-screen bg-gray-100 border-2 '>
        <div className='flex items-start justify-between gap-4 mb-6'>
          <h1 className='text-2xl font-semibold text-gray-800 pt-2'>
            Welcome, {username} 🙏
          </h1>

          <div className='flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-2 shadow-sm  '>
            <Button onClick={() => {
              setmodalOpen(true)
            }} startIcon={<PlusIcon />} size='lg' variant='primary' text="Add Content" />
            <Button onClick={() => { }} startIcon={<ShareIcon />} size='lg' variant='secondary' text="Share Brain" />
          </div>
        </div>

        <CreateContentModal
          open={modalOpen}
          onClose={() => {
            setmodalOpen(false)
          }}
          onAddContent={(item) => setContent((prev) => [item, ...prev])}
        />

        <div className='flex flex-wrap justify-center gap-6'>
          {visibleContent.length === 0 ? (
            <div className='mt-6 text-gray-500'>No content saved yet.</div>
          ) : (
            visibleContent.map((item, index) => (
              <Card
                key={item._id || `${item.title}-${index}`}
                id={item._id || ''}
                type={item.type}
                link={item.link}
                text={item.text}
                title={item.title}
                onDelete={deleteContent}
              />
            ))
          )}
        </div>
      </div>
    </>
  )
}

export default Dashboard
