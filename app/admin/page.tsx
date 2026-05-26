'use client';

import React, { useState, useEffect } from 'react';
import { auth, db, googleProvider } from '../../lib/firebase';
import { signInWithPopup, onAuthStateChanged, signOut, User, signInWithEmailAndPassword } from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  serverTimestamp, 
  getDoc,
  limit
} from 'firebase/firestore';
import { 
  ShieldAlert, 
  LogOut, 
  PlusCircle, 
  Trash2, 
  FileText, 
  Image as ImageIcon, 
  TrendingUp, 
  Layers, 
  ExternalLink,
  CheckCircle,
  Settings
} from 'lucide-react';

interface UpdateItem {
  id: string;
  message: string;
  timestamp: any;
}

interface AffiliateItem {
  id: string;
  title: string;
  affiliateLink: string;
  mediaLink: string;
}

interface PromptItem {
  id: string;
  category: string;
  imageUrl: string;
  prompt: string;
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'updates' | 'affiliates' | 'prompts'>('updates');

  // Credentials input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Input states
  const [updateMsg, setUpdateMsg] = useState('');
  const [productTitle, setProductTitle] = useState('');
  const [affiliateLink, setAffiliateLink] = useState('');
  const [mediaLink, setMediaLink] = useState('');
  const [promptCategory, setPromptCategory] = useState('men');
  const [promptText, setPromptText] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  // Status lists
  const [updates, setUpdates] = useState<UpdateItem[]>([]);
  const [affiliates, setAffiliates] = useState<AffiliateItem[]>([]);
  const [prompts, setPromptItem] = useState<PromptItem[]>([]);

