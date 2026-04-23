import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, getCategoriesHierarchical } from '../../utils/api';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCompare } from '../../context/CompareContext';
import { useQuickView } from '../../context/QuickViewContext';
import { useWebContent } from '../../context/WebContentContext';
import { getImageUrl, getUnsplashFallback, getUnsplashHeroFallback } from '../../utils/imageUtils';
import NoProductsFound from '../../components/common/NoProductsFound';

const Home = () => {
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const { addToCompare, isInCompare } = useCompare();
  const { showQuickView } = useQuickView();
  const { header, banner, slider, footer } = useWebContent();
  const heroSliderRef = useRef(null);
  const carausel4ColumnsRef = useRef(null);
  const initializedRefs = useRef({
    heroSlider: false,
    carausel4Columns: false
  });
  
  const [products, setProducts] = useState([]);
  const [popularTabs, setPopularTabs] = useState([]);
  const [activePopularTab, setActivePopularTab] = useState('all');
  const [activeDailyTab, setActiveDailyTab] = useState('featured');
  const [dailyTabLoading, setDailyTabLoading] = useState(false);

  // Clean up zoom elements when component mounts
  useEffect(() => {
    if (window.jQuery) {
      // Remove all zoom-related DOM elements
      window.jQuery('.zoomWindowContainer, .zoomContainer, .zoomWindow, .zoomLens').remove();
      
      // Clean up all images with zoom data
      window.jQuery('img').each(function() {
        const $img = window.jQuery(this);
        if ($img.data('elevateZoom')) {
          $img.removeData('elevateZoom');
          $img.removeData('zoomImage');
          $img.removeAttr('data-zoom-image');
        }
        // Remove any zoom-related inline styles
        $img.css('cursor', '');
      });
    }
  }, []);

  useEffect(() => {
    // Prevent global main.js from initializing carousels
    if (window.jQuery && window.jQuery.fn.slick) {
      window.reactCarouselInit = true;
    }

    let isMounted = true;
    const timers = [];

    const safeTimeout = (fn, delay) => {
      const id = setTimeout(() => {
        if (isMounted) fn();
      }, delay);
      timers.push(id);
      return id;
    };

    // Force-clean any leftover slick state from the DOM
    const forceCleanSlick = ($el) => {
      if (!$el || !$el.length) return;
      try {
        if ($el.hasClass('slick-initialized')) {
          $el.slick('unslick');
        }
      } catch (e) { /* ignore */ }
      // Remove leftover slick DOM artifacts in case unslick failed
      $el.removeClass('slick-initialized slick-slider');
      $el.find('.slick-list, .slick-track, .slick-arrow, .slick-dots').remove();
      // Unwrap slick-wrapped slides
      $el.find('.slick-slide').contents().unwrap();
      $el.removeAttr('role tabindex');
    };

    // Initialize hero slider
    const initHeroSlider = () => {
      const $heroSlider = window.jQuery('.hero-slider-1');
      if (!$heroSlider.length) return;

      forceCleanSlick($heroSlider);

      const $arrowContainer = window.jQuery('.hero-slider-1-arrow');
      const hasArrowContainer = $arrowContainer.length > 0;

      const slickConfig = {
        slidesToShow: 1,
        slidesToScroll: 1,
        fade: true,
        loop: true,
        dots: true,
        arrows: true,
        prevArrow: '<span class="slider-btn slider-prev"><i class="fi-rs-arrow-small-left"></i></span>',
        nextArrow: '<span class="slider-btn slider-next"><i class="fi-rs-arrow-small-right"></i></span>',
        autoplay: true,
        accessibility: false,
        adaptiveHeight: false
      };

      if (hasArrowContainer) {
        slickConfig.appendArrows = '.hero-slider-1-arrow';
      } else {
        slickConfig.appendArrows = $heroSlider;
      }

      try {
        $heroSlider.slick(slickConfig);
        initializedRefs.current.heroSlider = true;
      } catch (e) { /* ignore */ }
    };

    // Initialize product carousels
    const initCarausel4Columns = () => {
      const carausels = ['carausel-4-columns', 'carausel-4-columns-2', 'carausel-4-columns-3'];
      carausels.forEach((id, index) => {
        const $carausel = window.jQuery(`#${id}`);
        if (!$carausel.length) return;

        forceCleanSlick($carausel);

        const arrowsId = index === 0 ? 'carausel-4-columns-arrows' :
                        index === 1 ? 'carausel-4-columns-arrows-2' :
                        'carausel-4-columns-arrows-3';

        const $arrowContainer = window.jQuery(`#${arrowsId}`);
        const hasArrowContainer = $arrowContainer.length > 0;

        const slickConfig = {
          dots: false,
          infinite: true,
          speed: 1000,
          arrows: true,
          autoplay: true,
          slidesToShow: 4,
          slidesToScroll: 1,
          loop: true,
          adaptiveHeight: true,
          accessibility: false,
          responsive: [
            { breakpoint: 1025, settings: { slidesToShow: 3, slidesToScroll: 3 } },
            { breakpoint: 768, settings: { slidesToShow: 2, slidesToScroll: 2 } },
            { breakpoint: 480, settings: { slidesToShow: 1, slidesToScroll: 1 } }
          ],
          prevArrow: '<span class="slider-btn slider-prev"><i class="fi-rs-arrow-small-left"></i></span>',
          nextArrow: '<span class="slider-btn slider-next"><i class="fi-rs-arrow-small-right"></i></span>'
        };

        if (hasArrowContainer) {
          slickConfig.appendArrows = `#${arrowsId}`;
        } else {
          slickConfig.appendArrows = $carausel;
        }

        try {
          $carausel.slick(slickConfig);
        } catch (e) { /* ignore */ }
      });
      initializedRefs.current.carausel4Columns = true;
    };

    const initAll = () => {
      if (!window.jQuery || !window.jQuery.fn.slick) return;
      initHeroSlider();
      initCarausel4Columns();
    };

    // Try to initialize - poll until jQuery + slick are available
    let attempts = 0;
    const maxAttempts = 20;

    const tryInit = () => {
      attempts++;
      if (window.jQuery && window.jQuery.fn.slick) {
        // Single short delay so DOM is ready
        safeTimeout(initAll, 200);
      } else if (attempts < maxAttempts) {
        safeTimeout(tryInit, 200);
      }
    };

    safeTimeout(tryInit, 100);

    // Cleanup function
    return () => {
      isMounted = false;
      timers.forEach(clearTimeout);
      if (window.jQuery) {
        try {
          const $heroSlider = window.jQuery('.hero-slider-1');
          if ($heroSlider.length && $heroSlider.hasClass('slick-initialized')) {
            $heroSlider.slick('unslick');
          }
          ['carausel-4-columns', 'carausel-4-columns-2', 'carausel-4-columns-3'].forEach(id => {
            try {
              const $c = window.jQuery(`#${id}`);
              if ($c.length && $c.hasClass('slick-initialized')) {
                $c.slick('unslick');
              }
            } catch (e) { /* ignore */ }
          });
        } catch (e) { /* ignore */ }
      }
      initializedRefs.current = { heroSlider: false, carausel4Columns: false };
    };
  }, []);

  // Handle tab changes for Daily Best Sells carousel
  useEffect(() => {
    if (!window.jQuery || !window.jQuery.fn.slick) return;

    // Show loading state
    setDailyTabLoading(true);

    // Wait for DOM to update after tab change
    const timer = setTimeout(() => {
      const carouselId = activeDailyTab === 'featured' ? 'carausel-4-columns' :
                         activeDailyTab === 'popular' ? 'carausel-4-columns-2' :
                         'carausel-4-columns-3';
      const arrowsId = activeDailyTab === 'featured' ? 'carausel-4-columns-arrows' :
                      activeDailyTab === 'popular' ? 'carausel-4-columns-arrows-2' :
                      'carausel-4-columns-arrows-3';
      
      const $carousel = window.jQuery(`#${carouselId}`);
      if (!$carousel.length) {
        setDailyTabLoading(false);
        return;
      }

      // Force-clean any leftover slick state
      try {
        if ($carousel.hasClass('slick-initialized')) {
          $carousel.slick('unslick');
        }
      } catch (e) { /* ignore */ }
      $carousel.removeClass('slick-initialized slick-slider');
      $carousel.find('.slick-list, .slick-track, .slick-arrow, .slick-dots').remove();
      $carousel.find('.slick-slide').contents().unwrap();

      try {
        $carousel.slick({
          dots: false,
          infinite: true,
          speed: 1000,
          arrows: true,
          autoplay: true,
          slidesToShow: 4,
          slidesToScroll: 1,
          loop: true,
          adaptiveHeight: true,
          responsive: [
            { breakpoint: 1025, settings: { slidesToShow: 3, slidesToScroll: 3 } },
            { breakpoint: 768, settings: { slidesToShow: 2, slidesToScroll: 2 } },
            { breakpoint: 480, settings: { slidesToShow: 1, slidesToScroll: 1 } }
          ],
          prevArrow: '<span class="slider-btn slider-prev"><i class="fi-rs-arrow-small-left"></i></span>',
          nextArrow: '<span class="slider-btn slider-next"><i class="fi-rs-arrow-small-right"></i></span>',
          appendArrows: `#${arrowsId}`
        });
      } catch (e) { /* ignore */ }

      setDailyTabLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [activeDailyTab]);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Only fetch first 20 products for better performance
        const apiProducts = await getProducts();
        const limitedProducts = apiProducts.slice(0, 20);
        
        let mappedProducts = [];
        
        if (limitedProducts && limitedProducts.length > 0) {
          // Map API products to component format and preserve category id for filtering
          mappedProducts = limitedProducts.map((product, index) => {
            // Parse imagePaths to get multiple images
            let images = [];
            try {
              if (product.imagePaths) {
                images = typeof product.imagePaths === 'string' 
                  ? JSON.parse(product.imagePaths) 
                  : product.imagePaths;
              }
            } catch (e) {
              console.warn('Failed to parse imagePaths:', e);
              images = [];
            }

            // Use first image as default, second as hover (or fall back to first)
            const defaultImage = getImageUrl(images[0] || product.imagePath) || getUnsplashFallback(index);
            const hoverImage = getImageUrl(images[1] || images[0] || product.imagePath) || getUnsplashFallback(index + 1);

            return {
              id: product.id,
              name: product.productName || product.name || 'Product',
              productName: product.productName || product.name || 'Product',
              category: product.childCategory?.childCategoryName || product.category?.categoryName || 'Uncategorized',
              categoryId: product.category?.id || product.category?.categoryId || null,
              price: Math.round(product.price || 0),
              oldPrice: null,
              image: defaultImage,
              hoverImage: hoverImage,
              imagePath: images[0] || product.imagePath, // First image path for compare
              imagePaths: product.imagePaths, // Full image paths array for compare
              description: product.description, // Product description for compare
              rating: 90,
              badge: index < 3 ? { type: index === 0 ? 'hot' : index === 1 ? 'sale' : 'new', text: index === 0 ? 'Hot' : index === 1 ? 'Sale' : 'New' } : null,
              vendor: product.brand?.brandName || 'NestFood',
              brand: product.brand, // Brand object for compare
              sku: product.sku, // SKU for compare
              stock: product.stock // Stock for compare
            };
          });
        }
        
        setProducts(mappedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      }
    };

    fetchProducts();
  }, []);

  // Re-initialize carousel when products are loaded
  useEffect(() => {
    if (products.length > 0 && window.jQuery && window.jQuery.fn.slick) {
      const timeoutId = setTimeout(() => {
        const carausels = ['carausel-4-columns', 'carausel-4-columns-2', 'carausel-4-columns-3'];
        carausels.forEach((id, index) => {
          const $carausel = window.jQuery(`#${id}`);
          if (!$carausel.length) return;

          // Force-clean any leftover slick state
          try {
            if ($carausel.hasClass('slick-initialized')) {
              $carausel.slick('unslick');
            }
          } catch (e) { /* ignore */ }
          $carausel.removeClass('slick-initialized slick-slider');
          $carausel.find('.slick-list, .slick-track, .slick-arrow, .slick-dots').remove();
          $carausel.find('.slick-slide').contents().unwrap();

          const arrowsId = index === 0 ? 'carausel-4-columns-arrows' :
                          index === 1 ? 'carausel-4-columns-arrows-2' :
                          'carausel-4-columns-arrows-3';
          const $arrowContainer = window.jQuery(`#${arrowsId}`);
          const hasArrowContainer = $arrowContainer.length > 0;

          const slickConfig = {
            dots: false,
            infinite: true,
            speed: 1000,
            arrows: true,
            autoplay: true,
            slidesToShow: 4,
            slidesToScroll: 1,
            loop: true,
            adaptiveHeight: true,
            accessibility: false,
            responsive: [
              { breakpoint: 1025, settings: { slidesToShow: 3, slidesToScroll: 3 } },
              { breakpoint: 768, settings: { slidesToShow: 2, slidesToScroll: 2 } },
              { breakpoint: 480, settings: { slidesToShow: 1, slidesToScroll: 1 } }
            ],
            prevArrow: '<span class="slider-btn slider-prev"><i class="fi-rs-arrow-small-left"></i></span>',
            nextArrow: '<span class="slider-btn slider-next"><i class="fi-rs-arrow-small-right"></i></span>'
          };

          if (hasArrowContainer) {
            slickConfig.appendArrows = `#${arrowsId}`;
          } else {
            slickConfig.appendArrows = $carausel;
          }

          try {
            $carausel.slick(slickConfig);
          } catch (e) { /* ignore */ }
        });
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [products]);

  // Fetch categories to build dynamic popular tabs
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await getCategoriesHierarchical();
        if (cats && cats.length > 0) {
          // Use top-level active categories as tabs (limit to 6)
          const tabs = cats.filter(c => c.isActive).slice(0, 6).map(c => ({ id: c.id, name: c.categoryName || c.name || c.slug || 'Category' }));
          setPopularTabs(tabs);
          
        }
      } catch (err) {
        console.error('Error fetching categories for popular tabs:', err);
        setPopularTabs([]);
      }
    };

    fetchCategories();
  }, []);

  const getDynamicLink = (item, fallback = '/shop') => item?.linkUrl || fallback;

  const getDynamicTitle = (item, fallback = 'Shop Now') => item?.title || item?.subtitle || fallback;

  const getDynamicImage = (item, fallback = '') => getImageUrl(item?.imageUrl) || fallback;

  const renderBannerCta = (item, fallbackLink, fallbackText = 'Shop Now') => {
    const text = item?.buttonText || fallbackText;
    const link = getDynamicLink(item, fallbackLink);

    if (link.startsWith('http')) {
      return (
        <a href={link} target="_blank" rel="noopener noreferrer" className="btn btn-xs">
          {text} <i className="fi-rs-arrow-small-right"></i>
        </a>
      );
    }

    return (
      <Link to={link} className="btn btn-xs">
        {text} <i className="fi-rs-arrow-small-right"></i>
      </Link>
    );
  };

  const staticHeroSlides = [
    {
      id: 'static-1',
      title: 'Fresh From The Farm',
      subtitle: 'Farm-fresh produce delivered to your doorstep',
      imageUrl: '/assets/imgs/banner/Landingpage.jpeg',
      linkUrl: '/shop',
      buttonText: 'Shop Now'
    },
    {
      id: 'static-2',
      title: 'Organic and Natural',
      subtitle: '100% organic seeds, fertilizers and farm supplies',
      imageUrl: '/assets/imgs/banner/LandingPage2.jpeg',
      linkUrl: '/shop',
      buttonText: 'Shop Now'
    }
  ];

  const dynamicHeroSlides = slider.slice(0, 6).map((item, index) => ({
    id: item.id || `dynamic-${index}`,
    title: item.title || item.subtitle || 'Featured Collection',
    subtitle: item.content || item.subtitle || 'Explore the latest updates from our portal',
    imageUrl: index === 0 ? '/assets/imgs/banner/Landingpage.jpeg' : (index === 1 ? '/assets/imgs/banner/LandingPage2.jpeg' : getDynamicImage(item, getUnsplashHeroFallback(index))),
    linkUrl: getDynamicLink(item, '/shop'),
    buttonText: item.buttonText || 'Explore'
  }));

  // Build hero slides with unique images so alternation is always visible.
  const mergedHeroSlides = [...dynamicHeroSlides, ...staticHeroSlides];
  const uniqueHeroSlides = mergedHeroSlides.filter(
    (slide, index, arr) => arr.findIndex((item) => item.imageUrl === slide.imageUrl) === index
  );

  // Ensure at least 2 distinct slides, including LandingPage2 fallback when needed.
  const heroSlides = uniqueHeroSlides.length >= 2
    ? uniqueHeroSlides
    : staticHeroSlides;

  useEffect(() => {
    if (!window.jQuery || !window.jQuery.fn.slick) return;

    const timer = setTimeout(() => {
      const $heroSlider = window.jQuery('.hero-slider-1');
      if (!$heroSlider.length) return;

      try {
        if ($heroSlider.hasClass('slick-initialized')) {
          $heroSlider.slick('unslick');
        }
      } catch (e) { /* ignore */ }

      try {
        $heroSlider.slick({
          slidesToShow: 1,
          slidesToScroll: 1,
          fade: true,
          loop: true,
          dots: true,
          arrows: true,
          prevArrow: '<span class="slider-btn slider-prev"><i class="fi-rs-arrow-small-left"></i></span>',
          nextArrow: '<span class="slider-btn slider-next"><i class="fi-rs-arrow-small-right"></i></span>',
          autoplay: true,
          appendArrows: '.hero-slider-1-arrow',
          accessibility: false,
          adaptiveHeight: false
        });
      } catch (e) { /* ignore */ }
    }, 200);

    return () => clearTimeout(timer);
  }, [heroSlides.length]);


  return (
    <main className="main">
      {/* Hero Slider Section - Style 2 */}
      <section className="home-slider style-2 position-relative mb-50">
        <div className="container">
          <div className="row">
            <div className="col-xl-8 col-lg-12">
              <div className="home-slide-cover">
                <div className="hero-slider-1 style-4 dot-style-1 dot-style-1-position-1" ref={heroSliderRef} key="hero-slider">
                  {heroSlides.map((slide) => (
                    <div
                      key={slide.id}
                      className="single-hero-slider single-animation-wrap"
                      style={{
                        backgroundImage: `url(${slide.imageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        minHeight: '500px'
                      }}
                    >
                    </div>
                  ))}
                </div>
                <div className="slider-arrow hero-slider-1-arrow"></div>
              </div>
            </div>
            <div className="col-lg-4 d-none d-xl-block">
              <div
                className="banner-img style-3 animated animated"
                style={{
                  backgroundImage: "url('/assets/imgs/banner/SideImage.jpeg')",
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="banner-text mt-50">
                  {renderBannerCta(banner[0], '/shop')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/*End hero slider*/}

      {/* Product Tabs Section */}
      <section className="product-tabs section-padding position-relative">
        <div className="container">
          <div className="section-title style-2">
            <h3>Popular Products</h3>
            <ul className="nav nav-tabs links" id="myTab" role="tablist">
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activePopularTab === 'all' ? 'active' : ''}`}
                  type="button"
                  onClick={() => setActivePopularTab('all')}
                >All</button>
              </li>
              {popularTabs.map((tab) => (
                <li className="nav-item" role="presentation" key={tab.id}>
                  <button
                    className={`nav-link ${String(activePopularTab) === String(tab.id) ? 'active' : ''}`}
                    type="button"
                    onClick={() => setActivePopularTab(tab.id)}
                  >{tab.name}</button>
                </li>
              ))}
            </ul>
          </div>
          {/*End nav-tabs*/}
          <div className="tab-content" id="myTabContent">
            <div className="tab-pane fade show active" id="tab-one" role="tabpanel" aria-labelledby="tab-one">
              <div className="row product-grid-4">
                {(() => {
                  const productsToShow = activePopularTab === 'all'
                    ? products
                    : products.filter(p => String(p.categoryId) === String(activePopularTab));

                  if (productsToShow.length === 0) {
                    return (
                      <NoProductsFound
                        hasFilters={activePopularTab !== 'all'}
                        message={activePopularTab !== 'all' ? 'No products found in this category' : 'No products available'}
                      />
                    );
                  }

                  return productsToShow.map((product, index) => (
                    <div key={product.id} className="col-lg-1-5 col-md-4 col-12 col-sm-6">
                    <div className="product-cart-wrap mb-30">
                      <div className="product-img-action-wrap" style={{ position: 'relative' }}>
                        <div className="product-img product-img-zoom">
                          <Link to={`/shop-product-right?id=${product.id}`}>
                            <img
                              className="default-img"
                              src={product.image}
                              alt={product.name}
                              style={{ width: '100%', height: 'auto', maxWidth: '100%' }}
                              onError={(e) => { e.target.src = getUnsplashFallback(index); }}
                            />
                            <img
                              className="hover-img"
                              src={product.hoverImage}
                              alt={product.name}
                              style={{ width: '100%', height: 'auto', maxWidth: '100%' }}
                              onError={(e) => { e.target.src = getUnsplashFallback(index + 1); }}
                            />
                          </Link>
                        </div>
                        <div className="product-action-1">
                          <button type="button" aria-label="Add To Wishlist" className="action-btn" onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToWishlist(product); }} style={isInWishlist(product.id) ? { color: '#ff0000' } : {}}><i className="fi-rs-heart"></i></button>
                          <button type="button" aria-label="Compare" className="action-btn" onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCompare(product); }} style={isInCompare(product.id) ? { color: '#3BB77E' } : {}}><i className="fi-rs-shuffle"></i></button>
                          <button type="button" aria-label="Quick view" className="action-btn" data-bs-toggle="modal" data-bs-target="#quickViewModal" onClick={(e) => { e.preventDefault(); e.stopPropagation(); showQuickView(product); }}><i className="fi-rs-eye"></i></button>
                        </div>
                        {product.badge && (
                          <div className="product-badges product-badges-position product-badges-mrg">
                            <span className={product.badge.type}>{product.badge.text}</span>
                          </div>
                        )}
                      </div>
                      <div className="product-content-wrap">
                        <div className="product-category">
                          <Link to="/shop">{product.category}</Link>
                        </div>
                        <h2><Link to={`/shop-product-right?id=${product.id}`}>{product.name}</Link></h2>
                        <div className="product-rate-cover">
                          <div className="product-rate d-inline-block">
                            <div className="product-rating" style={{ width: `${product.rating}%` }}></div>
                          </div>
                          <span className="font-small ml-5 text-muted"> (4.0)</span>
                        </div>
                        <div>
                          <span className="font-small text-muted">By <Link to="/vendors-grid">{product.vendor}</Link></span>
                        </div>
                        <div className="product-card-bottom">
                          <div className="product-price">
                            <span>{product.price}</span>
                            {product.oldPrice && <span className="old-price">{product.oldPrice}</span>}
                          </div>
                          <div className="add-cart">
                            <Link 
                              className="add" 
                              to="#"
                              onClick={(e) => {
                                e.preventDefault();
                                addToCart({
                                  id: product.id,
                                  name: product.name,
                                  productName: product.name,
                                  price: product.price,
                                  image: product.image || getUnsplashFallback(index + 20),
                                  quantity: 1,
                                  stock: product.quantity || 999
                                });
                              }}
                            >
                              <i className="fi-rs-shopping-cart mr-5"></i>Add
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ));
                })()}
              </div>
            </div>
            <div className="tab-pane fade" id="tab-two" role="tabpanel" aria-labelledby="tab-two">
              <NoProductsFound message="No products available at the moment" />
            </div>
            <div className="tab-pane fade" id="tab-three" role="tabpanel" aria-labelledby="tab-three">
              <NoProductsFound message="No products available at the moment" />
            </div>
            <div className="tab-pane fade" id="tab-four" role="tabpanel" aria-labelledby="tab-four">
              <NoProductsFound message="No products available at the moment" />
            </div>
            <div className="tab-pane fade" id="tab-five" role="tabpanel" aria-labelledby="tab-five">
              <NoProductsFound message="No products available at the moment" />
            </div>
            <div className="tab-pane fade" id="tab-six" role="tabpanel" aria-labelledby="tab-six">
              <NoProductsFound message="No products available at the moment" />
            </div>
            <div className="tab-pane fade" id="tab-seven" role="tabpanel" aria-labelledby="tab-seven">
              <NoProductsFound message="No products available at the moment" />
            </div>
          </div>
        </div>
      </section>
      {/*End product tabs*/}

      

      {/* Deals Of The Day Section */}
      <section className="section-padding pb-5">
        <div className="container">
          <div className="section-title">
            <h3 className="">Deals Of The Day</h3>
            <Link className="show-all" to="/shop">
              All Deals
              <i className="fi-rs-angle-right"></i>
            </Link>
          </div>
          <div className="row">
            {products.slice(0, 4).map((product, index) => (
              <div key={product.id} className={`col-xl-3 col-lg-4 col-md-6 ${index >= 2 ? 'd-none d-lg-block' : ''} ${index === 3 ? 'd-none d-xl-block' : ''}`}>
                <div className="product-cart-wrap style-2">
                  <div className="product-img-action-wrap" style={{ position: 'relative' }}>
                    <div className="product-img">
                      <Link to={`/shop-product-right?id=${product.id}`}>
                        <img 
                          src={product.image} 
                          alt={product.name}
                          onError={(e) => { e.target.src = getUnsplashFallback(index + 200); }}
                        />
                      </Link>
                    </div>
                  </div>
                  <div className="product-content-wrap">
                    <div className="deals-countdown-wrap">
                      <div className="deals-countdown" data-countdown={`2025/${12 - index}/25 00:00:00`}></div>
                    </div>
                    <div className="deals-content">
                      <h2><Link to={`/shop-product-right?id=${product.id}`}>{product.name}</Link></h2>
                      <div className="product-rate-cover">
                        <div className="product-rate d-inline-block">
                          <div className="product-rating" style={{ width: `${product.rating}%` }}></div>
                        </div>
                        <span className="font-small ml-5 text-muted"> (4.0)</span>
                      </div>
                      <div>
                        <span className="font-small text-muted">By <Link to="/vendors-grid">{product.vendor}</Link></span>
                      </div>
                      <div className="product-card-bottom">
                        <div className="product-price">
                          <span>{product.price}</span>
                          {product.oldPrice && <span className="old-price">{product.oldPrice}</span>}
                        </div>
                        <div className="add-cart">
                          <button 
                            className="add" 
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              addToCart({
                                id: product.id,
                                name: product.name,
                                productName: product.name,
                                price: product.price,
                                image: product.image || getUnsplashFallback(index + 420),
                                quantity: 1,
                                stock: product.quantity || 999
                              });
                            }}
                          >
                            <i className="fi-rs-shopping-cart mr-5"></i>Add
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/*End Deals Of The Day*/}

      {/* Top Selling / Trending / Recently Added Section */}
      <section className="section-padding mb-30">
        <div className="container">
          <div className="row">
            <div className="col-xl-3 col-lg-4 col-md-6 mb-sm-5 mb-md-0">
              <h4 className="section-title style-1 mb-30 animated animated">Top Selling</h4>
              <div className="product-list-small animated animated">
                {products.slice(0, 3).map((product, index) => {
                  const productImage = product.image || `/assets/imgs/shop/product-${(index % 10) + 1}-1.jpg`;
                  return (
                    <article key={product.id} className="row align-items-center hover-up">
                      <figure className="col-md-4 mb-0">
                        <Link to={`/shop-product-right?id=${product.id}`}>
                          <img 
                            src={productImage} 
                            alt={product.name || 'Product'}
                            onError={(e) => {
                              e.target.src = getUnsplashFallback(index + 520);
                            }}
                          />
                        </Link>
                      </figure>
                      <div className="col-md-8 mb-0">
                        <h6>
                          <Link to={`/shop-product-right?id=${product.id}`}>{product.name || 'Product'}</Link>
                        </h6>
                        <div className="product-rate-cover">
                          <div className="product-rate d-inline-block">
                            <div className="product-rating" style={{ width: '90%' }}></div>
                          </div>
                          <span className="font-small ml-5 text-muted"> (4.0)</span>
                        </div>
                        <div className="product-price">
                          <span>${product.price || 0}</span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
            <div className="col-xl-3 col-lg-4 col-md-6 mb-md-0">
              <h4 className="section-title style-1 mb-30 animated animated">Trending Products</h4>
              <div className="product-list-small animated animated">
                {products.slice(3, 6).map((product, index) => {
                  const productImage = product.image || `/assets/imgs/shop/product-${((index + 3) % 10) + 1}-1.jpg`;
                  return (
                    <article key={product.id} className="row align-items-center hover-up">
                      <figure className="col-md-4 mb-0">
                        <Link to={`/shop-product-right?id=${product.id}`}>
                          <img 
                            src={productImage} 
                            alt={product.name || 'Product'}
                            onError={(e) => {
                              e.target.src = getUnsplashFallback(index + 620);
                            }}
                          />
                        </Link>
                      </figure>
                      <div className="col-md-8 mb-0">
                        <h6>
                          <Link to={`/shop-product-right?id=${product.id}`}>{product.name || 'Product'}</Link>
                        </h6>
                        <div className="product-rate-cover">
                          <div className="product-rate d-inline-block">
                            <div className="product-rating" style={{ width: '90%' }}></div>
                          </div>
                          <span className="font-small ml-5 text-muted"> (4.0)</span>
                        </div>
                        <div className="product-price">
                          <span>${product.price || 0}</span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
            <div className="col-xl-3 col-lg-4 col-md-6">
              <h4 className="section-title style-1 mb-30 animated animated">Recently added</h4>
              <div className="product-list-small animated animated">
                {products.slice(5, 8).map((product, index) => {
                  const productImage = product.image || `/assets/imgs/shop/product-${((index + 5) % 10) + 1}-1.jpg`;
                  return (
                    <article key={product.id} className="row align-items-center hover-up">
                      <figure className="col-md-4 mb-0">
                        <Link to={`/shop-product-right?id=${product.id}`}>
                          <img 
                            src={productImage} 
                            alt={product.name || 'Product'}
                            onError={(e) => {
                              e.target.src = getUnsplashFallback(index + 720);
                            }}
                          />
                        </Link>
                      </figure>
                      <div className="col-md-8 mb-0">
                        <h6>
                          <Link to={`/shop-product-right?id=${product.id}`}>{product.name || 'Product'}</Link>
                        </h6>
                        <div className="product-rate-cover">
                          <div className="product-rate d-inline-block">
                            <div className="product-rating" style={{ width: '90%' }}></div>
                          </div>
                          <span className="font-small ml-5 text-muted"> (4.0)</span>
                        </div>
                        <div className="product-price">
                          <span>${product.price || 0}</span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
            <div className="col-xl-3 col-lg-4 col-md-6 d-none d-xl-block">
              <h4 className="section-title style-1 mb-30 animated animated">Top Rated</h4>
              <div className="product-list-small animated animated">
                {products.slice(0, 3).map((product, index) => {
                  const productImage = product.image || `/assets/imgs/shop/product-${(index % 10) + 1}-1.jpg`;
                  return (
                    <article key={product.id} className="row align-items-center hover-up">
                      <figure className="col-md-4 mb-0">
                        <Link to={`/shop-product-right?id=${product.id}`}>
                          <img 
                            src={productImage} 
                            alt={product.name || 'Product'}
                            onError={(e) => {
                              e.target.src = getUnsplashFallback(index + 820);
                            }}
                          />
                        </Link>
                      </figure>
                      <div className="col-md-8 mb-0">
                        <h6>
                          <Link to={`/shop-product-right?id=${product.id}`}>{product.name || 'Product'}</Link>
                        </h6>
                        <div className="product-rate-cover">
                          <div className="product-rate d-inline-block">
                            <div className="product-rating" style={{ width: '90%' }}></div>
                          </div>
                          <span className="font-small ml-5 text-muted"> (4.0)</span>
                        </div>
                        <div className="product-price">
                          <span>${product.price || 0}</span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
      {/*End Top Selling*/}

      {footer.length > 0 && (
        <section className="section-padding pt-0 mb-30">
          <div className="container">
            <div className="row">
              {footer.slice(0, 4).map((item, index) => (
                <div key={item.id || index} className="col-lg-3 col-md-6 mb-20">
                  <div className="p-20 border-radius-10" style={{ backgroundColor: '#eef9f2', minHeight: '170px' }}>
                    <h5 className="mb-10">{item.title || 'Portal Notice'}</h5>
                    <p style={{ fontSize: '13px' }} className="mb-10">{item.subtitle || item.content || 'Stay updated with latest announcements.'}</p>
                    {renderBannerCta(item, '/shop', item.buttonText || 'Read More')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

    </main>
  );
};

export default Home;
