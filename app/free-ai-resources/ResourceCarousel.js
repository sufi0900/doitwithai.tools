"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Slider from "react-slick";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

export default function ResourceCarousel({
  children,
  className = "",
  autoplay = true,
  autoplaySpeed = 5000,
  slidesToShow = 3,
  modalOpen = false,
}) {
  const slider = useRef(null),
    container = useRef(null);
  const count = React.Children.count(children);
  const [playing, setPlaying] = useState(autoplay);
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [slots, setSlots] = useState(slidesToShow);
  const [index, setIndex] = useState(0);
  const [legacyModalCount, setLegacyModalCount] = useState(0);
  const syncSlides = useCallback(() => {
    requestAnimationFrame(() =>
      container.current?.querySelectorAll(".slick-slide").forEach((el) => {
        el.inert = el.getAttribute("aria-hidden") === "true";
      }),
    );
  }, []);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const preference = () => {
      setReduced(media.matches);
      if (media.matches) setPlaying(false);
    };
    const resize = () =>
      setSlots(
        Math.min(
          count,
          window.innerWidth < 640
            ? 1
            : window.innerWidth < 1024
              ? Math.min(2, slidesToShow)
              : slidesToShow,
        ),
      );
    const visibility = () => setPageVisible(!document.hidden);
    preference();
    resize();
    visibility();
    media.addEventListener("change", preference);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", visibility);
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.15 },
    );
    if (container.current) observer.observe(container.current);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", preference);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [count, slidesToShow]);
  useEffect(() => {
    const open = () => setLegacyModalCount((n) => n + 1);
    const close = (e) =>
      setLegacyModalCount((n) => (e.detail?.closeAll ? 0 : Math.max(0, n - 1)));
    window.addEventListener("openResourceModal", open);
    window.addEventListener("closeResourceModal", close);
    window.addEventListener("closeAllResourceModals", close);
    return () => {
      window.removeEventListener("openResourceModal", open);
      window.removeEventListener("closeResourceModal", close);
      window.removeEventListener("closeAllResourceModals", close);
    };
  }, []);
  const rotating =
    autoplay &&
    playing &&
    visible &&
    pageVisible &&
    !hovered &&
    !modalOpen &&
    legacyModalCount === 0 &&
    count > slots;
  useEffect(() => {
    if (rotating) slider.current?.slickPlay();
    else slider.current?.slickPause();
  }, [rotating]);
  const settings = {
    dots: false,
    arrows: false,
    infinite: count > slots,
    speed: reduced ? 0 : 600,
    slidesToShow: Math.min(count, slidesToShow),
    slidesToScroll: 1,
    autoplay: rotating,
    autoplaySpeed,
    pauseOnHover: false,
    pauseOnFocus: false,
    accessibility: true,
    waitForAnimate: true,
    onInit: syncSlides,
    onReInit: syncSlides,
    afterChange: (i) => {
      setIndex(i);
      syncSlides();
    },
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: Math.min(count, slidesToShow, 2) },
      },
      { breakpoint: 640, settings: { slidesToShow: 1 } },
    ],
  };
  if (!count) return null;
  return (
    <div
      ref={container}
      role="region"
      aria-roledescription="carousel"
      aria-label="Free AI resources"
      className={`carousel-container relative ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setPlaying(false)}
    >
      <Slider ref={slider} {...settings} className="resource-carousel-slider">
        {React.Children.map(children, (child, i) => (
          <div key={i} className="px-3">
            {child}
          </div>
        ))}
      </Slider>
      {count > slots && (
        <div className="resource-carousel-controls">
          <p aria-live={rotating ? "off" : "polite"}>
            Resource {index + 1} of {count}
          </p>
          <div className="flex items-center gap-2">
            {autoplay && (
              <button
                type="button"
                className="resource-rotation-button"
                aria-label={
                  playing
                    ? "Pause resource autoplay"
                    : "Start resource autoplay"
                }
                onClick={() => setPlaying(!playing)}
              >
                {playing ? (
                  <Pause aria-hidden size={16} />
                ) : (
                  <Play aria-hidden size={16} />
                )}
                {playing ? "Pause" : "Play"}
              </button>
            )}
            <button
              type="button"
              className="home-carousel-button"
              aria-label="Previous resource"
              onClick={() => slider.current?.slickPrev()}
            >
              <ChevronLeft aria-hidden />
            </button>
            <button
              type="button"
              className="home-carousel-button"
              aria-label="Next resource"
              onClick={() => slider.current?.slickNext()}
            >
              <ChevronRight aria-hidden />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
