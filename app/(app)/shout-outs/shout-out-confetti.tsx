'use client'

import { useEffect, useRef } from 'react'

export const SHOUT_OUT_CONFETTI_EVENT = 'shout-out-confetti'

type ConfettiShape = 'rectangle' | 'circle' | 'streamer'

type ConfettiParticle = {
  x: number
  y: number
  vx: number
  vy: number
  width: number
  height: number
  color: string
  shape: ConfettiShape
  rotation: number
  spin: number
  wobble: number
  wobbleSpeed: number
  drag: number
  gravity: number
  life: number
  maxLife: number
  opacity: number
}

const COLORS = [
  '#ff6b35',
  '#f7c948',
  '#2ec4b6',
  '#4d96ff',
  '#9b5de5',
  '#f15bb5',
  '#00bbf9',
  '#80ed99',
  '#ffffff',
]

const PARTICLES_PER_SIDE = 260
const MAX_PARTICLES = 900

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function randomItem<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)]
}

function createParticle(
  side: 'left' | 'right',
  canvasWidth: number,
  canvasHeight: number,
): ConfettiParticle {
  const isLeft = side === 'left'
  const originX = isLeft ? -18 : canvasWidth + 18
  const originY = canvasHeight * randomBetween(0.52, 0.9)
  const baseAngle = isLeft
    ? randomBetween(-0.9, -0.45)
    : randomBetween(Math.PI + 0.45, Math.PI + 0.9)
  const speed = randomBetween(12, 24)
  const size = randomBetween(5, 11)
  const depth = randomBetween(0.75, 1.25)
  const shape =
    Math.random() > 0.82
      ? 'streamer'
      : Math.random() > 0.72
        ? 'circle'
        : 'rectangle'

  return {
    x: originX,
    y: originY + randomBetween(-28, 22),
    vx: Math.cos(baseAngle) * speed * depth + randomBetween(-1.2, 1.2),
    vy: Math.sin(baseAngle) * speed * depth + randomBetween(-4, 1),
    width:
      shape === 'streamer'
        ? size * randomBetween(1.8, 2.8)
        : size * randomBetween(0.65, 1.2),
    height:
      shape === 'streamer'
        ? size * randomBetween(0.28, 0.5)
        : size * randomBetween(1.1, 1.9),
    color: randomItem(COLORS),
    shape,
    rotation: randomBetween(0, Math.PI * 2),
    spin: randomBetween(-0.32, 0.32),
    wobble: randomBetween(0, Math.PI * 2),
    wobbleSpeed: randomBetween(0.08, 0.22),
    drag: randomBetween(0.985, 0.994),
    gravity: randomBetween(0.22, 0.36) * depth,
    life: 0,
    maxLife: randomBetween(110, 170),
    opacity: 1,
  }
}

function drawParticle(
  context: CanvasRenderingContext2D,
  particle: ConfettiParticle,
) {
  const scaleY = Math.max(0.16, Math.abs(Math.cos(particle.rotation)))
  const shimmer = 0.7 + scaleY * 0.3

  context.save()
  context.globalAlpha = particle.opacity * shimmer
  context.translate(particle.x + Math.sin(particle.wobble) * 5, particle.y)
  context.rotate(particle.rotation)
  context.fillStyle = particle.color

  if (particle.shape === 'circle') {
    context.beginPath()
    context.ellipse(
      0,
      0,
      particle.width * 0.5,
      particle.height * 0.5 * scaleY,
      0,
      0,
      Math.PI * 2,
    )
    context.fill()
  } else if (particle.shape === 'streamer') {
    context.beginPath()
    context.moveTo(-particle.width * 0.5, 0)
    context.bezierCurveTo(
      -particle.width * 0.2,
      -particle.height * 1.4,
      particle.width * 0.18,
      particle.height * 1.4,
      particle.width * 0.5,
      0,
    )
    context.lineWidth = Math.max(2, particle.height)
    context.strokeStyle = particle.color
    context.stroke()
  } else {
    context.fillRect(
      -particle.width * 0.5,
      -particle.height * 0.5 * scaleY,
      particle.width,
      particle.height * scaleY,
    )
  }

  context.restore()
}

export function ShoutOutConfetti() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const particlesRef = useRef<ConfettiParticle[]>([])
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const maybeContext = canvas.getContext('2d')
    if (!maybeContext) {
      return
    }

    const canvasElement = canvas
    const context: CanvasRenderingContext2D = maybeContext

    function resizeCanvas() {
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      canvasElement.width = Math.floor(window.innerWidth * ratio)
      canvasElement.height = Math.floor(window.innerHeight * ratio)
      canvasElement.style.width = `${window.innerWidth}px`
      canvasElement.style.height = `${window.innerHeight}px`
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    function animate() {
      context.clearRect(0, 0, window.innerWidth, window.innerHeight)

      particlesRef.current = particlesRef.current.filter((particle) => {
        particle.life += 1
        particle.vx *= particle.drag
        particle.vy = particle.vy * particle.drag + particle.gravity
        particle.x += particle.vx
        particle.y += particle.vy
        particle.rotation += particle.spin
        particle.wobble += particle.wobbleSpeed
        particle.opacity = Math.max(0, 1 - particle.life / particle.maxLife)

        drawParticle(context, particle)

        return (
          particle.life < particle.maxLife &&
          particle.y < window.innerHeight + 80 &&
          particle.x > -120 &&
          particle.x < window.innerWidth + 120
        )
      })

      if (particlesRef.current.length > 0) {
        animationFrameRef.current = window.requestAnimationFrame(animate)
      } else {
        animationFrameRef.current = null
      }
    }

    function burstConfetti() {
      const nextParticles = [...particlesRef.current]

      for (let index = 0; index < PARTICLES_PER_SIDE; index += 1) {
        nextParticles.push(createParticle('left', window.innerWidth, window.innerHeight))
        nextParticles.push(createParticle('right', window.innerWidth, window.innerHeight))
      }

      particlesRef.current = nextParticles.slice(-MAX_PARTICLES)

      if (animationFrameRef.current === null) {
        animationFrameRef.current = window.requestAnimationFrame(animate)
      }
    }

    resizeCanvas()

    window.addEventListener('resize', resizeCanvas)
    window.addEventListener(SHOUT_OUT_CONFETTI_EVENT, burstConfetti)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener(SHOUT_OUT_CONFETTI_EVENT, burstConfetti)

      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50"
    />
  )
}