  // Action loading states
  const [actionLoading, setActionLoading] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Check auth persistence
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setAuthLoading(true);
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists() && userDoc.data().role === 'admin') {
            setUser(currentUser);
            setIsAdmin(true);
            fetchAdminData();
          } else if (currentUser.email === 'admin@infinitykit.com' || currentUser.email === 'ananduep93@gmail.com') {
            setUser(currentUser);
            setIsAdmin(true);
            fetchAdminData();
          } else {
            setUser(null);
            setIsAdmin(false);
          }
        } catch (e) {
          console.error("Error verifying admin role:", e);
          setUser(null);
          setIsAdmin(false);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch collections
  const fetchAdminData = async () => {
    try {
      // 1. Fetch updates
      const uSnap = await getDocs(query(collection(db, 'updates'), orderBy('timestamp', 'desc'), limit(15)));
      const uList: UpdateItem[] = [];
      uSnap.forEach(d => {
        uList.push({ id: d.id, message: d.data().message || '', timestamp: d.data().timestamp });
      });
      setUpdates(uList);

      // 2. Fetch affiliate ads
      const aSnap = await getDocs(query(collection(db, 'affiliateAds'), limit(15)));
      const aList: AffiliateItem[] = [];
      aSnap.forEach(d => {
        aList.push({ 
          id: d.id, 
          title: d.data().title || '', 
          affiliateLink: d.data().affiliateLink || '',
          mediaLink: d.data().mediaLink || ''
        });
      });
      setAffiliates(aList);

      // 3. Fetch AI Prompts
      const pSnap = await getDocs(query(collection(db, 'aiPrompts'), limit(15)));
      const pList: PromptItem[] = [];
      pSnap.forEach(d => {
        pList.push({
          id: d.id,
          category: d.data().category || 'men',
          imageUrl: d.data().imageUrl || '',
          prompt: d.data().prompt || ''
        });
      });
      setPromptItem(pList);
    } catch (err) {
      console.error("Error loading admin collections:", err);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      let result;
      try {
        result = await signInWithPopup(auth, googleProvider);
      } catch (popupError: any) {
        console.warn("Popup blocked or failed, trying redirect fallback...", popupError);
        if (
          popupError.code === 'auth/popup-blocked' ||
          popupError.code === 'auth/popup-closed-by-user' ||
          /Android|iPhone|iPad/i.test(navigator.userAgent)
        ) {
          const { signInWithRedirect } = await import('firebase/auth');
          await signInWithRedirect(auth, googleProvider);
          return;
        } else {
          throw popupError;
        }
      }

      if (!result) return;
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if ((userDoc.exists() && userDoc.data().role === 'admin') || result.user.email === 'admin@infinitykit.com' || result.user.email === 'ananduep93@gmail.com') {
        setUser(result.user);
        setIsAdmin(true);
        fetchAdminData();
      } else {
        await signOut(auth);
        alert("Access Denied: You do not possess administrator rights.");
      }
    } catch (e: any) {
      console.error("Authentication failed:", e);
      if (e.code === 'auth/unauthorized-domain') {
        alert("🔒 Firebase Domain Unauthorized:\n\nYou must add 'infinitykit.online' and 'www.infinitykit.online' to your Firebase Console under 'Authentication' -> 'Settings' -> 'Authorized Domains'.\n\nGoogle OAuth will fail on custom domains until whitelisted in Firebase!");
      } else {
        alert(`Sign in failed: ${e.message || e}`);
      }
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setLoginLoading(true);
    setLoginError(null);
    try {
      const result = await signInWithEmailAndPassword(auth, email.trim(), password);
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if ((userDoc.exists() && userDoc.data().role === 'admin') || result.user.email === 'admin@infinitykit.com' || result.user.email === 'ananduep93@gmail.com') {
        setUser(result.user);
        setIsAdmin(true);
        fetchAdminData();
      } else {
        await signOut(auth);
        setLoginError("Access Denied: You do not possess administrator rights.");
      }
    } catch (err: any) {
      console.error("Credentials sign in failed:", err);
      let errMsg = "Authentication credentials rejected.";
      if (err.code === 'auth/user-not-found') errMsg = "Admin account not found.";
      else if (err.code === 'auth/wrong-password') errMsg = "Incorrect password.";
      else if (err.message) errMsg = err.message;
      setLoginError(errMsg);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setIsAdmin(false);
  };

  // Helper function to compress image to Base64
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event: any) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 600;
          const MAX_HEIGHT = 600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
            resolve(compressedBase64);
          } else {
            reject(new Error("Canvas context error"));
          }
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  // CRUD handlers
  const handlePostUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateMsg.trim()) return;

    setActionLoading(true);
    try {
      await addDoc(collection(db, 'updates'), {
        message: updateMsg.trim(),
        timestamp: serverTimestamp()
      });
      setUpdateMsg('');
      triggerToast("Update posted successfully! ✨");
      fetchAdminData();
    } catch (err) {
      console.error(err);
      alert("Fail to add update. Check rules configuration.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddAffiliate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productTitle || !affiliateLink || !mediaLink) return;

    setActionLoading(true);
    try {
      await addDoc(collection(db, 'affiliateAds'), {
        title: productTitle.trim(),
        affiliateLink: affiliateLink.trim(),
        mediaLink: mediaLink.trim(),
        timestamp: serverTimestamp()
      });
      setProductTitle('');
      setAffiliateLink('');
      setMediaLink('');
      triggerToast("Product advertisement added! 🎁");
      fetchAdminData();
    } catch (err) {
      console.error(err);
      alert("Error adding product. Check authorization.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUploadPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText || !selectedImage) {
      alert("Both base64 image and prompt string are required.");
      return;
    }

    setActionLoading(true);
    try {
      const base64Image = await compressImage(selectedImage);
      await addDoc(collection(db, 'aiPrompts'), {
        category: promptCategory,
        imageUrl: base64Image,
        prompt: promptText.trim(),
        timestamp: serverTimestamp()
      });
      setPromptText('');
      setSelectedImage(null);
      triggerToast("AI Prompt card uploaded! 🎨");
      fetchAdminData();
    } catch (err) {
      console.error(err);
      alert("Error uploading AI prompt");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteItem = async (col: string, id: string) => {
    if (!confirm("Are you absolutely sure you want to delete this item?")) return;
    try {
      await deleteDoc(doc(db, col, id));
      triggerToast("Deleted item from database.");
      fetchAdminData();
    } catch (err) {
      console.error(err);
      alert("Failed to delete. Check rules configuration.");
    }
  };

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  if (authLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '80vh', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid var(--glass-border)',
          borderTopColor: 'var(--primary-color)',
          borderRadius: '50%',
          animation: 'admin-spin 0.75s linear infinite'
        }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading Admin Workspace Session...</p>
        <style jsx>{`@keyframes admin-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Not Logged in or Not Admin
  if (!isAdmin) {
    return (
      <div style={{ maxWidth: '450px', margin: '100px auto 60px', padding: '0 20px' }}>
        <div className="glass-panel" style={{
          padding: '40px 30px',
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--card-radius)',
          textAlign: 'center',
          boxShadow: '0 20px 50px rgba(0,0,0,0.25)'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: 'rgba(0, 161, 155, 0.08)',
            color: 'var(--primary-color)',
            borderRadius: '50%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px'
          }}>
            <ShieldAlert size={28} />
          </div>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.7rem', fontWeight: 800, margin: '0 0 10px', color: 'var(--text-color)' }}>
            Admin Credentials Required
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '25px' }}>
            This system zone is highly protected. To perform database operations, please verify your credentials.
          </p>

          {/* Email / Password credentials form fallback */}
          <form onSubmit={handleEmailLogin} style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Admin Email Address</label>
              <input
                type="email"
                placeholder="admin@infinitykit.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '30px',
                  border: '1px solid var(--glass-border)',
                  background: 'rgba(0,0,0,0.15)',
                  color: 'var(--text-color)',
                  outline: 'none',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '30px',
                  border: '1px solid var(--glass-border)',
                  background: 'rgba(0,0,0,0.15)',
                  color: 'var(--text-color)',
                  outline: 'none',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s'
                }}
              />
            </div>

            {loginError && (
              <div style={{
                backgroundColor: 'rgba(234, 67, 53, 0.08)',
                border: '1px solid rgba(234, 67, 53, 0.15)',
                color: '#EA4335',
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '0.8rem',
                fontWeight: 600,
                lineHeight: 1.4
              }}>
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #00A19B 0%, #00d2c7 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '30px',
                padding: '12px 24px',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(0, 161, 155, 0.15)',
                transition: 'all 0.2s',
                marginTop: '5px'
              }}
            >
              {loginLoading ? 'Authenticating...' : 'Sign in as Administrator'}
            </button>
          </form>

          {/* Separator line */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '20px' }}>
            <span style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></span>
            <span>or single sign-on</span>
            <span style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></span>
          </div>

          <button
            onClick={handleGoogleLogin}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              backgroundColor: 'white',
              border: '1px solid #ddd',
              color: '#333',
              borderRadius: '30px',
              padding: '12px 24px',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f8f8'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
          >
            <svg style={{ width: '18px', height: '18px' }} viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1c-4.3 0-8.01 2.47-9.82 6.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Verify with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '40px auto 80px', padding: '0 24px' }}>
      
      {/* Toast Alert */}
      {successToast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          background: 'rgba(0,161,155,0.95)',
          color: 'white',
          padding: '14px 24px',
          borderRadius: '12px',
          boxShadow: '0 8px 30px rgba(0,161,155,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 600,
          fontSize: '0.9rem',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)',
          animation: 'admin-slide-in 0.3s ease'
        }}>
          <CheckCircle size={18} />
          <span>{successToast}</span>
          <style jsx>{`
            @keyframes admin-slide-in {
              from { transform: translateX(30px); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
          `}</style>
        </div>
      )}

      {/* Admin Header */}
      <header className="glass-panel" style={{
        margin: '0 0 30px 0',
        padding: '24px 30px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '2.2rem', background: 'rgba(0,161,155,0.08)', width: '56px', height: '56px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            👑
          </span>
          <div>
            <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800, margin: 0, color: 'var(--text-color)' }}>
              InfinityKit Command Center
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '3px', margin: '3px 0 0 0' }}>
              Logged in as: <strong style={{ color: 'var(--text-color)' }}>{user?.email}</strong>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <a
            href="/admin/tool-tester"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(0, 161, 155, 0.08)',
              border: '1px solid rgba(0, 161, 155, 0.2)',
              color: 'var(--primary-color)',
              padding: '10px 20px',
              borderRadius: '30px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              textDecoration: 'none',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 161, 155, 0.15)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 161, 155, 0.08)'}
          >
            <Settings size={14} /> Open Tool Tester
          </a>

          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(234, 67, 53, 0.08)',
              border: '1px solid rgba(234, 67, 53, 0.2)',
              color: '#EA4335',
              padding: '10px 20px',
              borderRadius: '30px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(234, 67, 53, 0.15)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(234, 67, 53, 0.08)'}
          >
            <LogOut size={14} /> Exit Admin Session
          </button>
        </div>
      </header>

      {/* Tabs Menu */}
      <nav style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
        <button
          onClick={() => setActiveTab('updates')}
          style={{
            background: activeTab === 'updates' ? 'rgba(0,161,155,0.08)' : 'none',
            border: 'none',
            color: activeTab === 'updates' ? 'var(--primary-color)' : 'var(--text-secondary)',
            fontWeight: 700,
            padding: '10px 20px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
        >
          <FileText size={16} /> Changelog Updates
        </button>
        <button
          onClick={() => setActiveTab('affiliates')}
          style={{
            background: activeTab === 'affiliates' ? 'rgba(0,161,155,0.08)' : 'none',
            border: 'none',
            color: activeTab === 'affiliates' ? 'var(--primary-color)' : 'var(--text-secondary)',
            fontWeight: 700,
            padding: '10px 20px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
        >
          <TrendingUp size={16} /> Affiliate Ads
        </button>
        <button
          onClick={() => setActiveTab('prompts')}
          style={{
            background: activeTab === 'prompts' ? 'rgba(0,161,155,0.08)' : 'none',
            border: 'none',
            color: activeTab === 'prompts' ? 'var(--primary-color)' : 'var(--text-secondary)',
            fontWeight: 700,
            padding: '10px 20px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
        >
          <Layers size={16} /> AI Prompt Cards
        </button>
      </nav>

      {/* Grid workspace */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', alignItems: 'flex-start' }}>
        
        {/* LEFT COLUMN: Input Forms */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {activeTab === 'updates' && (
            <form onSubmit={handlePostUpdate} className="glass-panel" style={{ margin: 0, padding: '30px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0 }}>
                <PlusCircle size={18} color="var(--primary-color)" /> Post Changelog Update
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Update Log Message</label>
                <textarea
                  className="form-textarea"
                  value={updateMsg}
                  onChange={(e) => setUpdateMsg(e.target.value)}
                  placeholder="e.g. Added high-performance Password Strength Analyzer tool to Utilities section. Syncing fully client-side..."
                  rows={5}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={actionLoading}
                className="btn"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {actionLoading ? 'Uploading...' : 'Post Update ✨'}
              </button>
            </form>
          )}

          {activeTab === 'affiliates' && (
            <form onSubmit={handleAddAffiliate} className="glass-panel" style={{ margin: 0, padding: '30px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0 }}>
                <PlusCircle size={18} color="var(--primary-color)" /> Add Affiliate Product Ad
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Product Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={productTitle}
                    onChange={(e) => setProductTitle(e.target.value)}
                    placeholder="e.g. Best Dual-Mode Screen Monitor Stand"
                    required
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Affiliate Buy Link</label>
                  <input
                    type="url"
                    className="form-input"
                    value={affiliateLink}
                    onChange={(e) => setAffiliateLink(e.target.value)}
                    placeholder="https://amazon.com/dp/..."
                    required
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Media Image URL</label>
                  <input
                    type="url"
                    className="form-input"
                    value={mediaLink}
                    onChange={(e) => setMediaLink(e.target.value)}
                    placeholder="https://images-na.ssl-images-amazon.com/..."
                    required
                  />
                </div>

              </div>
              <button
                type="submit"
                disabled={actionLoading}
                className="btn"
                style={{ width: '100%', marginTop: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {actionLoading ? 'Saving...' : 'Add Product 🎁'}
              </button>
            </form>
          )}

          {activeTab === 'prompts' && (
            <form onSubmit={handleUploadPrompt} className="glass-panel" style={{ margin: 0, padding: '30px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0 }}>
                <PlusCircle size={18} color="var(--primary-color)" /> Add AI Prompt Card
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Model Category</label>
                  <select
                    className="form-select"
                    value={promptCategory}
                    onChange={(e) => setPromptCategory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid var(--glass-border)',
                      background: 'var(--glass-bg)',
                      color: 'var(--text-color)',
                      outline: 'none'
                    }}
                  >
                    <option value="men" style={{ background: 'var(--bg-color)', color: 'var(--text-color)' }}>Men Prompts</option>
                    <option value="women" style={{ background: 'var(--bg-color)', color: 'var(--text-color)' }}>Women Prompts</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Prompt Specifications</label>
                  <textarea
                    className="form-textarea"
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    placeholder="e.g. Ultra high quality studio shot of a professional developer coding in absolute focus, futuristic vibe..."
                    rows={4}
                    required
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <ImageIcon size={14} /> Upload Mock Image File
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setSelectedImage(e.target.files[0]);
                      }
                    }}
                    style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}
                    required
                  />
                </div>

              </div>
              <button
                type="submit"
                disabled={actionLoading}
                className="btn"
                style={{ width: '100%', marginTop: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {actionLoading ? 'Compressing & Saving...' : 'Upload Prompt 🎨'}
              </button>
            </form>
          )}

        </div>

        {/* RIGHT COLUMN: Database Listing */}
        <div className="glass-panel" style={{ margin: 0, padding: '30px', maxHeight: '600px', overflowY: 'auto' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginTop: 0 }}>
            <span>Database Items ({
              activeTab === 'updates' ? updates.length :
              activeTab === 'affiliates' ? affiliates.length : prompts.length
            })</span>
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            {activeTab === 'updates' && (
              updates.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', padding: '30px 0' }}>No updates logged.</p>
              ) : (
                updates.map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '15px', padding: '15px', border: '1px solid var(--glass-border)', borderRadius: '12px', background: 'rgba(255,255,255,0.01)' }}>
                    <div style={{ flex: 1, fontSize: '0.85rem', lineHeight: 1.5 }}>
                      <p style={{ color: 'var(--text-color)', margin: 0, whiteSpace: 'pre-wrap' }}>{item.message}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteItem('updates', item.id)}
                      style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', padding: '4px', alignSelf: 'flex-start' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )
            )}

            {activeTab === 'affiliates' && (
              affiliates.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', padding: '30px 0' }}>No affiliate products listed.</p>
              ) : (
                affiliates.map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '15px', padding: '15px', border: '1px solid var(--glass-border)', borderRadius: '12px', background: 'rgba(255,255,255,0.01)' }}>
                    <div style={{ flex: 1, display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <img src={item.mediaLink} alt="Ad Thumbnail" style={{ width: '45px', height: '45px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--glass-border)', flexShrink: 0 }} />
                      <div style={{ overflow: 'hidden' }}>
                        <h4 style={{ fontSize: '0.85rem', margin: 0, fontWeight: 700, color: 'var(--text-color)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</h4>
                        <a href={item.affiliateLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: 'var(--primary-color)', display: 'inline-flex', alignItems: 'center', gap: '3px', marginTop: '3px', textDecoration: 'none' }}>
                          Product Page <ExternalLink size={10} />
                        </a>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteItem('affiliateAds', item.id)}
                      style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', padding: '4px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )
            )}

            {activeTab === 'prompts' && (
              prompts.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', padding: '30px 0' }}>No AI Prompts uploaded.</p>
              ) : (
                prompts.map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '15px', padding: '15px', border: '1px solid var(--glass-border)', borderRadius: '12px', background: 'rgba(255,255,255,0.01)' }}>
                    <div style={{ flex: 1, display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <img src={item.imageUrl} alt="AI Prompt Mock" style={{ width: '45px', height: '45px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--glass-border)', flexShrink: 0 }} />
                      <div style={{ overflow: 'hidden' }}>
                        <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--primary-color)', fontWeight: 700 }}>{item.category} model</span>
                        <p style={{ fontSize: '0.8rem', margin: '2px 0 0 0', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.prompt}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteItem('aiPrompts', item.id)}
                      style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', padding: '4px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
