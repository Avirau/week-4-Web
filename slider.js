/**
 * ImageSlider
 * A dependency-free, infinitely-looping image slider.
 *
 * Strategy:
 *  - Real slides live in the HTML as <li class="slide"> elements.
 *  - On init, the last real slide is cloned to the front and the
 *    first real slide is cloned to the back. The track therefore
 *    holds (n + 2) slides, and the component always "rests" on a
 *    real slide (index 1..n) between animations.
 *  - Next / Previous move the track by one slide-width with the
 *    CSS transition enabled, so motion is a continuous translateX
 *    slide, never a cross-fade.
 *  - When the track finishes animating onto a cloned slide (index 0
 *    or index n+1), the transition is switched off for one frame and
 *    the track is jumped straight to the matching real slide, so the
 *    loop feels seamless in either direction.
 *  - Indicator dots are generated to match the real slide count and
 *    jump straight to the chosen index with the transition left on.
 */
class ImageSlider {
  constructor(root, options = {}) {
    this.root = root;
    this.viewport = root.querySelector('.slider-viewport');
    this.track = root.querySelector('.slider-track');
    this.dotsContainer = root.querySelector('.slider-dots');
    this.prevBtn = root.querySelector('.slider-arrow--prev');
    this.nextBtn = root.querySelector('.slider-arrow--next');

    this.autoplayDelay = options.autoplayDelay || 0; // 0 = autoplay off
    this.transitionMs = options.transitionMs || 550;

    this.realSlides = Array.from(this.track.children);
    this.slideCount = this.realSlides.length;

    if (this.slideCount < 2) {
      return; // nothing to slide between
    }

    this._buildClones();
    this._buildDots();
    this._bindEvents();

    // Start resting on the first real slide (index 1, after the clone)
    this.currentIndex = 1;
    this._setPosition(false);
    this._updateDots();

    if (this.autoplayDelay > 0) {
      this._startAutoplay();
    }
  }

  /* ---------- setup ---------- */

  _buildClones() {
    const first = this.realSlides[0];
    const last = this.realSlides[this.slideCount - 1];

    const firstClone = first.cloneNode(true);
    const lastClone = last.cloneNode(true);
    firstClone.setAttribute('aria-hidden', 'true');
    lastClone.setAttribute('aria-hidden', 'true');

    this.track.appendChild(firstClone);
    this.track.insertBefore(lastClone, this.realSlides[0]);

    // allSlides[0] and allSlides[n+1] are the clones
    this.allSlides = Array.from(this.track.children);
  }

  _buildDots() {
    this.dots = this.realSlides.map((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'slider-dot';
      dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      dot.addEventListener('click', () => this.goTo(i));
      this.dotsContainer.appendChild(dot);
      return dot;
    });
  }

  _bindEvents() {
    this.nextBtn.addEventListener('click', () => this.next());
    this.prevBtn.addEventListener('click', () => this.prev());

    // Snap cleanly onto the real slide once a loop-boundary animation ends
    this.track.addEventListener('transitionend', () => this._handleLoopReset());

    // Pause autoplay while the pointer is over the slider
    this.root.addEventListener('mouseenter', () => this._stopAutoplay());
    this.root.addEventListener('mouseleave', () => {
      if (this.autoplayDelay > 0) this._startAutoplay();
    });

    // Keep the layout math correct on resize (percentage-based, but
    // recalculating confirms slide width on orientation changes)
    window.addEventListener('resize', () => this._setPosition(false));

    // Basic swipe support
    let startX = null;
    this.viewport.addEventListener('pointerdown', (e) => (startX = e.clientX));
    this.viewport.addEventListener('pointerup', (e) => {
      if (startX === null) return;
      const delta = e.clientX - startX;
      if (Math.abs(delta) > 40) {
        delta < 0 ? this.next() : this.prev();
      }
      startX = null;
    });
  }

  /* ---------- core motion ---------- */

  _slideWidth() {
    return this.viewport.getBoundingClientRect().width;
  }

  _setPosition(animate = true) {
    this.track.style.transition = animate
      ? `transform ${this.transitionMs}ms cubic-bezier(0.65, 0, 0.35, 1)`
      : 'none';
    const offset = -(this.currentIndex * this._slideWidth());
    this.track.style.transform = `translateX(${offset}px)`;
  }

  next() {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.currentIndex++;
    this._setPosition(true);
    this._updateDots();
  }

  prev() {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.currentIndex--;
    this._setPosition(true);
    this._updateDots();
  }

  /** Jump directly to a real slide index (0-based), e.g. from a dot click */
  goTo(realIndex) {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.currentIndex = realIndex + 1; // +1 to account for the leading clone
    this._setPosition(true);
    this._updateDots();
  }

  /** Seamlessly wrap when the track has animated onto a cloned slide */
  _handleLoopReset() {
    this.isAnimating = false;

    if (this.currentIndex === this.allSlides.length - 1) {
      // landed on the trailing clone of the first slide -> snap to the real one
      this.currentIndex = 1;
      this._setPosition(false);
    } else if (this.currentIndex === 0) {
      // landed on the leading clone of the last slide -> snap to the real one
      this.currentIndex = this.slideCount;
      this._setPosition(false);
    }
  }

  _updateDots() {
    const realIndex = (this.currentIndex - 1 + this.slideCount) % this.slideCount;
    this.dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === realIndex);
    });
  }

  /* ---------- optional autoplay ---------- */

  _startAutoplay() {
    this._stopAutoplay();
    this._autoplayTimer = setInterval(() => this.next(), this.autoplayDelay);
  }

  _stopAutoplay() {
    if (this._autoplayTimer) clearInterval(this._autoplayTimer);
  }
}

// Initialize every slider found on the page
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.slider').forEach((el) => {
    new ImageSlider(el, { autoplayDelay: 5000, transitionMs: 550 });
  });
});
