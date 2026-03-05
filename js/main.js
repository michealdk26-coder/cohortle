'use strict'

document.documentElement.classList.add('preload')
window.addEventListener('load', () => {
  setTimeout(() => {
    document.documentElement.classList.remove('preload')
  }, 100)
})

function throttle(fn, delay) {
  let lastCall = 0
  return function (...args) {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      fn.apply(this, args)
    }
  }
}

function debounce(fn, delay) {
  let timer
  return function (...args) {
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

const prefersReducedMotion =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

window.addEventListener('load', () => {
  const loader = document.getElementById('pageLoader')
  if (!loader) return

  const minDisplay = 1200
  const elapsed = Date.now() - (window.loaderStart || Date.now())
  const remaining = Math.max(0, minDisplay - elapsed)

  setTimeout(() => {
    loader.classList.add('hidden')
    setTimeout(() => {
      loader.remove()
      
      document.querySelectorAll('[style*="will-change"]').forEach(el => {
        if (!el.classList.contains('animating')) {
          el.style.willChange = 'auto'
        }
      })
    }, 600)
  }, remaining)
})

;(function () {
  const nav = document.getElementById('navbar')
  if (!nav) return

  const handleScroll = throttle(() => {
    nav.classList.toggle('scrolled', window.scrollY > 50)
  }, 50)

  window.addEventListener('scroll', handleScroll, { passive: true })
})()

;(function () {
  const bar = document.getElementById('scrollProgress')
  if (!bar) return

  let ticking = false

  function update() {
    const scrollTop = window.scrollY
    const docH = document.documentElement.scrollHeight
    const winH = window.innerHeight
    const scrollable = docH - winH
    if (scrollable <= 0) { ticking = false; return }
    const pct = Math.min((scrollTop / scrollable) * 100, 100)
    bar.style.width = pct + '%'
    ticking = false
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update)
      ticking = true
    }
  }, { passive: true })
})()

;(function () {
  const page = window.location.pathname.split('/').pop() || 'index.html'

  document.querySelectorAll('.nav-links a, .mobile-nav-link').forEach(link => {
    const href = link.getAttribute('href')
    if (href === page || (page === '' && href === 'index.html')) {
      link.classList.add('active')
    }
  })
})()

;(function () {
  const hamburger = document.querySelector('.hamburger')
  const mobileNav = document.querySelector('.mobile-nav')
  if (!hamburger || !mobileNav) return

  let isOpen = false

  function openMenu() {
    isOpen = true
    hamburger.classList.add('open')
    hamburger.setAttribute('aria-expanded', 'true')
    mobileNav.classList.add('open')
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.width = '100%'
  }

  function closeMenu() {
    isOpen = false
    hamburger.classList.remove('open')
    hamburger.setAttribute('aria-expanded', 'false')
    mobileNav.classList.remove('open')
    document.body.style.overflow = ''
    document.body.style.position = ''
    document.body.style.width = ''
  }

  hamburger.addEventListener('click', e => {
    e.stopPropagation()
    isOpen ? closeMenu() : openMenu()
  })

  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu)
  })

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isOpen) closeMenu()
  })

  mobileNav.addEventListener('touchmove', e => {
    e.stopPropagation()
  }, { passive: true })
})()

;(function () {
  function getOverlay() {
    return document.getElementById('pageTransition')
  }

  
  window.addEventListener('DOMContentLoaded', () => {
    const overlay = getOverlay()
    if (overlay) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          overlay.classList.remove('transition-active')
        })
      })
    }
  })

  
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href]')
    if (!link) return

    const href = link.getAttribute('href')
    if (!href ||
        href.startsWith('http') ||
        href.startsWith('//') ||
        href.startsWith('#') ||
        href.startsWith('mailto') ||
        href.startsWith('tel') ||
        link.target === '_blank') return

    const currentPage = window.location.pathname.split('/').pop() || 'index.html'
    if (href === currentPage) return

    e.preventDefault()
    const overlay = getOverlay()
    if (overlay) {
      overlay.classList.add('transition-active')
      setTimeout(() => {
        window.location.href = href
      }, 380)
    } else {
      window.location.href = href
    }
  })
})()

