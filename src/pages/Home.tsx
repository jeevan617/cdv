import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Spline from "@splinetool/react-spline";
import "./Home.css";
import musicFile from "../assets/music.mp3";

export default function Home() {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const toggleMusic = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.play();
      setPlaying(true);
    }
  };

  return (
    <div className="home-container">
      <div className="spline-bg" aria-hidden="true">
        <Spline scene="/cdv.spline" />
      </div>
      <div className="cta-overlay">
        <h1 className="home-caption">Health Prediction</h1>
        <p className="home-quote">"Your health is an investment, not an expense"</p>
        <div className="cta-buttons">
          <Link to="/login" className="cta-btn cta-btn-primary">Get Started Free <span className="btn-arrow">→</span></Link>
          <Link to="/about" className="cta-btn cta-btn-secondary">Learn More</Link>
        </div>
      </div>
      <button className="music-button" onClick={toggleMusic} aria-label="Toggle music">
        {playing ? "⏸" : "▶"}
      </button>
      <audio ref={audioRef} src={musicFile} loop />
    </div>
  );
}