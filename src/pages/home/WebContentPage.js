import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useWebContent } from '../../context/WebContentContext';
import { getImageUrl } from '../../utils/imageUtils';
import { getSafeHtml } from '../../utils/sanitizeHtml';

const WebContentPage = () => {
  const { header, banner, slider, nearSlider, footer, loading, error } = useWebContent();
  const sliderRef = useRef(null);
  const sliderInitialized = useRef(false);

  // Initialize slider after content loads
  useEffect(() => {
    if (slider.length === 0 || sliderInitialized.current) return;

    const initSlider = () => {
      if (window.jQuery && window.jQuery.fn.slick) {
        const $slider = window.jQuery(sliderRef.current);
        if ($slider.length && !$slider.hasClass('slick-initialized')) {
          $slider.slick({
            slidesToShow: 1,
            slidesToScroll: 1,
            fade: true,
            loop: true,
            dots: true,
            arrows: true,
            autoplay: true,
            autoplaySpeed: 4000,
            prevArrow: '<span class="slider-btn slider-prev"><i class="fi-rs-angle-left"></i></span>',
            nextArrow: '<span class="slider-btn slider-next"><i class="fi-rs-angle-right"></i></span>'
          });
          sliderInitialized.current = true;
        }
      }
    };

    const timer = setTimeout(initSlider, 300);
    return () => {
      clearTimeout(timer);
      if (sliderInitialized.current && window.jQuery) {
        try {
          const $slider = window.jQuery(sliderRef.current);
          if ($slider.hasClass('slick-initialized')) {
            $slider.slick('unslick');
          }
        } catch (e) { /* ignore */ }
        sliderInitialized.current = false;
      }
    };
  }, [slider]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div style={{ fontSize: '16px', color: '#3BB77E', fontWeight: '500' }}>Loading content...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-30 mb-30">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  const renderImage = (item) => {
    const imgUrl = getImageUrl(item.imageUrl);
    return imgUrl ? (
      <img
        src={imgUrl}
        alt={item.title || 'Content'}
        style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
        onError={(e) => { e.target.style.display = 'none'; }}
      />
    ) : null;
  };

  const renderLink = (item, children) => {
    if (item.linkUrl) {
      if (item.linkUrl.startsWith('http')) {
        return <a href={item.linkUrl} target="_blank" rel="noopener noreferrer">{children}</a>;
      }
      return <Link to={item.linkUrl}>{children}</Link>;
    }
    return <>{children}</>;
  };

  return (
    <main className="main">

      {/* ═══════ DYNAMIC HEADER SECTION ═══════ */}
      {header.length > 0 && (
        <section className="web-content-header">
          <div className="container">
            <div className="row">
              {header.map((item) => (
                <div key={item.id} className={`col-lg-${Math.floor(12 / Math.min(header.length, 4))} col-md-6 mb-15`}>
                  {renderLink(item,
                    <div className="header-content-block text-center p-15">
                      {renderImage(item)}
                      {item.title && <h4 className="mt-10">{item.title}</h4>}
                      {item.subtitle && <p className="text-muted">{item.subtitle}</p>}
                      {item.content && <div dangerouslySetInnerHTML={getSafeHtml(item.content)} />}
                      {item.buttonText && item.linkUrl && (
                        <span className="btn btn-xs mt-10">{item.buttonText}</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════ BANNER ABOVE SLIDER ═══════ */}
      {banner.length > 0 && (
        <section className="web-content-banner mb-15">
          <div className="container">
            <div className="row">
              {banner.map((item) => (
                <div key={item.id} className={`col-lg-${Math.floor(12 / Math.min(banner.length, 3))} col-md-6 mb-10`}>
                  {renderLink(item,
                    <div className="banner-block position-relative overflow-hidden" style={{ borderRadius: '10px' }}>
                      {renderImage(item)}
                      <div className="banner-overlay" style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                        padding: '20px', background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
                        color: '#fff'
                      }}>
                        {item.title && <h3 style={{ color: '#fff', marginBottom: '5px' }}>{item.title}</h3>}
                        {item.subtitle && <p style={{ color: '#ddd', marginBottom: '8px' }}>{item.subtitle}</p>}
                        {item.buttonText && (
                          <span className="btn btn-sm" style={{ background: '#3BB77E', color: '#fff', border: 'none' }}>
                            {item.buttonText}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════ SLIDER ═══════ */}
      {slider.length > 0 && (
        <section className="web-content-slider mb-30">
          <div className="container">
            <div className="hero-slider-1 style-1 dot-style-1 dot-style-1-position-1" ref={sliderRef}>
              {slider.map((item) => (
                <div key={item.id} className="single-hero-slider single-animation-wrap" style={{
                  borderRadius: '15px',
                  overflow: 'hidden',
                  position: 'relative',
                  minHeight: '350px',
                  backgroundImage: item.imageUrl ? `url(${getImageUrl(item.imageUrl)})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}>
                  <div className="slider-content" style={{
                    position: 'absolute', top: '50%', left: '40px',
                    transform: 'translateY(-50%)', zIndex: 2, maxWidth: '50%'
                  }}>
                    {item.subtitle && <h4 className="animated" style={{ color: '#253D4E' }}>{item.subtitle}</h4>}
                    {item.title && <h2 className="animated fw-900" style={{ fontSize: '36px', color: '#253D4E' }}>
                      {item.title}
                    </h2>}
                    {item.content && <p className="animated" style={{ color: '#7E7E7E' }}>{item.content}</p>}
                    {item.buttonText && item.linkUrl && (
                      item.linkUrl.startsWith('http') ? (
                        <a href={item.linkUrl} target="_blank" rel="noopener noreferrer"
                          className="animated btn btn-brush btn-brush-3">
                          {item.buttonText}
                        </a>
                      ) : (
                        <Link to={item.linkUrl} className="animated btn btn-brush btn-brush-3">
                          {item.buttonText}
                        </Link>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════ NEAR SLIDER (Side Content) ═══════ */}
      {nearSlider.length > 0 && (
        <section className="web-content-near-slider mb-30">
          <div className="container">
            <div className="row">
              {nearSlider.map((item) => (
                <div key={item.id} className={`col-lg-${Math.floor(12 / Math.min(nearSlider.length, 4))} col-md-6 mb-15`}>
                  {renderLink(item,
                    <div className="banner-img wow animate__animated animate__fadeInUp" style={{
                      borderRadius: '15px', overflow: 'hidden', position: 'relative'
                    }}>
                      {renderImage(item)}
                      <div className="banner-text" style={{
                        position: 'absolute', top: '20px', left: '20px', zIndex: 1
                      }}>
                        {item.title && <h4 style={{ fontWeight: 600, color: '#253D4E' }}>{item.title}</h4>}
                        {item.subtitle && <p style={{ color: '#7E7E7E' }}>{item.subtitle}</p>}
                        {item.buttonText && (
                          <span className="btn btn-xs" style={{ background: '#3BB77E', color: '#fff', border: 'none' }}>
                            {item.buttonText} <i className="fi-rs-arrow-small-right"></i>
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════ DYNAMIC FOOTER SECTION ═══════ */}
      {footer.length > 0 && (
        <section className="web-content-footer mb-30">
          <div className="container">
            <div className="row">
              {footer.map((item) => (
                <div key={item.id} className={`col-lg-${Math.floor(12 / Math.min(footer.length, 4))} col-md-6 mb-15`}>
                  <div className="footer-content-block p-15" style={{
                    background: '#f5f5f5', borderRadius: '10px', minHeight: '120px'
                  }}>
                    {renderImage(item)}
                    {item.title && <h5 className="mt-10 mb-5">{item.title}</h5>}
                    {item.subtitle && <p className="text-muted mb-5" style={{ fontSize: '13px' }}>{item.subtitle}</p>}
                    {item.content && <div style={{ fontSize: '13px' }} dangerouslySetInnerHTML={getSafeHtml(item.content)} />}
                    {item.buttonText && item.linkUrl && (
                      renderLink(item,
                        <span className="btn btn-xs mt-10" style={{ background: '#3BB77E', color: '#fff' }}>
                          {item.buttonText}
                        </span>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Empty state */}
      {!loading && header.length === 0 && banner.length === 0 && slider.length === 0 &&
        nearSlider.length === 0 && footer.length === 0 && (
        <div className="container mt-50 mb-50 text-center">
          <h3 className="text-muted">No content available yet.</h3>
          <p className="text-muted">Check back soon for updates!</p>
        </div>
      )}
    </main>
  );
};

export default WebContentPage;
