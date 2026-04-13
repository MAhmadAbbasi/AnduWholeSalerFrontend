import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { submitContactForm } from '../utils/api';
import { showSuccess, showError, showLoading } from '../utils/swal';

const Contact = () => {
  const mapRef = useRef(null);
  const mapInitialized = useRef(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showError('Validation Error', 'Please fix the errors in the form');
      return;
    }
    
    setIsSubmitting(true);
    showLoading('Sending Message', 'Please wait...');
    
    try {
      await submitContactForm(formData);
      
      showSuccess(
        'Message Sent!',
        'Thank you for contacting us! We\'ll get back to you soon.',
        3000
      );
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      setErrors({});
    } catch (error) {
      showError(
        'Failed to Send',
        error.message || 'An error occurred while sending your message. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // Initialize Leaflet map
    const initMap = () => {
      if (!window.L || mapInitialized.current) {
        return;
      }

      try {
        // Check if map container exists
        const mapContainer = document.getElementById('map-panes');
        if (!mapContainer || mapContainer._leaflet_id) {
          return;
        }

        // Initialize map
        const map = window.L.map('map-panes').setView([30.2672, -97.7431], 13); // Austin coordinates

        // Add tile layer
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(map);

        // Add marker
        window.L.marker([30.2672, -97.7431]).addTo(map)
          .bindPopup('A and U Support Center<br>5900 BALCONES DRIVE 28919<br>AUSTIN TAX, USA 78731')
          .openPopup();

        mapInitialized.current = true;
      } catch (error) {
        console.warn('Map initialization error:', error);
      }
    };

    // Load Leaflet CSS and JS if not already loaded
    const loadLeaflet = () => {
      // Check if Leaflet CSS is loaded
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
        link.integrity = 'sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A==';
        link.crossOrigin = '';
        document.head.appendChild(link);
      }

      // Check if Leaflet JS is loaded
      if (!window.L) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js';
        script.integrity = 'sha512-XQoYMqMTK8LvdxXYG3nZ448hOEQiglfqkJs1NOQV44cWnUrBc8PkAOcXy20w0vlaXaVUearIOBhiXZ5V3ynxwA==';
        script.crossOrigin = '';
        script.onload = () => {
          setTimeout(initMap, 500);
        };
        script.onerror = () => {
          console.warn('Failed to load Leaflet library');
        };
        document.body.appendChild(script);
      } else {
        setTimeout(initMap, 500);
      }
    };

    // Try to initialize map
    let timeoutId;
    let checkInterval;

    const tryInit = () => {
      if (window.L) {
        initMap();
      } else {
        loadLeaflet();
        // Keep checking if Leaflet loads
        checkInterval = setInterval(() => {
          if (window.L && !mapInitialized.current) {
            initMap();
            clearInterval(checkInterval);
          }
        }, 500);
      }
    };

    timeoutId = setTimeout(tryInit, 1000);

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      if (checkInterval) {
        clearInterval(checkInterval);
      }
      if (window.L) {
        try {
          const mapContainer = document.getElementById('map-panes');
          if (mapContainer && mapContainer._leaflet_id) {
            const map = window.L.map.get(mapContainer._leaflet_id);
            if (map) {
              map.remove();
            }
          }
        } catch (error) {
          // Ignore cleanup errors
        }
      }
      mapInitialized.current = false;
    };
  }, []);

  return (
    <main className="main pages">
      <div className="page-header breadcrumb-wrap">
        <div className="container">
          <div className="breadcrumb">
            <a href="/" rel="nofollow">
              <i className="fi-rs-home mr-5"></i>Home
            </a>
            <span></span> Pages <span></span> Contact
          </div>
        </div>
      </div>
      <div className="page-content pt-50">
        <div className="container">
          <div className="row">
            <div className="col-xl-10 col-lg-12 m-auto">
              <section className="row align-items-end mb-50">
                <div className="col-lg-4 mb-lg-0 mb-md-5 mb-sm-5">
                  <h4 className="mb-20 text-brand">How can we help you?</h4>
                  <h1 className="mb-30">Let us know how we can help you</h1>
                  <p className="mb-20">
                    We are here to support your orders, deliveries, and account questions with quick and friendly service.
                  </p>
                  <p>
                    Reach out through any channel below and our team will respond as soon as possible.
                  </p>
                </div>
                <div className="col-lg-8">
                  <div className="row">
                    <div className="col-lg-6 mb-4">
                      <h5 className="mb-20">01. Visit Feedback</h5>
                      <p>
                        Share your in-store and delivery experience so we can keep improving every day.
                      </p>
                    </div>
                    <div className="col-lg-6 mb-4">
                      <h5 className="mb-20">02. Employer Services</h5>
                      <p>
                        Need help with wholesale or business accounts? Our team is ready to assist.
                      </p>
                    </div>
                    <div className="col-lg-6 mb-lg-0 mb-4">
                      <h5 className="mb-20 text-brand">03. Billing Inquiries</h5>
                      <p>
                        For invoice, payment, and refund concerns, contact billing for fast resolution.
                      </p>
                    </div>
                    <div className="col-lg-6">
                      <h5 className="mb-20">04. General Inquiries</h5>
                      <p>
                        Ask us anything about products, stock, opening hours, and platform support.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
        <section className="container mb-50 d-none d-md-block">
          <div className="border-radius-15 overflow-hidden">
            <div id="map-panes" className="leaflet-map" ref={mapRef} style={{ height: '400px' }}></div>
          </div>
        </section>
        <div className="container">
          <div className="row">
            <div className="col-xl-10 col-lg-12 m-auto">
              <section className="mb-50">
                <div className="row mb-60">
                  <div className="col-md-4 mb-4 mb-md-0">
                    <h4 className="mb-15 text-brand">Office</h4>
                    5900 BALCONES DRIVE 28919<br />
                    AUSTIN TAX, USA 78731<br />
                    <abbr title="Phone">Phone:</abbr> 1900 - 6666<br />
                    <abbr title="Email">Email: </abbr>sale@aandu.com<br />
                    <Link to="#" className="btn btn-sm font-weight-bold text-white mt-20 border-radius-5 btn-shadow-brand hover-up">
                      <i className="fi-rs-marker mr-5"></i>View map
                    </Link>
                  </div>
                  <div className="col-md-4 mb-4 mb-md-0">
                    <h4 className="mb-15 text-brand">Studio</h4>
                    5900 BALCONES DRIVE 28919<br />
                    AUSTIN TAX, USA 78731<br />
                    <abbr title="Phone">Phone:</abbr> 1900 - 8888<br />
                    <abbr title="Email">Email: </abbr>sale@aandu.com<br />
                    <Link to="#" className="btn btn-sm font-weight-bold text-white mt-20 border-radius-5 btn-shadow-brand hover-up">
                      <i className="fi-rs-marker mr-5"></i>View map
                    </Link>
                  </div>
                  <div className="col-md-4">
                    <h4 className="mb-15 text-brand">Shop</h4>
                    5900 BALCONES DRIVE 28919<br />
                    AUSTIN TAX, USA 78731<br />
                    <abbr title="Phone">Phone:</abbr> (+01) - 2345 - 6789<br />
                    <abbr title="Email">Email: </abbr>sale@aandu.com<br />
                    <Link to="#" className="btn btn-sm font-weight-bold text-white mt-20 border-radius-5 btn-shadow-brand hover-up">
                      <i className="fi-rs-marker mr-5"></i>View map
                    </Link>
                  </div>
                </div>
                <div className="row">
                  <div className="col-xl-8">
                    <div className="contact-from-area padding-20-row-col">
                      <h5 className="text-brand mb-10">Contact form</h5>
                      <h2 className="mb-10">Drop Us a Line</h2>
                      <p className="text-muted mb-30 font-sm">
                        Your email address will not be published. Required fields are marked *
                      </p>
                      <form className="contact-form-style mt-30" id="contact-form" onSubmit={handleSubmit}>
                        <div className="row">
                          <div className="col-lg-6 col-md-6">
                            <div className="input-style mb-20">
                              <input 
                                name="name" 
                                placeholder="First Name *" 
                                type="text"
                                value={formData.name}
                                onChange={handleInputChange}
                                className={errors.name ? 'error' : ''}
                              />
                              {errors.name && <span className="text-danger small">{errors.name}</span>}
                            </div>
                          </div>
                          <div className="col-lg-6 col-md-6">
                            <div className="input-style mb-20">
                              <input 
                                name="email" 
                                placeholder="Your Email *" 
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className={errors.email ? 'error' : ''}
                              />
                              {errors.email && <span className="text-danger small">{errors.email}</span>}
                            </div>
                          </div>
                          <div className="col-lg-6 col-md-6">
                            <div className="input-style mb-20">
                              <input 
                                name="phone" 
                                placeholder="Your Phone" 
                                type="tel"
                                value={formData.phone}
                                onChange={handleInputChange}
                              />
                            </div>
                          </div>
                          <div className="col-lg-6 col-md-6">
                            <div className="input-style mb-20">
                              <input 
                                name="subject" 
                                placeholder="Subject *" 
                                type="text"
                                value={formData.subject}
                                onChange={handleInputChange}
                                className={errors.subject ? 'error' : ''}
                              />
                              {errors.subject && <span className="text-danger small">{errors.subject}</span>}
                            </div>
                          </div>
                          <div className="col-lg-12 col-md-12">
                            <div className="textarea-style mb-30">
                              <textarea 
                                name="message" 
                                placeholder="Message *"
                                value={formData.message}
                                onChange={handleInputChange}
                                className={errors.message ? 'error' : ''}
                              ></textarea>
                              {errors.message && <span className="text-danger small">{errors.message}</span>}
                            </div>
                            <button 
                              className="submit submit-auto-width" 
                              type="submit"
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? 'Sending...' : 'Send message'}
                            </button>
                          </div>
                        </div>
                      </form>
                      <p className="form-messege"></p>
                    </div>
                  </div>
                  <div className="col-lg-4 pl-50 d-lg-block d-none">
                    <img 
                      className="border-radius-15 mt-50" 
                      src="assets/imgs/page/contact-2.png"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=400&fit=crop'; }} 
                      alt="Contact" 
                    />
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Contact;
