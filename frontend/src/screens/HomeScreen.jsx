import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { listProducts } from "../actions/productActions";
import { listTopSellers } from "../actions/userActions";
import ModernButton from "../components/ModernButton";
import ModernCard from "../components/ModernCard";
import ModernProduct from "../components/ModernProduct";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";

export default function HomeScreen() {
  const dispatch = useDispatch();
  const [currentFeature, setCurrentFeature] = useState(0);

  const productList = useSelector((state) => state.productList);
  const { loading, error, products } = productList;

  const userTopSellersList = useSelector((state) => state.userTopSellersList);
  const {
    loading: loadingSellers,
    error: errorSellers,
    users: sellers,
  } = userTopSellersList;

  // Featured sections data
  const features = [
    {
      title: "Cosmic Art & Music",
      subtitle: "Discover the Universe Through Creative Expression",
      description:
        "Explore our collection of mystical artwork, ambient soundscapes, and spiritual insights that connect you to the cosmos.",
      image: "/images/p1.jpg",
      cta: "Explore Collection",
      link: "/products",
    },
    {
      title: "Interactive Frequency Scanner",
      subtitle: "Tune Into Cosmic Frequencies",
      description:
        "Experience our unique frequency game that unlocks hidden content and achievements as you explore different resonance patterns.",
      image: "/images/p2.jpg",
      cta: "Start Scanning",
      link: "/games",
    },
    {
      title: "Mystical Media Library",
      subtitle: "Immerse Yourself in Cosmic Content",
      description:
        "Access exclusive videos, audio tracks, and interactive experiences designed to expand your consciousness and creativity.",
      image: "/images/p3.jpg",
      cta: "Browse Media",
      link: "/media",
    },
  ];

  useEffect(() => {
    dispatch(listProducts({}));
    dispatch(listTopSellers());
  }, [dispatch]);

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-section relative overflow-hidden">
        <div className="hero-background absolute inset-0">
          <div className="hero-gradient"></div>
          <div className="cosmic-particles"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="hero-content text-center py-20 lg:py-32">
            <div className="hero-text-content max-w-4xl mx-auto">
              <h1 className="hero-title text-5xl lg:text-7xl font-bold mb-6 text-white animate-float">
                Welcome to{" "}
                <span className="hero-brand-text bg-gradient-to-r from-primary-400 to-accent-500 bg-clip-text text-transparent">
                  Astro Mahri Space
                </span>
              </h1>

              <p className="hero-subtitle text-xl lg:text-2xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
                {features[currentFeature].description}
              </p>

              <div className="hero-cta-buttons flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link to={features[currentFeature].link}>
                  <ModernButton
                    variant="accent"
                    size="xl"
                    className="hero-primary-cta"
                  >
                    <i className="fas fa-rocket mr-2"></i>
                    {features[currentFeature].cta}
                  </ModernButton>
                </Link>

                <Link to="/about">
                  <ModernButton
                    variant="outline"
                    size="xl"
                    className="hero-secondary-cta text-white border-white hover:bg-white hover:text-dark-800"
                  >
                    <i className="fas fa-info-circle mr-2"></i>
                    Learn More
                  </ModernButton>
                </Link>
              </div>
            </div>

            {/* Feature indicators */}
            <div className="hero-indicators flex justify-center mt-12 gap-3">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentFeature(index)}
                  className={`indicator-dot w-3 h-3 rounded-full transition-all ${
                    index === currentFeature
                      ? "bg-accent-500 w-8"
                      : "bg-white/30 hover:bg-white/50"
                  }`}
                  aria-label={`Switch to feature ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section py-20 bg-background-secondary relative">
        <div className="container mx-auto px-4">
          <div className="section-header text-center mb-16">
            <h2 className="section-title text-4xl lg:text-5xl font-bold mb-6">
              Explore the <span className="text-accent-500">Cosmic</span>{" "}
              Experience
            </h2>
            <p className="section-subtitle text-xl text-text-secondary max-w-3xl mx-auto">
              Discover a unique blend of art, music, and interactive experiences
              designed to expand your consciousness and connect you with the
              universe.
            </p>
          </div>

          <div className="features-grid grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <ModernCard
                key={index}
                className="feature-card group cursor-pointer h-full"
                hover={true}
              >
                <div className="feature-content h-full flex flex-col">
                  <div className="feature-icon mb-6 text-center">
                    <div className="icon-container w-16 h-16 mx-auto bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center text-white text-2xl group-hover:scale-110 transition-transform">
                      <i
                        className={`fas ${
                          index === 0
                            ? "fa-palette"
                            : index === 1
                            ? "fa-wave-square"
                            : "fa-play-circle"
                        }`}
                      ></i>
                    </div>
                  </div>

                  <h3 className="feature-title text-xl font-semibold mb-3 text-text-primary text-center">
                    {feature.title}
                  </h3>

                  <p className="feature-description text-text-secondary text-center mb-6 flex-grow">
                    {feature.subtitle}
                  </p>

                  <div className="feature-cta text-center">
                    <Link to={feature.link}>
                      <ModernButton
                        variant="ghost"
                        size="sm"
                        className="group-hover:bg-primary-500 group-hover:text-white"
                      >
                        {feature.cta}
                        <i className="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
                      </ModernButton>
                    </Link>
                  </div>
                </div>
              </ModernCard>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="products-section py-20">
        <div className="container mx-auto px-4">
          <div className="section-header text-center mb-16">
            <h2 className="section-title text-4xl lg:text-5xl font-bold mb-6">
              Featured <span className="text-primary-500">Products</span>
            </h2>
            <p className="section-subtitle text-xl text-text-secondary max-w-2xl mx-auto">
              Discover our curated collection of cosmic art, mystical music, and
              spiritual insights.
            </p>
          </div>

          {loading ? (
            <div className="loading-container flex justify-center">
              <LoadingBox />
            </div>
          ) : error ? (
            <div className="error-container text-center">
              <MessageBox variant="danger">{error}</MessageBox>
            </div>
          ) : (
            <>
              {products.length === 0 ? (
                <div className="no-products text-center">
                  <MessageBox>No Products Found</MessageBox>
                </div>
              ) : (
                <div className="products-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {products.slice(0, 8).map((product) => (
                    <ModernProduct
                      key={product._id}
                      product={{
                        name: product.name,
                        price: product.price,
                        image: product.image,
                        description: product.description,
                        rating: product.rating,
                        reviewCount: product.numReviews,
                        badge:
                          product.countInStock === 0 ? "Out of Stock" : null,
                        _id: product._id,
                      }}
                    />
                  ))}
                </div>
              )}

              {products.length > 8 && (
                <div className="products-cta text-center mt-12">
                  <Link to="/products">
                    <ModernButton variant="outline" size="lg">
                      <i className="fas fa-th-large mr-2"></i>
                      View All Products
                    </ModernButton>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Top Sellers Section */}
      {sellers && sellers.length > 0 && (
        <section className="sellers-section py-20 bg-background-secondary">
          <div className="container mx-auto px-4">
            <div className="section-header text-center mb-16">
              <h2 className="section-title text-4xl lg:text-5xl font-bold mb-6">
                Top <span className="text-secondary-500">Creators</span>
              </h2>
              <p className="section-subtitle text-xl text-text-secondary max-w-2xl mx-auto">
                Meet the talented artists and creators behind our cosmic
                collection.
              </p>
            </div>

            {loadingSellers ? (
              <div className="loading-container flex justify-center">
                <LoadingBox />
              </div>
            ) : errorSellers ? (
              <div className="error-container text-center">
                <MessageBox variant="danger">{errorSellers}</MessageBox>
              </div>
            ) : (
              <div className="sellers-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
                {sellers.slice(0, 6).map((seller) => (
                  <ModernCard
                    key={seller._id}
                    className="seller-card group text-center"
                  >
                    <Link to={`/seller/${seller._id}`} className="block">
                      <div className="seller-avatar mb-4">
                        <img
                          src={seller.seller.logo || "/images/logo2.png"}
                          alt={seller.seller.name}
                          className="w-20 h-20 mx-auto rounded-full object-cover group-hover:scale-110 transition-transform"
                        />
                      </div>
                      <h3 className="seller-name text-lg font-semibold text-text-primary group-hover:text-primary-500 transition-colors">
                        {seller.seller.name}
                      </h3>
                      <p className="seller-description text-text-secondary text-sm mt-2">
                        {seller.seller.description || "Cosmic Creator"}
                      </p>
                    </Link>
                  </ModernCard>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Call to Action Section */}
      <section className="cta-section py-20 relative overflow-hidden">
        <div className="cta-background absolute inset-0 bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500"></div>
        <div className="cosmic-overlay absolute inset-0 opacity-20"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="cta-content text-center text-white max-w-4xl mx-auto">
            <h2 className="cta-title text-4xl lg:text-5xl font-bold mb-6">
              Ready to Begin Your Cosmic Journey?
            </h2>
            <p className="cta-subtitle text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join our community of cosmic explorers and unlock exclusive
              content, interactive experiences, and mystical insights.
            </p>

            <div className="cta-buttons flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/signup">
                <ModernButton variant="accent" size="xl" className="shadow-lg">
                  <i className="fas fa-user-plus mr-2"></i>
                  Start Your Journey
                </ModernButton>
              </Link>

              <Link to="/games">
                <ModernButton
                  variant="ghost"
                  size="xl"
                  className="text-white border-white hover:bg-white hover:text-primary-600"
                >
                  <i className="fas fa-play mr-2"></i>
                  Try the Game
                </ModernButton>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