;(function () {
  if (prefersReducedMotion) {
    document.querySelectorAll(
      '.reveal,.reveal-left,.reveal-right,.reveal-scale'
    ).forEach(el => el.classList.add('visible'))
    return
  }

  const els = document.querySelectorAll(
    '.reveal,.reveal-left,.reveal-right,.reveal-scale'
  )
  if (!els.length) return

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return

      const el = entry.target
      const delay = el.dataset.delay || el.style.animationDelay || '0s'

      el.style.transitionDelay = delay
      el.classList.add('visible')

      
      const duration = parseFloat(getComputedStyle(el).transitionDuration) * 1000
      const delayMs = parseFloat(delay) * 1000

      setTimeout(() => {
        el.style.willChange = 'auto'
      }, duration + delayMs + 100)

      observer.unobserve(el)
    })
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  })

  els.forEach(el => observer.observe(el))
})()

;(function () {
  const navH = () => {
    const nav = document.getElementById('navbar')
    return nav ? nav.offsetHeight : 70
  }

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'))
      if (!target) return
      e.preventDefault()

      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - navH() - 20,
        behavior: 'smooth'
      })
    })
  })
})()

function animateCounter(el, target, duration) {
  if (duration === undefined) duration = 2000
  if (!el || prefersReducedMotion) {
    if (el) el.textContent = target >= 1000 ? target.toLocaleString() : target
    return
  }

  const start = performance.now()
  const easeOutExpo = t => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t))

  el.classList.add('counting')

  function update(now) {
    const progress = Math.min((now - start) / duration, 1)
    const value = Math.round(easeOutExpo(progress) * target)

    el.textContent = value >= 1000 ? value.toLocaleString() : value

    if (progress < 1) {
      requestAnimationFrame(update)
    } else {
      el.textContent = target >= 1000 ? target.toLocaleString() : target
      el.classList.remove('counting')
      el.classList.add('counted')
    }
  }
  requestAnimationFrame(update)
}

;(function () {
  const statsBar = document.querySelector('.stats-bar')
  if (!statsBar) return

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return

      statsBar.querySelectorAll('.stats-bar__count').forEach(el => {
        const target = parseInt(el.dataset.target)
        if (!isNaN(target)) animateCounter(el, target)
      })
      observer.unobserve(entry.target)
    })
  }, { threshold: 0.4 })

  observer.observe(statsBar)
})()

;(function () {
  const impactSection = document.getElementById('impact')
  if (!impactSection) return

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return

      impactSection.querySelectorAll('.impact-num').forEach(el => {
        const target = parseInt(el.dataset.target)
        if (!isNaN(target)) animateCounter(el, target, 2200)
      })
      observer.unobserve(entry.target)
    })
  }, { threshold: 0.35 })

  observer.observe(impactSection)
})()

;(function () {
  const btn = document.getElementById('backToTop')
  if (!btn) return

  const handleScroll = throttle(() => {
    btn.classList.toggle('visible', window.scrollY > 400)
  }, 100)

  window.addEventListener('scroll', handleScroll, { passive: true })

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })
})()

;(function () {
  const items = document.querySelectorAll('.faq-item')
  if (!items.length) return

  function closeAll() {
    items.forEach(item => {
      item.classList.remove('open')
      const answer = item.querySelector('.faq-answer')
      const arrow = item.querySelector('.faq-arrow')
      if (answer) answer.style.maxHeight = null
      if (arrow) arrow.style.transform = 'rotate(0deg)'
    })
  }

  function openItem(item) {
    item.classList.add('open')
    const answer = item.querySelector('.faq-answer')
    const arrow = item.querySelector('.faq-arrow')
    if (answer) answer.style.maxHeight = answer.scrollHeight + 'px'
    if (arrow) arrow.style.transform = 'rotate(45deg)'
  }

  items.forEach(item => {
    const btn = item.querySelector('.faq-question')
    if (!btn) return
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open')
      closeAll()
      if (!isOpen) openItem(item)
    })
  })

  
  if (items[0]) openItem(items[0])
})()

