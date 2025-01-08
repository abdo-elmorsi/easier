import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    // Save the original renderPage method
    const originalRenderPage = ctx.renderPage;

    // Run the React rendering logic synchronously
    ctx.renderPage = () =>
      originalRenderPage({
        // Useful for wrapping the whole React tree
        enhanceApp: (App) => App,
        // Useful for wrapping on a per-page basis
        enhanceComponent: (Component) => Component,
      });

    // Get initial props from the parent Document
    const initialProps = await Document.getInitialProps(ctx);
    return initialProps;
  }

  render() {
    return (
      <Html lang="ar" className="light">
        <Head>
          {/* Google Fonts */}
          <link
            href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap"
            rel="stylesheet"
          />

          {/* Primary Meta Tags */}
          <meta name="application-name" content="Army | Store Market" />
          <meta name="description" content="Best Army Store Market App in the world" />
          <meta name="keywords" content="army, store, military, market, best army store, supplies" />
          <meta name="author" content="Abdo Elmorsi" />
          <meta name="format-detection" content="telephone=no" />
          <meta charSet="UTF-8" />

          {/* PWA and Apple Touch Meta */}
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="Army | Store Market" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="msapplication-TileColor" content="#336a86" />
          <meta name="msapplication-tap-highlight" content="no" />
          <meta name="theme-color" content="#336a86" />
          <meta name="msapplication-config" content="/browserconfig.xml" />

          <meta name="msapplication-TileImage" content="/touch-icon/touch-icon-144x144.png" />


          {/* Icons */}
          <link rel="apple-touch-icon" sizes="152x152" href="/touch-icon/touch-icon-ipad.png" />
          <link rel="apple-touch-icon" sizes="180x180" href="/touch-icon/touch-icon-iphone-retina.png" />
          <link rel="apple-touch-icon" sizes="167x167" href="/touch-icon/touch-icon-ipad-retina.png" />
          <link rel="apple-touch-icon" sizes="144x144" href="/touch-icon/touch-icon-144x144.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
          <link rel="shortcut icon" href="/favicon.ico" />
          <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#336a86" />
          <link rel="manifest" href="/manifest.json" />

          {/* Social Media Meta Tags */}
          <meta name="twitter:card" content="summary" />
          <meta name="twitter:url" content="https://army-web-store-market.vercel.app" />
          <meta name="twitter:title" content="Army | Store Market" />
          <meta name="twitter:description" content="Best Army Store Market App in the world" />
          <meta name="twitter:image" content="/icon-192x192.png" />
          <meta name="twitter:creator" content="@Abdo_Elmorsi" />

          <meta property="og:type" content="website" />
          <meta property="og:title" content="Army | Store Market" />
          <meta property="og:description" content="Best Army Store Market App in the world" />
          <meta property="og:site_name" content="Army | Store Market" />
          <meta property="og:url" content="https://army-web-store-market.vercel.app" />
          <meta property="og:image" content="https://army-web-store-market.vercel.app/apple-touch-icon.png" />

          {/* Language Support */}
          <meta httpEquiv="content-language" content="ar, en" />

          {/* Arabic Version (Primary) */}
          <meta name="application-name" content="سوق المخازن العسكرية" />
          <meta name="description" content="أفضل تطبيق سوق المخازن العسكرية في العالم" />
          <meta property="og:title" content="سوق المخازن العسكرية" />
          <meta property="og:description" content="أفضل تطبيق سوق المخازن العسكرية في العالم" />
        </Head>

        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
