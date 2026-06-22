const CARD_PATH = (() => {
  const m = window.location.pathname.match(/^(.*\/businesscard)\/?/)
  return m ? m[1] : '/businesscard'
})()
const AUTOPLAY_MS = 4500

function getCardUrl() {
  return window.location.origin + CARD_PATH
}

function openModal(view) {
  const modal = document.getElementById('modal')
  const copyView = document.getElementById('copyView')
  const qrView = document.getElementById('qrView')
  if (!modal || !copyView || !qrView) return

  modal.classList.add('open')
  copyView.classList.toggle('active', view === 'copy')
  qrView.classList.toggle('active', view === 'qr')

  if (view === 'qr') generateQr()
}

function closeModal() {
  const modal = document.getElementById('modal')
  const copyView = document.getElementById('copyView')
  const qrView = document.getElementById('qrView')
  if (!modal || !copyView || !qrView) return

  modal.classList.remove('open')
  copyView.classList.remove('active')
  qrView.classList.remove('active')
}

async function copyUrl() {
  const text = getCardUrl()
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const input = document.createElement('input')
    input.value = text
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    input.remove()
  }

  const btn = document.getElementById('copyURL')
  if (!btn) return
  const prev = btn.innerHTML
  btn.innerHTML = '<span class="action">Copied</span>'
  setTimeout(() => { btn.innerHTML = prev }, 1200)
}

function nativeShare() {
  const url = getCardUrl()
  const payload = {
    title: 'Wellness Lab — Business Card',
    text: 'Wellness Lab — Digital Business Card',
    url,
  }

  if (navigator.share) {
    navigator.share(payload).catch(() => openModal('copy'))
    return
  }
  openModal('copy')
}

let qrRenderedFor = null
function generateQr() {
  const container = document.getElementById('qr')
  if (!container) return

  const url = getCardUrl()
  if (qrRenderedFor === url) return
  qrRenderedFor = url

  container.innerHTML = ''

  const wrapper = document.createElement('div')
  wrapper.className = 'qrWrapper'

  const qrTarget = document.createElement('div')
  qrTarget.className = 'qrCanvas'
  wrapper.appendChild(qrTarget)

  const logoWrap = document.createElement('div')
  logoWrap.className = 'qrLogoWrap'
  logoWrap.setAttribute('aria-hidden', 'true')
  const logo = document.createElement('img')
  logo.className = 'qrLogo'
  logo.src = '../logo.png'
  logo.alt = ''
  logo.width = 48
  logo.height = 48
  logoWrap.appendChild(logo)
  wrapper.appendChild(logoWrap)

  container.appendChild(wrapper)

  // Higher error correction so the centre logo does not break scanning
  // eslint-disable-next-line no-undef
  new QRCode(qrTarget, {
    text: url,
    width: 220,
    height: 220,
    colorDark: '#1B4332',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.H,
  })
}

const carouselControllers = []

function createCarousel(carousel) {
  const viewport = carousel.querySelector('.carouselViewport')
  const track = carousel.querySelector('.carouselTrack')
  const slides = carousel.querySelectorAll('.carouselSlide')
  const dotsContainer = carousel.querySelector('.carouselDots')
  if (!viewport || !track || slides.length === 0) return null

  let index = 0
  let timer = null
  let paused = false

  const goTo = (i) => {
    index = (i + slides.length) % slides.length
    track.style.transform = `translateX(-${index * 100}%)`
    dotsContainer?.querySelectorAll('.carouselDot').forEach((dot, di) => {
      dot.classList.toggle('active', di === index)
    })
  }

  if (dotsContainer) {
    dotsContainer.innerHTML = ''
    slides.forEach((_, i) => {
      const dot = document.createElement('span')
      dot.className = `carouselDot${i === 0 ? ' active' : ''}`
      dotsContainer.appendChild(dot)
    })
  }

  const next = () => goTo(index + 1)

  const start = () => {
    stop()
    if (slides.length <= 1 || paused) return
    timer = window.setInterval(next, AUTOPLAY_MS)
  }

  const stop = () => {
    if (timer) {
      window.clearInterval(timer)
      timer = null
    }
  }

  carousel.addEventListener('mouseenter', () => { paused = true; stop() })
  carousel.addEventListener('mouseleave', () => { paused = false; start() })
  carousel.addEventListener('touchstart', () => { paused = true; stop() }, { passive: true })
  carousel.addEventListener('touchend', () => {
    window.setTimeout(() => { paused = false; start() }, AUTOPLAY_MS)
  }, { passive: true })

  return { goTo, start, stop, reset: () => goTo(0) }
}

function initCarousels() {
  document.querySelectorAll('.carousel').forEach((carousel) => {
    const controller = createCarousel(carousel)
    if (controller) carouselControllers.push({ carousel, ...controller })
  })
}

function initShowcaseTabs() {
  const tabs = document.querySelectorAll('.showcaseTab')
  const panels = {
    transformations: document.getElementById('panelTransformations'),
    reviews: document.getElementById('panelReviews'),
  }

  const syncAutoplay = (activeKey) => {
    carouselControllers.forEach(({ carousel, start, stop, reset }) => {
      const panel = carousel.closest('.showcasePanel')
      const isActive = activeKey === 'transformations'
        ? panel?.id === 'panelTransformations'
        : panel?.id === 'panelReviews'

      if (isActive) {
        reset()
        start()
      } else {
        stop()
      }
    })
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab
      tabs.forEach((t) => {
        const active = t === tab
        t.classList.toggle('active', active)
        t.setAttribute('aria-selected', active ? 'true' : 'false')
      })
      Object.entries(panels).forEach(([key, panel]) => {
        if (!panel) return
        const active = key === target
        panel.classList.toggle('active', active)
        panel.hidden = !active
      })
      syncAutoplay(target)
    })
  })

  syncAutoplay('transformations')
}

function init() {
  document.getElementById('share')?.addEventListener('click', (e) => { e.preventDefault(); nativeShare() })
  document.getElementById('showQR')?.addEventListener('click', (e) => { e.preventDefault(); openModal('qr') })
  document.getElementById('close')?.addEventListener('click', (e) => { e.preventDefault(); closeModal() })
  document.getElementById('copyURL')?.addEventListener('click', (e) => { e.preventDefault(); copyUrl() })

  const modal = document.getElementById('modal')
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal()
    })
  }

  initCarousels()
  initShowcaseTabs()
}

document.addEventListener('DOMContentLoaded', init)
