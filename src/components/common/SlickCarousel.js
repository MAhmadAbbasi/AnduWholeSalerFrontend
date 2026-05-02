import React, { useRef, useEffect } from 'react';

const CAROUSEL_CONFIG = {
  dots: false,
  infinite: false,
  speed: 1000,
  arrows: true,
  autoplay: true,
  slidesToShow: 4,
  slidesToScroll: 1,
  adaptiveHeight: true,
  accessibility: false,
  responsive: [
    { breakpoint: 1025, settings: { slidesToShow: 3, slidesToScroll: 1 } },
    { breakpoint: 768,  settings: { slidesToShow: 2, slidesToScroll: 1 } },
    { breakpoint: 480,  settings: { slidesToShow: 1, slidesToScroll: 1 } }
  ],
  prevArrow: '<span class="slider-btn slider-prev"><i class="fi-rs-arrow-small-left"></i></span>',
  nextArrow: '<span class="slider-btn slider-next"><i class="fi-rs-arrow-small-right"></i></span>'
};

// React.memo(() => true) prevents ANY re-render after mount.
// This keeps React from reconciling children that Slick has restructured.
const SlickCarousel = React.memo(({ id, arrowsId, className, children }) => {
  const ref = useRef(null);

  useEffect(() => {
    let timer;
    let attempts = 0;

    const tryInit = () => {
      if (!window.jQuery || !window.jQuery.fn.slick) {
        if (attempts++ < 50) timer = setTimeout(tryInit, 200);
        return;
      }
      const $el = window.jQuery(ref.current);
      if (!$el.length) return;

      // Unslick first in case main.js won the race and initialized it first
      try { if ($el.hasClass('slick-initialized')) $el.slick('unslick'); } catch (e) {}

      const config = { ...CAROUSEL_CONFIG };
      if (arrowsId && document.getElementById(arrowsId)) {
        config.appendArrows = `#${arrowsId}`;
      }

      try { $el.slick(config); } catch (e) {}
    };

    timer = setTimeout(tryInit, 400);

    return () => {
      clearTimeout(timer);
      try {
        if (window.jQuery && ref.current) {
          const $el = window.jQuery(ref.current);
          if ($el.hasClass('slick-initialized')) $el.slick('unslick');
        }
      } catch (e) {}
    };
  }, []); // mount/unmount only — never re-run

  return (
    <div id={id} className={className} ref={ref}>
      {children}
    </div>
  );
}, () => true);

export default SlickCarousel;
