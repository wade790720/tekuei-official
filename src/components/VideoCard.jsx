import { useEffect, useRef, useState } from 'react'
import { CARD_LABELS } from '../data/cards.js'
import { useLang } from '../i18n'
import { youtubeId } from '../lib/richText.js'
import { Card } from './Card.jsx'
import '../styles/cards.css'

const RATES = [1, 1.5, 2]

const clock = (s) => {
  const t = Math.floor(Number.isFinite(s) ? s : 0)
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`
}

/**
 * A video in a post. A YouTube link plays in YouTube's player; a video file (mp4) in the site's own player.
 * @param {{ src: string, poster?: string, caption?: string, loop?: boolean }} props
 */
export function VideoCard(props) {
  const id = youtubeId(props.src)
  return id ? <YouTubeVideo id={id} caption={props.caption} loop={props.loop} /> : <FileVideo {...props} />
}

/** YouTube's own player in privacy mode (youtube-nocookie.com): no cookies until the visitor plays it. */
function YouTubeVideo({ id, caption, loop = false }) {
  const { lang } = useLang()
  const t = CARD_LABELS[lang]
  const query = loop ? `?loop=1&playlist=${id}` : ''
  return (
    <figure className="post-figure">
      <Card className="video-card video-card--embed">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}${query}`}
          title={caption || t.youtube}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </Card>
      {caption ? <figcaption className="post-figure__caption">{caption}</figcaption> : null}
    </figure>
  )
}

function FileVideo({ src, poster, caption, loop = false }) {
  const { lang } = useLang()
  const t = CARD_LABELS[lang]
  const root = useRef(null)
  const video = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [rate, setRate] = useState(1)

  // A cached video can finish loading metadata before React attaches onLoadedMetadata.
  useEffect(() => {
    const v = video.current
    if (v.readyState >= 1) setDuration(v.duration)
  }, [src])

  const toggle = () => {
    const v = video.current
    if (v.paused) v.play().catch(() => {}) // play() rejects when the browser blocks it; the button stays on "play"
    else v.pause()
  }

  const seek = (e) => {
    video.current.currentTime = Number(e.target.value)
    setTime(video.current.currentTime)
  }

  const nextRate = () => {
    const r = RATES[(RATES.indexOf(rate) + 1) % RATES.length]
    video.current.playbackRate = r
    setRate(r)
  }

  const fullscreen = () => {
    const v = video.current
    if (document.fullscreenElement) document.exitFullscreen()
    else if (root.current.requestFullscreen) root.current.requestFullscreen()
    else v.webkitEnterFullscreen?.() // iOS Safari: only the video element can go full screen
  }

  const progress = duration ? (time / duration) * 100 : 0

  return (
    <figure className="post-figure">
      <Card className="video-card" ref={root} data-playing={playing || undefined}>
        <video
          ref={video}
          src={src}
          poster={poster}
          loop={loop}
          playsInline
          preload="metadata"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onDurationChange={(e) => setDuration(e.currentTarget.duration)}
        />
        <button
          type="button"
          className="video-card__surface"
          onClick={toggle}
          aria-label={playing ? t.pause : t.play}
        >
          <span className="video-card__big" aria-hidden>
            <PlayIcon size={22} />
          </span>
        </button>
        <div className="video-card__bar">
          <button type="button" className="video-card__btn" onClick={toggle} aria-label={playing ? t.pause : t.play}>
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>
          <span className="video-card__time">{clock(time)}</span>
          <input
            className="video-card__seek"
            type="range"
            min="0"
            max={duration || 0}
            step="0.01"
            value={time}
            onChange={seek}
            aria-label={t.seek}
            style={{ '--progress': `${progress}%` }}
          />
          <span className="video-card__time">{clock(duration)}</span>
          <button type="button" className="video-card__btn video-card__rate" onClick={nextRate} aria-label={t.speed}>
            {rate}×
          </button>
          <button type="button" className="video-card__btn" onClick={fullscreen} aria-label={t.fullscreen}>
            <FullscreenIcon />
          </button>
        </div>
      </Card>
      {caption ? <figcaption className="post-figure__caption">{caption}</figcaption> : null}
    </figure>
  )
}

function PlayIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M4.5 2.8v10.4a.8.8 0 0 0 1.2.7l8.4-5.2a.8.8 0 0 0 0-1.4L5.7 2.1a.8.8 0 0 0-1.2.7z" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <rect x="3.5" y="2.5" width="3" height="11" rx="1" />
      <rect x="9.5" y="2.5" width="3" height="11" rx="1" />
    </svg>
  )
}

function FullscreenIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
