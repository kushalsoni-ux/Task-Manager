const app = require('./app');

const withApiBase = (basePath = '') => {
  const normalizedBasePath = basePath ? (basePath.startsWith('/') ? basePath : `/${basePath}`) : '';

  return (req, res) => {
    const [pathname, search = ''] = req.url.split('?');
    const query = search ? `?${search}` : '';

    if (!pathname.startsWith('/api')) {
      const normalizedPathname = pathname === '/' ? '' : pathname;
      req.url = `/api${normalizedBasePath}${normalizedPathname}${query}`;
    }

    return app(req, res);
  };
};

module.exports = { withApiBase };