;(function () {
  const submitBtn = document.getElementById('contactSubmit')
  if (!submitBtn) return

  submitBtn.addEventListener('click', () => {
    const fields = [
      { id: 'firstName', label: 'First Name' },
      { id: 'lastName',  label: 'Last Name' },
      { id: 'orgName',   label: 'Organisation Name' },
      { id: 'email',     label: 'Email Address' },
      { id: 'orgType',   label: 'Organisation Type' },
      { id: 'situation', label: 'Current Situation' },
      { id: 'message',   label: 'Programme Description' }
    ]

    
    document.querySelectorAll('.field-error').forEach(el => el.remove())
    document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'))

    let isValid = true
    let firstError = null

    fields.forEach(({ id, label }) => {
      const el = document.getElementById(id)
      if (!el) return

      const val = el.value.trim()
      const isEmpty =
        !val ||
        val === 'Please select your organisation type' ||
        val === 'Select your current situation'

      if (isEmpty) {
        isValid = false
        el.classList.add('input-error')
        const err = document.createElement('span')
        err.className = 'field-error'
        err.textContent = label + ' is required'
        el.parentNode.appendChild(err)
        if (!firstError) firstError = el
      }

      
      if (id === 'email' && val) {
        const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
        if (!ok) {
          isValid = false
          el.classList.add('input-error')
          const err = document.createElement('span')
          err.className = 'field-error'
          err.textContent = 'Please enter a valid email'
          el.parentNode.appendChild(err)
          if (!firstError) firstError = el
        }
      }
    })

    if (!isValid) {
      if (firstError) {
        const navEl = document.getElementById('navbar')
        const navH = navEl ? navEl.offsetHeight : 70
        window.scrollTo({
          top: firstError.getBoundingClientRect().top + window.scrollY - navH - 20,
          behavior: 'smooth'
        })
      }
      return
    }

    
    submitBtn.textContent = 'Message Sent! \u2713'
    submitBtn.style.background = 'linear-gradient(135deg, #1A7A4A, #0a5c32)'
    submitBtn.disabled = true

    const msg = document.createElement('div')
    msg.className = 'form-success-msg'
    msg.innerHTML =
      '<span class="success-icon">\u2713</span>' +
      '<div><strong>Message received!</strong>' +
      "<p>We'll be in touch within 48 hours.</p></div>"
    submitBtn.parentNode.appendChild(msg)
  })
})()

;(function () {
  const checkbox = document.querySelector('.custom-checkbox')
  const label = document.querySelector('.checkbox-label')
  if (!checkbox) return

  function toggle() { checkbox.classList.toggle('checked') }
  checkbox.addEventListener('click', toggle)
  if (label) label.addEventListener('click', toggle)
})()

;(function () {
  const textarea = document.getElementById('message')
  const counter = document.getElementById('charCounter')
  if (!textarea || !counter) return

  textarea.addEventListener('input', () => {
    const count = textarea.value.length
    counter.textContent = count + ' characters'
    counter.style.color = count > 100 ? '#6EE8A0' : 'rgba(255,255,255,0.3)'
  })
})()

;(function () {
  const progressBar = document.getElementById('phaseProgress')
  const phasePips = document.querySelectorAll('.phase-pip')
  const phasesSection = document.getElementById('phases')

  if (!progressBar || !phasePips.length || !phasesSection) return

  
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      progressBar.style.display = entry.isIntersecting ? 'block' : 'none'
    })
  }, { threshold: 0.05 })
  sectionObserver.observe(phasesSection)

  
  const updatePips = throttle(() => {
    const blocks = document.querySelectorAll('.phase-block')
    blocks.forEach((block, i) => {
      const rect = block.getBoundingClientRect()
      if (rect.top <= window.innerHeight * 0.5 &&
          rect.bottom >= window.innerHeight * 0.5) {
        phasePips.forEach(p => p.classList.remove('active'))
        if (phasePips[i]) phasePips[i].classList.add('active')
      }
    })
  }, 100)

  window.addEventListener('scroll', updatePips, { passive: true })

  
  phasePips.forEach((pip, i) => {
    pip.addEventListener('click', () => {
      const block = document.querySelectorAll('.phase-block')[i]
      if (!block) return
      const navEl = document.getElementById('navbar')
      const navH = navEl ? navEl.offsetHeight : 70
      window.scrollTo({
        top: block.getBoundingClientRect().top + window.scrollY - navH - 30,
        behavior: 'smooth'
      })
    })
  })
})()

;(function () {
  const tags = document.querySelectorAll('.country-tag')
  const container = document.querySelector('.country-tags')
  if (!tags.length || !container) return

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return
      tags.forEach((tag, i) => {
        setTimeout(() => { tag.classList.add('visible') }, i * 60)
      })
      observer.unobserve(entry.target)
    })
  }, { threshold: 0.3 })

  observer.observe(container)
})()

