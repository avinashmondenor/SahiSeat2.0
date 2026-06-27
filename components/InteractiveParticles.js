'use client'

import { useEffect, useRef } from 'react'

export default function InteractiveParticles() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId
    let particles = []
    let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2, targetX: window.innerWidth / 2, targetY: window.innerHeight / 2 }
    let isMobile = false
    let prefersReducedMotion = false
    let time = 0

    // Check system preference for reduced motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotion = motionQuery.matches
    const handleMotionChange = (e) => {
      prefersReducedMotion = e.matches
    }
    motionQuery.addEventListener('change', handleMotionChange)

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      isMobile = window.innerWidth < 768
      initParticles()
    }

    class Particle {
      constructor() {
        this.reset(true)
      }

      reset(init = false) {
        this.x = Math.random() * canvas.width
        this.y = init ? Math.random() * canvas.height : canvas.height + 10
        
        // Define depth layers: 0 (background), 1 (midground), 2 (foreground)
        const randLayer = Math.random()
        if (randLayer < 0.45) {
          this.layer = 0
          this.depth = 0.15
          this.size = Math.random() * 0.4 + 0.5 // 0.5px to 0.9px
          this.baseSpeedX = (Math.random() - 0.5) * 0.04
          this.baseSpeedY = -(Math.random() * 0.03 + 0.01) // extremely slow upwards drift
        } else if (randLayer < 0.8) {
          this.layer = 1
          this.depth = 0.4
          this.size = Math.random() * 0.6 + 1.0 // 1.0px to 1.6px
          this.baseSpeedX = (Math.random() - 0.5) * 0.08
          this.baseSpeedY = -(Math.random() * 0.06 + 0.02)
        } else {
          this.layer = 2
          this.depth = 0.8
          this.size = Math.random() * 0.7 + 1.7 // 1.7px to 2.4px
          this.baseSpeedX = (Math.random() - 0.5) * 0.12
          this.baseSpeedY = -(Math.random() * 0.09 + 0.03)
        }

        // Twinkle properties
        this.alpha = Math.random() * 0.28 + 0.08
        this.twinkleSpeed = Math.random() * 0.01 + 0.003
        this.twinklePhase = Math.random() * Math.PI * 2

        // Galaxy dot properties (15% of particles glow and pulse)
        this.isGalaxyDot = Math.random() < 0.15
        this.pulseSpeed = Math.random() * 0.015 + 0.005
        this.pulsePhase = Math.random() * Math.PI * 2

        // Color selection: 65% gray, 20% purple, 15% blue
        const r = Math.random()
        if (r < 0.65) {
          this.color = 'rgba(161, 161, 170, ' // zinc-400
        } else if (r < 0.85) {
          this.color = 'rgba(124, 58, 237, ' // purple-600
        } else {
          this.color = 'rgba(37, 99, 235, ' // blue-600
        }
      }

      update() {
        if (prefersReducedMotion) return

        // Twinkle opacity
        this.twinklePhase += this.twinkleSpeed
        const opacityDelta = Math.sin(this.twinklePhase) * 0.08
        this.currentOpacity = Math.max(0.04, Math.min(0.42, this.alpha + opacityDelta))

        // Pulse phase
        if (this.isGalaxyDot) {
          this.pulsePhase += this.pulseSpeed
        }

        // Ambient drift
        this.y += this.baseSpeedY * (isMobile ? 0.45 : 1)
        this.x += this.baseSpeedX * (isMobile ? 0.45 : 1)

        // Recycle if out of bounds
        if (this.y < -10 || this.x < -10 || this.x > canvas.width + 10) {
          this.reset(false)
        }
      }

      getRenderCoords() {
        let px = 0
        let py = 0
        let attractX = 0
        let attractY = 0

        if (!isMobile && !prefersReducedMotion) {
          // Parallax offset based on mouse position relative to center of screen
          const dx = mouse.x - canvas.width / 2
          const dy = mouse.y - canvas.height / 2
          px = dx * 0.024 * this.depth
          py = dy * 0.024 * this.depth

          // Gentle mouse attraction
          const diffX = mouse.x - (this.x + px)
          const diffY = mouse.y - (this.y + py)
          const dist = Math.sqrt(diffX * diffX + diffY * diffY)
          if (dist < 160) {
            const force = (160 - dist) / 160 // 0 to 1
            attractX = diffX / dist * force * 9 * this.depth
            attractY = diffY / dist * force * 9 * this.depth
          }
        }

        return {
          x: this.x + px + attractX,
          y: this.y + py + attractY
        }
      }

      draw(coords) {
        const opacity = prefersReducedMotion ? this.alpha : this.currentOpacity
        const { x, y } = coords

        // Draw soft pulsing glow for galaxy dots
        if (this.isGalaxyDot && !prefersReducedMotion) {
          const pulseFactor = 1.0 + Math.sin(this.pulsePhase) * 0.35
          const glowRadius = this.size * 3 * pulseFactor * (isMobile ? 0.6 : 1.0)
          
          ctx.beginPath()
          const grad = ctx.createRadialGradient(x, y, 0, x, y, glowRadius)
          grad.addColorStop(0, this.color + (opacity * 0.3) + ')')
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)')
          ctx.fillStyle = grad
          ctx.arc(x, y, glowRadius, 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.beginPath()
        ctx.arc(x, y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = this.color + opacity + ')'
        ctx.fill()
      }
    }

    const initParticles = () => {
      particles = []
      const count = isMobile ? 45 : 140
      for (let i = 0; i < count; i++) {
        particles.push(new Particle())
      }
    }

    // Mouse movement tracker with easing/lerp
    const handleMouseMove = (e) => {
      mouse.targetX = e.clientX
      mouse.targetY = e.clientY
    }

    window.addEventListener('resize', resizeCanvas)
    window.addEventListener('mousemove', handleMouseMove)

    // Initial setup
    resizeCanvas()

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      time += 0.003
      // Global slow breathing pulse for connection lines
      const linePulse = 0.75 + 0.25 * Math.sin(time)

      // Smooth mouse lerping
      if (!isMobile && !prefersReducedMotion) {
        mouse.x += (mouse.targetX - mouse.x) * 0.06
        mouse.y += (mouse.targetY - mouse.y) * 0.06
      }

      // 1. Update all particles
      for (let i = 0; i < particles.length; i++) {
        particles[i].update()
      }

      // 2. Pre-calculate rendering coordinates to ensure line connecting matches stars' visual positions
      const renderCoords = []
      for (let i = 0; i < particles.length; i++) {
        renderCoords.push(particles[i].getRenderCoords())
      }

      // 3. Draw constellation connection lines
      ctx.lineWidth = 0.6
      const connectionDist1 = isMobile ? 65 : 100
      const connectionDist2 = isMobile ? 75 : 120

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i]
        if (p1.layer === 0) continue // deep space layer has no connections

        const coord1 = renderCoords[i]

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          if (p1.layer !== p2.layer) continue // only connect stars in same depth plane

          const coord2 = renderCoords[j]
          const dx = coord1.x - coord2.x
          const dy = coord1.y - coord2.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          const limit = p1.layer === 1 ? connectionDist1 : connectionDist2

          if (dist < limit) {
            const strength = 1.0 - dist / limit
            const maxLineAlpha = isMobile ? 0.015 : 0.038
            const alpha = strength * maxLineAlpha * linePulse
            
            ctx.beginPath()
            ctx.moveTo(coord1.x, coord1.y)
            ctx.lineTo(coord2.x, coord2.y)
            ctx.strokeStyle = p1.layer === 1 ? 'rgba(124, 58, 237, ' + alpha + ')' : 'rgba(37, 99, 235, ' + alpha + ')'
            ctx.stroke()
          }
        }
      }

      // 4. Draw particles
      for (let i = 0; i < particles.length; i++) {
        particles[i].draw(renderCoords[i])
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', handleMouseMove)
      motionQuery.removeEventListener('change', handleMotionChange)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 -z-20 h-full w-full bg-[#09090B]"
    />
  )
}
