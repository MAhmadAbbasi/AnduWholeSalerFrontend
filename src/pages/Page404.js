import React from 'react';

const Page404 = () => {
  return (
    <div className="main-content-inner">
      <div className="container">
        <div className="row">
          <div className="col-lg-12 text-center">
            <div className="error-content">
              <h1 className="error-title">404</h1>
              <h2 className="error-subtitle">Page Not Found</h2>
              <p className="error-text">The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
              <a href="/" className="btn btn-primary">Go to Homepage</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page404;

