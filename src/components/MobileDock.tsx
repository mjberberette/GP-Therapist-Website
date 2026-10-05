import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { practice } from '../content'
import { PhoneIcon, PortalIcon } from './Icons'
import './MobileDock.css'

export default function MobileDock() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const nearBottom = window.innerHeight + window.scrollY > document.body.scrollHeight - 600
      setShow(window.scrollY > window.innerHeight * 0.8 && !nearBottom)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="dock"
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        >
          <a href={practice.phoneHref} className="dock-call">
            <PhoneIcon size={17} />
            <span>{practice.phone}</span>
          </a>
          <a href={practice.portal} className="dock-portal" target="_blank" rel="noopener" aria-label="Client Portal">
            <PortalIcon size={17} />
            <span>Portal</span>
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
