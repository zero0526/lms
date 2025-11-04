import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import heroImg from "../assets/Group1.png"
import MarketingArticles from "../components/Blogs/MarketingArticles";
import BlogSections from "../components/Blogs/BlogSections";

<BlogSections />


export default function Blog() {
  return (
    <div className="bg-white text-gray-800">
      <Navbar />

      {/* ===== HERO SECTION ===== */}
     <section className="bg-[#E7F1FF] py-16">
      <div className="container mx-auto flex flex-col md:flex-row items-center px-6 md:px-12 gap-10">
        {/* Left content */}
        <div className="flex-1 space-y-5">
          <p className="text-sm font-medium text-gray-600">
            By <span className="text-teal-600 font-semibold">Themadbrains</span>{" "}
            in <span className="text-teal-600 font-semibold">Inspiration</span>
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-[#132742] leading-snug">
            Why Swift UI Should Be on the Radar of Every Mobile Developer
          </h1>
          <p className="text-gray-600 max-w-lg">
            SwiftUI is transforming the way iOS apps are built,
            offering developers a faster, more intuitive way to design user interfaces.
             With its declarative syntax, real-time previews,
              and seamless integration across Apple platforms,
               SwiftUI empowers developers to create beautiful,
               consistent apps with less code and more flexibility.
                Whether you’re building your first iPhone app or modernizing existing code,
                 SwiftUI is a must-have skill for staying ahead in mobile development.
          </p>
          <button className="bg-[#23BDEE] text-white font-semibold px-6 py-3 rounded-lg hover:bg-[#1da8d6] transition-all duration-300">
            <a href="/login">Start learning now</a>
          </button>
        </div>

        {/* Right image */}
        <div className="flex-1 flex justify-center">
          <img
            src={heroImg}
            alt="Blog Hero"
            className="rounded-xl shadow-lg max-w-full h-auto lg:mr-16 md:mt-10 lg:mt-16"
          />
        </div>
      </div>
    </section>
        {/* BlogSections */}
        <BlogSections />


        {/* MarketingArticles */}

        <MarketingArticles />

      <Footer />
    </div>
  );
}