;(function () {
  const blocks = document.querySelectorAll('.phase-block')
  if (!blocks.length || prefersReducedMotion) return

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return
      entry.target.classList.add('in-view')
      observer.unobserve(entry.target)
    })
  }, { threshold: 0.2 })

  blocks.forEach(b => observer.observe(b))
})()

;(function () {
  function animateMetric(id, to, suffix, duration) {
    const el = document.getElementById(id)
    if (!el || prefersReducedMotion) {
      if (el) el.textContent = to + suffix
      return
    }
    const start = performance.now()
    const ease = t => 1 - Math.pow(1 - t, 3)

    function update(now) {
      const p = Math.min((now - start) / duration, 1)
      el.textContent = Math.round(ease(p) * to) + suffix
      if (p < 1) requestAnimationFrame(update)
      else el.textContent = to + suffix
    }
    requestAnimationFrame(update)
  }

  const phase4 = document.querySelector('.phase-block[data-phase="4"]')
  if (!phase4) return

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return
      animateMetric('metric-attendance', 87, '%', 1600)
      animateMetric('metric-completion', 94, '%', 1800)
      observer.unobserve(entry.target)
    })
  }, { threshold: 0.4 })

  observer.observe(phase4)
})()

;(function () {
  
  
  
  const isSafari = /^((?!chrome|android).)*safari/i.test(
    navigator.userAgent
  )

  
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

  if (isSafari || isIOS) {
    
    document.documentElement.classList.add('is-safari')

    
    
    
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault()
        const target = document.querySelector(link.getAttribute('href'))
        if (!target) return

        const navH = document.getElementById('navbar')?.offsetHeight || 70
        const top =
          target.getBoundingClientRect().top + window.scrollY - navH - 20

        
        window.scrollTo({ top, behavior: 'smooth' })
      })
    })
  }

  
  
  
  if (isIOS) {
    let scrollPosition = 0

    
    window.lockScroll = () => {
      scrollPosition = window.scrollY
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollPosition}px`
      document.body.style.width = '100%'
    }

    
    window.unlockScroll = () => {
      document.body.style.removeProperty('overflow')
      document.body.style.removeProperty('position')
      document.body.style.removeProperty('top')
      document.body.style.removeProperty('width')
      window.scrollTo(0, scrollPosition)
    }

    
    const hamburger = document.querySelector('.hamburger')
    const mobileNav = document.querySelector('.mobile-nav')

    if (hamburger && mobileNav) {
      hamburger.addEventListener('click', () => {
        if (mobileNav.classList.contains('open')) {
          window.unlockScroll?.()
        } else {
          window.lockScroll?.()
        }
      })

      
      mobileNav.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
          window.unlockScroll?.()
        })
      })
    }
  }
})()

;(function () {

  
  
  
  
  document.querySelectorAll('button, a').forEach(el => {
    el.addEventListener(
      'touchend',
      e => {
        e.preventDefault()
        el.click()
      },
      { passive: false }
    )
  })

  
  
  
  
  
  window.addEventListener('pageshow', e => {
    if (e.persisted) {
      const overlay = document.getElementById('pageTransition')
      if (overlay) overlay.classList.remove('transition-active')
      const loader = document.getElementById('pageLoader')
      if (loader) loader.remove()
    }
  })

  
  
  
  
  window.addEventListener(
    'resize',
    debounce(() => {
      if (window.innerWidth > 768) {
        const mobileNav = document.querySelector('.mobile-nav')
        const hamburger = document.querySelector('.hamburger')
        if (mobileNav?.classList.contains('open')) {
          mobileNav.classList.remove('open')
          hamburger?.classList.remove('open')
          
          document.body.style.overflow = ''
          document.body.style.position = ''
          document.body.style.width = ''
        }
      }
    }, 200)
  )

  
  
  
  
  if (window.location.hash) {
    setTimeout(() => {
      const target = document.querySelector(window.location.hash)
      if (target) {
        const navH = document.getElementById('navbar')?.offsetHeight || 70
        window.scrollTo({
          top:
            target.getBoundingClientRect().top +
            window.scrollY -
            navH -
            20,
          behavior: 'smooth'
        })
      }
    }, 500)
  }
})()
