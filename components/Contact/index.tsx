/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
"use client"
import { useState, useRef } from "react";
import emailjs from "@emailjs/browser";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NewsLatterBox from "./NewsLatterBox";
import Breadcrumb from "../Common/Breadcrumb";

const Contact = () => {
  const form = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for form inputs
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  // State for field focus to create floating labels effect
  const [focusedFields, setFocusedFields] = useState({
    name: false,
    email: false,
    message: false,
  });

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name === "user_name" ? "name" : name === "user_email" ? "email" : name]: value,
    }));
  };

  // Handle focus events
  const handleFocus = (fieldName: string) => {
    setFocusedFields(prev => ({ ...prev, [fieldName]: true }));
  };

  const handleBlur = (fieldName: string) => {
    setFocusedFields(prev => ({ ...prev, [fieldName]: false }));
  };

  // Handle form submission
  const sendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (form.current) {
      emailjs
        .sendForm(
          "service_ugauc93",
          "template_adfk5bp",
          form.current,
          "Jwo8Jvergs2aiHjIX"
        )
        .then(
          (result) => {
            console.log(result.text);
            toast.success("🎉 Thank you for reaching out! We'll get back to you within 24 hours.", {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              theme: "colored",
              style: {
                background: "linear-gradient(135deg, #4A6CF7 0%, #5B7BF8 100%)",
                borderRadius: "12px",
                boxShadow: "0 8px 32px rgba(74, 108, 247, 0.3)",
              }
            });
            setFormData({ name: "", email: "", message: "" });
          },
          (error) => {
            console.error(error.text);
            toast.error("❌ Oops! Something went wrong. Please try submitting the form again.", {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              theme: "colored",
              style: {
                background: "linear-gradient(135deg, #EF4444 0%, #F87171 100%)",
                borderRadius: "12px",
                boxShadow: "0 8px 32px rgba(239, 68, 68, 0.3)",
              }
            });
          }
        )
        .finally(() => {
          setIsSubmitting(false);
        });
    }
  };

  return (
    <section id="contact" className="container mx-auto px-4 py-16">
      {/* Background decorative elements */}
       <Breadcrumb
        linktext="Contact Us"
        firstlinktext="Home"
        firstlink="/"
        pageName="Contact Us"
        pageName2=""
        link="contact"
        description="Connect for queries, feedback, or collaborations around AI tools, learning, or digital growth — and stay updated through our newsletter."
      />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-primary/10 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="container mt-8 relative z-10">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full  lg:w-7/12 xl:w-8/12">
            <div className="wow fadeInUp group relative mb-12 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-100 px-8 py-11 shadow-three transition-all duration-500 hover:shadow-[0_20px_80px_rgba(74,108,247,0.12)] dark:border-gray-700/50 dark:bg-gray-dark/80 sm:p-[55px] lg:mb-5 lg:px-8 xl:p-[55px]">
              
              {/* Enhanced Header with Icon */}
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
                  <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h2 className="mb-3 text-2xl font-bold text-black dark:text-white sm:text-3xl lg:text-2xl xl:text-3xl">
                  Get in Touch with{" "}
                  <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                    Do It with AI Tools
                  </span>
                </h2>
                <p className="text-base font-medium text-body-color dark:text-body-color-dark">
                  Have questions about AI tools, suggestions for content, or just want to say hello? 
                  We'd love to hear from you! Drop us a message below.
                </p>
              </div>

             <form ref={form} onSubmit={sendEmail}>
  <div className="flex flex-col gap-6">
    
    {/* Use a single grid for the fields to manage layout and spacing */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Name Input with Enhanced Styling */}
      <div>
        <div className="group relative">
          <label
            htmlFor="name"
            className={`absolute left-4 transition-all duration-300 pointer-events-none ${
              focusedFields.name || formData.name
                ? "-top-2 text-xs bg-white dark:bg-gray-dark px-2 text-primary font-medium"
                : "top-4 text-sm text-body-color dark:text-body-color-dark"
            }`}
          >
            Your Name *
          </label>
          <input
            type="text"
            id="name"
            name="user_name"
            value={formData.name}
            onChange={handleChange}
            onFocus={() => handleFocus("name")}
            onBlur={() => handleBlur("name")}
            className="w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-base text-body-color outline-none transition-all duration-300 focus:border-primary focus:bg-white focus:shadow-[0_0_0_4px_rgba(74,108,247,0.1)] dark:border-gray-600 dark:bg-gray-800 dark:text-body-color-dark dark:focus:border-primary dark:focus:bg-gray-800"
            required
          />
          <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-primary to-primary/60 scale-x-0 transition-transform duration-300 group-focus-within:scale-x-100"></div>
        </div>
      </div>

      {/* Email Input with Enhanced Styling */}
      <div>
        <div className="group relative">
          <label
            htmlFor="email"
            className={`absolute left-4 transition-all duration-300 pointer-events-none ${
              focusedFields.email || formData.email
                ? "-top-2 text-xs bg-white dark:bg-gray-dark px-2 text-primary font-medium"
                : "top-4 text-sm text-body-color dark:text-body-color-dark"
            }`}
          >
            Your Email *
          </label>
          <input
            type="email"
            id="email"
            name="user_email"
            value={formData.email}
            onChange={handleChange}
            onFocus={() => handleFocus("email")}
            onBlur={() => handleBlur("email")}
            className="w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-base text-body-color outline-none transition-all duration-300 focus:border-primary focus:bg-white focus:shadow-[0_0_0_4px_rgba(74,108,247,0.1)] dark:border-gray-600 dark:bg-gray-800 dark:text-body-color-dark dark:focus:border-primary dark:focus:bg-gray-800"
            required
          />
          <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-primary to-primary/60 scale-x-0 transition-transform duration-300 group-focus-within:scale-x-100"></div>
        </div>
      </div>
    </div>

    {/* Message Input with Enhanced Styling */}
    <div>
      <div className="group relative">
        <label
          htmlFor="message"
          className={`absolute left-4 transition-all duration-300 pointer-events-none ${
            focusedFields.message || formData.message
              ? "-top-2 text-xs bg-white dark:bg-gray-dark px-2 text-primary font-medium"
              : "top-4 text-sm text-body-color dark:text-body-color-dark"
          }`}
        >
          Your Message *
        </label>
        <textarea
          name="message"
          rows={5}
          value={formData.message}
          onChange={handleChange}
          onFocus={() => handleFocus("message")}
          onBlur={() => handleBlur("message")}
          className="w-full resize-none rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-base text-body-color outline-none transition-all duration-300 focus:border-primary focus:bg-white focus:shadow-[0_0_0_4px_rgba(74,108,247,0.1)] dark:border-gray-600 dark:bg-gray-800 dark:text-body-color-dark dark:focus:border-primary dark:focus:bg-gray-800"
          required
        ></textarea>
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-primary to-primary/60 scale-x-0 transition-transform duration-300 group-focus-within:scale-x-100"></div>
      </div>
    </div>
    
    {/* Enhanced Submit Button */}
    <div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-primary to-primary/90 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-[0_8px_30px_rgba(74,108,247,0.4)] hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-primary/20 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {isSubmitting ? (
            <>
              <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending Message...
            </>
          ) : (
            <>
              Send Message
              <svg className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </>
          )}
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
      </button>
    </div>
  </div>
</form>

              {/* Trust indicators */}
              <div className="mt-8 flex items-center justify-center gap-6 text-sm text-body-color dark:text-body-color-dark">
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <span>24h Response</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path>
                  </svg>
                  <span>Secure & Private</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="w-full px-4 lg:w-5/12 xl:w-4/12">
            <NewsLatterBox />
          </div>
        </div>
      </div>

<div className="mt-16 mb-8">
  <div className="bg-gradient-to-r from-blue-50/70 to-indigo-50/70 dark:from-blue-900/20 dark:to-indigo-900/30 rounded-2xl p-8 md:p-10 shadow-lg border border-blue-100 dark:border-blue-800/20 transition-all duration-500 hover:shadow-[0_20px_80px_rgba(74,108,247,0.12)]">
    

       <div className="text-center mb-8">
      <div className="flex flex-col items-center gap-3 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">Trustpilot</span>
          <div className="bg-[#00b67a] px-3 py-1.5 rounded-lg flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg key={star} className="w-4 h-4 text-white fill-white" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            ))}
          </div>
        </div>
      </div>

      <h3 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white mb-4">
      Help Our Community Grow
      </h3>
      
      <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
Since you're here connecting with us, your honest review on Trustpilot supports our mission and helps other AI enthusiasts find us through trusted community feedback. </p>
    </div>

    {/* CTA Button */}
    <div className="text-center">
      <a 
        href="https://www.trustpilot.com/review/doitwithai.tools"
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[#00b67a] px-8 py-4 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:bg-[#009b69] hover:shadow-[0_8px_30px_rgba(0,182,122,0.4)] hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-[#00b67a]/20"
      >
        <span>Share Your Review</span>
        <svg className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </a>
      
      {/* Small encouraging text */}
      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 italic">
        Takes less than 2 minutes • Helps our community grow 🌟
      </p>
    </div>
    </div>
    </div>
      {/* Enhanced Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        className="mt-16"
      />
    </section>
  );
};

export default Contact;