import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Truck, RotateCcw, ShieldCheck, MapPin, Search } from "lucide-react";

const SupportPage = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [hash]);

  return (
    <div className="support-page">
      <section className="support-hero">
        <div className="container">
          <h1>How can we help you?</h1>
          <p>Find everything you need to know about your order, shipping, and more.</p>
        </div>
      </section>

      <div className="container support-content">
        {/* Support Overview */}
        <section id="support" className="support-section">
          <div className="section-header">
            <Search className="section-icon" />
            <h2>Support</h2>
          </div>
          <div className="support-card">
            <p>Our dedicated support team is here to assist you with any inquiries or issues you may have.</p>
            <div className="contact-info">
              <div className="contact-item">
                <strong>Email:</strong> support@nawab-electronics.com
              </div>
              <div className="contact-item">
                <strong>WhatsApp:</strong> +92 300 1234567
              </div>
              <div className="contact-item">
                <strong>Hours:</strong> Mon - Sat, 10:00 AM - 8:00 PM
              </div>
            </div>
          </div>
        </section>

        {/* Track Order */}
        <section id="track-order" className="support-section">
          <div className="section-header">
            <MapPin className="section-icon" />
            <h2>Track Order</h2>
          </div>
          <div className="support-card">
            <p>Keep an eye on your package! Enter your order ID below to see the current status of your shipment.</p>
            <div className="track-form">
              <input type="text" placeholder="Enter Order ID (e.g. #12345)" className="track-input" />
              <button className="btn btn-primary">Track Now</button>
            </div>
            <p className="note">Don't have your Order ID? Check your confirmation email or log in to your account.</p>
          </div>
        </section>

        {/* Returns & Exchanges */}
        <section id="returns" className="support-section">
          <div className="section-header">
            <RotateCcw className="section-icon" />
            <h2>Returns & Exchanges</h2>
          </div>
          <div className="support-card">
            <h3>Easy Returns Policy</h3>
            <p>We want you to be completely satisfied with your purchase. If for any reason you're not, we offer a 7-day hassle-free return policy.</p>
            <ul>
              <li>Items must be in original packaging and condition.</li>
              <li>Returns are accepted within 7 days of delivery.</li>
              <li>Exchanges are subject to product availability.</li>
              <li>Refunds will be processed to your original payment method.</li>
            </ul>
            <button className="btn btn-outline">Initiate Return</button>
          </div>
        </section>

        {/* Shipping Policy */}
        <section id="shipping" className="support-section">
          <div className="section-header">
            <Truck className="section-icon" />
            <h2>Shipping Policy</h2>
          </div>
          <div className="support-card">
            <p>We deliver nationwide with speed and care. Our goal is to get your premium electronics to you as quickly as possible.</p>
            <div className="shipping-grid">
              <div className="shipping-item">
                <h4>Standard Shipping</h4>
                <p>3-5 Business Days</p>
                <span className="price">Rs. 250</span>
              </div>
              <div className="shipping-item">
                <h4>Express Delivery</h4>
                <p>1-2 Business Days</p>
                <span className="price">Rs. 600</span>
              </div>
              <div className="shipping-item">
                <h4>Free Shipping</h4>
                <p>On orders over Rs. 10,000</p>
                <span className="price">FREE</span>
              </div>
            </div>
          </div>
        </section>

        {/* Warranty Info */}
        <section id="warranty" className="support-section">
          <div className="section-header">
            <ShieldCheck className="section-icon" />
            <h2>Warranty Info</h2>
          </div>
          <div className="support-card">
            <p>Shop with confidence. Every product at Nawab Electronics comes with a manufacturer warranty to protect your investment.</p>
            <div className="warranty-details">
              <div className="warranty-row">
                <strong>Large Appliances:</strong> 2-5 Years Warranty
              </div>
              <div className="warranty-row">
                <strong>Small Appliances:</strong> 1 Year Warranty
              </div>
              <div className="warranty-row">
                <strong>Electronics:</strong> 1 Year Local Warranty
              </div>
            </div>
            <p className="note">Warranty covers manufacturing defects and does not include accidental damage or misuse.</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SupportPage;
