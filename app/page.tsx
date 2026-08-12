"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignInLanding() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    
    // Mock authentication delay
    setTimeout(() => {
      router.push("/dashboard");
    }, 1200);
  };

  return (
    <main className="premium-landing">
      {/* Dynamic Background Elements */}
      <div className="mesh-bg"></div>
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>

      <div className="premium-landing__content">
        <header className="premium-landing__header">
          <div className="logo-lockup">
            <span className="logo-mark">P</span>
            <span className="logo-text">PW <b>Twin</b></span>
          </div>
        </header>

        <section className="premium-landing__hero">
          <h1 className="hero-title">
            Unlock the <span className="highlight-text">Digital Twin</span>
          </h1>
          <p className="hero-subtitle">
            Experience the future of printed modules. Sign in to access your digital companion, AI doubt resolution, and step-by-step interactive solutions.
          </p>
        </section>

        <div className="auth-card-wrapper">
          <form className="auth-card" onSubmit={handleSignIn}>
            <div className="auth-card__header">
              <h2>Welcome Back</h2>
              <p>Enter your credentials to continue</p>
            </div>

            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className={`btn-primary ${isAuthenticating ? 'loading' : ''}`}
              disabled={isAuthenticating}
            >
              <span className="btn-text">
                {isAuthenticating ? 'Authenticating...' : 'Sign In'}
              </span>
              {!isAuthenticating && <span className="btn-icon">→</span>}
            </button>
            
            <p className="auth-card__footer">
              Publishing these books? <Link href="/publisher">Publisher portal</Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
