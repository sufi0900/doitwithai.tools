import Breadcrumb from "@/components/Common/Breadcrumb";
import Contact from "@/components/Contact";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Get Expert Help with AI Tools and Web Development",
  description:
    "Have questions or need support? Reach out through our Contact page to get expert guidance on AI tools, web development, and more. We're here to help!",
};


const ContactPage = () => {
  return (
    <>
     <Breadcrumb
  linktext="Contact Us"
  firstlinktext="Home"
  firstlink="/"
  pageName="Contact Us"
  pageName2=""
  link="contact"
  description="Reach out to us for expert support on AI tools, web development solutions, or general inquiries. We're just a message away!"
/>
<Contact />
    </>
  );
};

export default ContactPage;
