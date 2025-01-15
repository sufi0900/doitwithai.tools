"use client"
import { useState, useRef } from "react";
import emailjs from "@emailjs/browser";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NewsLatterBox from "./NewsLatterBox";

const Contact = () => {
  const form = useRef<HTMLFormElement>(null);

  // State for form inputs
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  // Handle input changes
  // Handle input changes
const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  const { name, value } = e.target;
  setFormData((prev) => ({
    ...prev,
    [name === "user_name" ? "name" : name === "user_email" ? "email" : name]: value,
  }));
};


  // Handle form submission
  const sendEmail = (e: React.FormEvent) => {
    e.preventDefault();

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
            toast.success("Thank you for reaching out! We'll get back to you within 24 hours.", {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              theme: "colored",
            });
            setFormData({ name: "", email: "", message: "" }); // Clear the form
          },
          (error) => {
            console.error(error.text);
            toast.error("Oops! Something went wrong. Please try submitting the form again.", {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              theme: "colored",
            });
          }
        );
    }
  };

  return (
    <section id="contact" className="overflow-hidden py-16 md:py-20 lg:py-28">
      <div className="container">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4 lg:w-7/12 xl:w-8/12">
            <div className="wow fadeInUp shadow-three dark:bg-gray-dark mb-12 rounded-sm bg-white px-8 py-11 sm:p-[55px] lg:mb-5 lg:px-8 xl:p-[55px]">
            <h2 className="mb-3 text-2xl font-bold text-black dark:text-white sm:text-3xl lg:text-2xl xl:text-3xl">
  Get in Touch with Do It with AI Tools
</h2>
<p className="mb-12 text-base font-medium text-body-color">
  Have questions about AI tools, suggestions for content, or just want to say hello? 
  We’d love to hear from you! Drop us a message below.
</p>


              <form ref={form} onSubmit={sendEmail}>
                <div className="-mx-4 flex flex-wrap">
                  {/* Name Input */}
                  <div className="w-full px-4 md:w-1/2">
                    <div className="mb-8">
                      <label
                        htmlFor="name"
                        className="mb-3 block text-sm font-medium text-dark dark:text-white"
                      >
                        Your Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="user_name"

                        placeholder="Enter your full name (e.g., John Doe)"
                        value={formData.name}
                        onChange={handleChange}
                        className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Email Input */}
                  <div className="w-full px-4 md:w-1/2">
                    <div className="mb-8">
                      <label
                        htmlFor="email"
                        className="mb-3 block text-sm font-medium text-dark dark:text-white"
                      >
                        Your Email
                      </label>
                      <input
                        type="email"
                        // name="email"
                        id="email"
 name="user_email"
 placeholder="Enter your email address (e.g., johndoe@example.com)"
 value={formData.email}
                        onChange={handleChange}
                        className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Message Input */}
                  <div className="w-full px-4">
                    <div className="mb-8">
                      <label
                        htmlFor="message"
                        className="mb-3 block text-sm font-medium text-dark dark:text-white"
                      >
                        Your Message
                      </label>
                      <textarea
                        name="message"
                        rows={5}
                        placeholder="Tell us how we can help you. Be as detailed as possible!"
                        value={formData.message}
                        onChange={handleChange}
                        className="border-stroke dark:text-body-color-dark dark:shadow-two w-full resize-none rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                        required
                      ></textarea>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="w-full px-4">
                    <button
                      type="submit"
                      className="shadow-submit dark:shadow-submit-dark rounded-sm bg-primary px-9 py-4 text-base font-medium text-white duration-300 hover:bg-primary/90"
                    >
                      Submit Message
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
          <div className="w-full px-4 lg:w-5/12 xl:w-4/12">
            <NewsLatterBox />
          </div>
        </div>
      </div>
      {/* Toast Notifications */}
      <ToastContainer />
    </section>
  );
};

export default Contact;
