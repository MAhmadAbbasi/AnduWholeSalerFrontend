import React from 'react';
import { Link } from 'react-router-dom';
import { useWebContent } from '../../context/WebContentContext';
import { getImageUrl, getUnsplashFallback } from '../../utils/imageUtils';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { footer = [] } = useWebContent();

  const footerIntro = footer[0] || null;
  const dynamicLinkGroups = footer.slice(1, 5);

  const parseLinksFromContent = (item) => {
    if (!item?.content) return [];

    const raw = String(item.content).trim();
    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed
          .map((entry) => {
            if (typeof entry === 'string') {
              const [label, href] = entry.split('|').map((s) => s?.trim());
              return { label: label || entry, href: href || '#' };
            }
            return {
              label: entry?.label || entry?.title || 'Link',
              href: entry?.href || entry?.url || '#',
            };
          })
          .filter((x) => x.label);
      }

      if (parsed && Array.isArray(parsed.links)) {
        return parsed.links
          .map((entry) => ({
            label: entry?.label || entry?.title || 'Link',
            href: entry?.href || entry?.url || '#',
          }))
          .filter((x) => x.label);
      }
    } catch (e) {
      // Treat content as plain text below.
    }

    return raw
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split('|').map((s) => s.trim());
        if (parts.length >= 2) {
          return { label: parts[0], href: parts.slice(1).join('|') || '#' };
        }
        return { label: line, href: '#' };
      });
  };

  const renderFooterLink = (item, idx) => {
    const href = item?.href || '#';
    const label = item?.label || `Link ${idx + 1}`;

    if (href.startsWith('http://') || href.startsWith('https://')) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer">{label}</a>
      );
    }

    if (href === '#') {
      return <span>{label}</span>;
    }

    return <Link to={href}>{label}</Link>;
  };
  
  return (
    <footer className="main">
      {/* Newsletter Section */}
      <section className="newsletter mb-15 wow animate__animated animate__fadeIn">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="position-relative newsletter-inner">
                <div className="newsletter-content">
                  <h2 className="mb-20">
                    Stay home & get your daily <br />
                    needs from our shop
                  </h2>
                  <p className="mb-45">Start your daily shopping with <span className="text-brand">A and U Wholeseller</span></p>
                  <form className="form-subcriber d-flex">
                    <input type="email" placeholder="Your emaill address" />
                    <button className="btn" type="submit">Subscribe</button>
                  </form>
                </div>
                <img 
                  src="assets/imgs/banner/banner-9.png" 
                  alt="newsletter"
                  onError={(e) => {
                    e.target.src = getUnsplashFallback(0);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="featured section-padding">
        <div className="container">
          <div className="row">
            <div className="col-lg-1-5 col-md-4 col-12 col-sm-6 mb-md-4 mb-xl-0">
              <div className="banner-left-icon d-flex align-items-center wow animate__animated animate__fadeInUp" data-wow-delay="0">
                <div className="banner-icon">
                  <img src="/assets/imgs/theme/icons/icon-1.svg" alt="" />
                </div>
                <div className="banner-text">
                  <h3 className="icon-box-title">Best prices & offers</h3>
                  <p>Orders $50 or more</p>
                </div>
              </div>
            </div>
            <div className="col-lg-1-5 col-md-4 col-12 col-sm-6">
              <div className="banner-left-icon d-flex align-items-center wow animate__animated animate__fadeInUp" data-wow-delay=".1s">
                <div className="banner-icon">
                  <img src="/assets/imgs/theme/icons/icon-2.svg" alt="" />
                </div>
                <div className="banner-text">
                  <h3 className="icon-box-title">Free delivery</h3>
                  <p>24/7 amazing services</p>
                </div>
              </div>
            </div>
            <div className="col-lg-1-5 col-md-4 col-12 col-sm-6">
              <div className="banner-left-icon d-flex align-items-center wow animate__animated animate__fadeInUp" data-wow-delay=".2s">
                <div className="banner-icon">
                  <img src="/assets/imgs/theme/icons/icon-3.svg" alt="" />
                </div>
                <div className="banner-text">
                  <h3 className="icon-box-title">Great daily deal</h3>
                  <p>When you sign up</p>
                </div>
              </div>
            </div>
            <div className="col-lg-1-5 col-md-4 col-12 col-sm-6">
              <div className="banner-left-icon d-flex align-items-center wow animate__animated animate__fadeInUp" data-wow-delay=".3s">
                <div className="banner-icon">
                  <img src="/assets/imgs/theme/icons/icon-4.svg" alt="" />
                </div>
                <div className="banner-text">
                  <h3 className="icon-box-title">Wide assortment</h3>
                  <p>Mega Discounts</p>
                </div>
              </div>
            </div>
            <div className="col-lg-1-5 col-md-4 col-12 col-sm-6">
              <div className="banner-left-icon d-flex align-items-center wow animate__animated animate__fadeInUp" data-wow-delay=".4s">
                <div className="banner-icon">
                  <img src="/assets/imgs/theme/icons/icon-5.svg" alt="" />
                </div>
                <div className="banner-text">
                  <h3 className="icon-box-title">Easy returns</h3>
                  <p>Within 30 days</p>
                </div>
              </div>
            </div>
            <div className="col-lg-1-5 col-md-4 col-12 col-sm-6 d-xl-none">
              <div className="banner-left-icon d-flex align-items-center wow animate__animated animate__fadeInUp" data-wow-delay=".5s">
                <div className="banner-icon">
                  <img src="/assets/imgs/theme/icons/icon-6.svg" alt="" />
                </div>
                <div className="banner-text">
                  <h3 className="icon-box-title">Safe delivery</h3>
                  <p>Within 30 days</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Mid Section */}
      <section className="section-padding footer-mid">
        <div className="container pt-15 pb-20">
          <div className="row">
            <div className="col">
              <div className="widget-about font-md mb-md-3 mb-lg-3 mb-xl-0 wow animate__animated animate__fadeInUp" data-wow-delay="0">
                <div className="logo mb-30">
                  <a href="/" className="mb-15"><img src="/assets/imgs/theme/logonew.jpeg" alt="A and U logo" className="brand-logo-image" /></a>
                  <p className="font-lg text-heading">{footerIntro?.subtitle || 'Awesome grocery store website template'}</p>
                </div>
                <ul className="contact-infor">
                  <li>
                    <img src="/assets/imgs/theme/icons/icon-location.svg" alt="" />
                    <strong>Address:</strong>
                    <span>{footerIntro?.title || '5900 BALCONES DRIVE 28919 AUSTIN TAX, USA 78731'}</span>
                  </li>
                  <li>
                    <img src="/assets/imgs/theme/icons/icon-contact.svg" alt="" />
                    <strong>Call Us:</strong>
                    <span>{footerIntro?.buttonText || '(+91) - 540-025-124553'}</span>
                  </li>
                  <li>
                    <img src="/assets/imgs/theme/icons/icon-email-2.svg" alt="" />
                    <strong>Email:</strong>
                    <span>{footerIntro?.linkUrl || 'sale@aandu.com'}</span>
                  </li>
                  <li>
                    <img src="/assets/imgs/theme/icons/icon-clock.svg" alt="" />
                    <strong>Hours:</strong>
                    <span>{footerIntro?.content || '10:00 - 18:00, Mon - Sat'}</span>
                  </li>
                </ul>
              </div>
            </div>
            {dynamicLinkGroups.length > 0 ? (
              dynamicLinkGroups.map((group, groupIdx) => {
                const links = parseLinksFromContent(group);
                const fallbackLinks = group.linkUrl
                  ? [{ label: group.buttonText || group.title || 'View', href: group.linkUrl }]
                  : [];
                const finalLinks = links.length > 0 ? links : fallbackLinks;

                return (
                  <div key={group.id || groupIdx} className="footer-link-widget col wow animate__animated animate__fadeInUp" data-wow-delay={`.${groupIdx + 1}s`}>
                    <h4 className="widget-title">{group.title || `Links ${groupIdx + 1}`}</h4>
                    <ul className="footer-list mb-sm-5 mb-md-0">
                      {finalLinks.length > 0 ? (
                        finalLinks.map((linkItem, idx) => (
                          <li key={`${group.id || groupIdx}-${idx}`}>{renderFooterLink(linkItem, idx)}</li>
                        ))
                      ) : (
                        <li><span>{group.subtitle || 'No links available'}</span></li>
                      )}
                    </ul>
                  </div>
                );
              })
            ) : (
              <>
                <div className="footer-link-widget col wow animate__animated animate__fadeInUp" data-wow-delay=".1s">
                  <h4 className="widget-title">Company</h4>
                  <ul className="footer-list mb-sm-5 mb-md-0">
                    <li><Link to="/about">About Us</Link></li>
                    <li><Link to="/privacy-policy">Privacy Policy</Link></li>
                    <li><Link to="/terms">Terms &amp; Conditions</Link></li>
                    <li><Link to="/contact">Contact Us</Link></li>
                  </ul>
                </div>
                <div className="footer-link-widget col wow animate__animated animate__fadeInUp" data-wow-delay=".2s">
                  <h4 className="widget-title">Account</h4>
                  <ul className="footer-list mb-sm-5 mb-md-0">
                    <li><Link to="/login">Sign In</Link></li>
                    <li><Link to="/shop-cart">View Cart</Link></li>
                    <li><Link to="/shop-wishlist">My Wishlist</Link></li>
                    <li><Link to="/shop-compare">Compare products</Link></li>
                  </ul>
                </div>
                <div className="footer-link-widget col wow animate__animated animate__fadeInUp" data-wow-delay=".3s">
                  <h4 className="widget-title">Corporate</h4>
                  <ul className="footer-list mb-sm-5 mb-md-0">
                    <li><span>Become a Vendor</span></li>
                    <li><span>Affiliate Program</span></li>
                    <li><span>Farm Careers</span></li>
                  </ul>
                </div>
                <div className="footer-link-widget col wow animate__animated animate__fadeInUp" data-wow-delay=".4s">
                  <h4 className="widget-title">Popular</h4>
                  <ul className="footer-list mb-sm-5 mb-md-0">
                    <li><span>Fresh Produce</span></li>
                    <li><span>Farm Supplies</span></li>
                    <li><span>Organic Products</span></li>
                  </ul>
                </div>
              </>
            )}
            <div className="footer-link-widget widget-install-app col wow animate__animated animate__fadeInUp" data-wow-delay=".5s">
              <h4 className="widget-title">Install App</h4>
              <p className="">From App Store or Google Play</p>
              <div className="download-app">
                <a href="https://apps.apple.com" target="_blank" rel="noopener noreferrer" className="hover-up mb-sm-2 mb-lg-0">
                  <img className="active" src="/assets/imgs/theme/icons/logo-apple.svg" alt="App Store" />
                </a>
                <a href="https://play.google.com" target="_blank" rel="noopener noreferrer" className="hover-up mb-sm-2">
                  <img src="/assets/imgs/theme/icons/logo-google.svg" alt="Google Play" />
                </a>
              </div>
              <p className="mb-20">Secured Payment Gateways</p>
              <img className="" src={getImageUrl(footerIntro?.imageUrl) || '/assets/imgs/theme/icons/payment-visa.svg'} alt="" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer Bottom */}
      <div className="container pb-30 wow animate__animated animate__fadeInUp" data-wow-delay="0">
        <div className="row align-items-center">
          <div className="col-12 mb-30">
            <div className="footer-bottom"></div>
          </div>
          <div className="col-xl-4 col-lg-6 col-md-6">
            <p className="font-sm mb-0">
              &copy; {currentYear}, <strong className="text-brand">A and U Wholeseller</strong> <br />All rights reserved
            </p>
          </div>
          <div className="col-xl-4 col-lg-6 text-center d-none d-xl-block">
            <div className="hotline d-lg-inline-flex mr-30">
              <img src="/assets/imgs/theme/icons/phone-call.svg" alt="hotline" />
              <p>1900 - 6666<span>Working 8:00 - 22:00</span></p>
            </div>
            <div className="hotline d-lg-inline-flex">
              <img src="/assets/imgs/theme/icons/phone-call.svg" alt="hotline" />
              <p>1900 - 8888<span>24/7 Support Center</span></p>
            </div>
          </div>
            <div className="col-xl-4 col-lg-6 col-md-6 text-end d-none d-md-block">
            <div className="mobile-social-icon">
              <h6>Follow Us</h6>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><img src="/assets/imgs/theme/icons/icon-facebook-white.svg" alt="" /></a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><img src="/assets/imgs/theme/icons/icon-twitter-white.svg" alt="" /></a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><img src="/assets/imgs/theme/icons/icon-instagram-white.svg" alt="" /></a>
              <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" aria-label="Pinterest"><img src="/assets/imgs/theme/icons/icon-pinterest-white.svg" alt="" /></a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><img src="/assets/imgs/theme/icons/icon-youtube-white.svg" alt="" /></a>
            </div>
            <p className="font-sm">Up to 15% discount on your first subscribe</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

