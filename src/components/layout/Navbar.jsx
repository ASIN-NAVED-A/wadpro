import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Briefcase,
  Menu,
  X,
  User,
  LogOut,
  Sparkles,
  Search,
  PlusCircle,
  FileCheck2,
  Users,
  Building,
  LayoutDashboard,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';

export default function Navbar() {
  const { user, role, isAuthenticated, logout, switchDemoRole } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close menus on route navigation
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  // Click outside listener for user menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    fontSize: '14px',
    fontWeight: isActive ? 600 : 500,
    color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
    backgroundColor: isActive ? 'var(--color-primary-soft)' : 'transparent',
    borderRadius: 'var(--radius-md)',
    transition: 'all var(--transition-fast)',
    textDecoration: 'none',
  });

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '68px',
        }}
      >
        {/* Brand Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
            color: 'var(--color-text-primary)',
            fontWeight: 700,
            fontSize: '18px',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Briefcase size={20} />
          </div>
          <span style={{ letterSpacing: '-0.02em' }}>
            Smart<span style={{ color: 'var(--color-primary)' }}>JobPortal</span>
          </span>
        </Link>

        {/* Desktop Nav Items */}
        <nav
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '6px',
          }}
          className="desktop-nav"
        >
          {!isAuthenticated ? (
            <>
              <NavLink to="/jobs" style={navLinkStyle}>
                <Search size={16} />
                <span>Find Jobs</span>
              </NavLink>
            </>
          ) : role === 'employer' ? (
            <>
              <NavLink to="/employer/dashboard" style={navLinkStyle}>
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </NavLink>
              <NavLink to="/employer/jobs/create" style={navLinkStyle}>
                <PlusCircle size={16} />
                <span>Post a Job</span>
              </NavLink>
              <NavLink to="/employer/jobs" style={navLinkStyle}>
                <Briefcase size={16} />
                <span>Manage Jobs</span>
              </NavLink>
              <NavLink to="/employer/applicants" style={navLinkStyle}>
                <Users size={16} />
                <span>Applicants</span>
              </NavLink>
              <NavLink to="/employer/profile" style={navLinkStyle}>
                <Building size={16} />
                <span>Company Profile</span>
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/employee/dashboard" style={navLinkStyle}>
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </NavLink>
              <NavLink to="/jobs" style={navLinkStyle}>
                <Search size={16} />
                <span>Find Jobs</span>
              </NavLink>
              <NavLink to="/employee/recommendations" style={navLinkStyle}>
                <Sparkles size={16} />
                <span>Recommendations</span>
              </NavLink>
              <NavLink to="/employee/applications" style={navLinkStyle}>
                <FileCheck2 size={16} />
                <span>My Applications</span>
              </NavLink>
              <NavLink to="/employee/profile" style={navLinkStyle}>
                <User size={16} />
                <span>Profile</span>
              </NavLink>
            </>
          )}
        </nav>

        {/* Desktop Right Actions & User Menu */}
        <div style={{ display: 'none', alignItems: 'center', gap: '12px' }} className="desktop-nav">
          {!isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link to="/login" className="btn btn-ghost">
                Sign in
              </Link>
              <Link to="/register" className="btn btn-primary">
                Get Started
              </Link>
            </div>
          ) : (
            <div style={{ position: 'relative' }} ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'transparent',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-full)',
                  padding: '4px 12px 4px 6px',
                  cursor: 'pointer',
                  minHeight: '40px',
                }}
              >
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary-soft)',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    fontSize: '13px',
                  }}
                >
                  {(user?.fullName || user?.name || 'U').charAt(0).toUpperCase()}
                </div>
                <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {user?.fullName?.split(' ')[0] || user?.name || 'Account'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                    {role}
                  </div>
                </div>
                <ChevronDown size={14} color="var(--color-text-muted)" />
              </button>

              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '240px',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    padding: '6px',
                    zIndex: 200,
                  }}
                >
                  <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--color-border)', marginBottom: '4px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {user?.fullName || user?.name}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user?.email}
                    </div>
                  </div>

                  <Link
                    to={role === 'employer' ? '/employer/profile' : '/employee/profile'}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      fontSize: '13px',
                      color: 'var(--color-text-primary)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                    className="dropdown-item"
                  >
                    <User size={15} />
                    <span>My Profile</span>
                  </Link>

                  <div
                    style={{
                      padding: '6px 10px',
                      fontSize: '11px',
                      color: 'var(--color-text-muted)',
                      borderTop: '1px solid var(--color-border)',
                      marginTop: '4px',
                    }}
                  >
                    Switch Demo Role:
                    <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                      <button
                        type="button"
                        onClick={() => switchDemoRole('employee')}
                        className={`btn btn-sm ${role === 'employee' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '2px 8px', fontSize: '11px', minHeight: '26px' }}
                      >
                        Employee
                      </button>
                      <button
                        type="button"
                        onClick={() => switchDemoRole('employer')}
                        className={`btn btn-sm ${role === 'employer' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '2px 8px', fontSize: '11px', minHeight: '26px' }}
                      >
                        Employer
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      fontSize: '13px',
                      color: 'var(--color-danger)',
                      background: 'transparent',
                      border: 'none',
                      width: '100%',
                      cursor: 'pointer',
                      borderRadius: 'var(--radius-sm)',
                      textAlign: 'left',
                      marginTop: '4px',
                      borderTop: '1px solid var(--color-border)',
                    }}
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="mobile-toggle"
          aria-label={mobileOpen ? 'Close navigation drawer' : 'Open navigation drawer'}
          aria-expanded={mobileOpen}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '44px',
            height: '44px',
            background: 'transparent',
            border: 'none',
            color: 'var(--color-text-primary)',
            cursor: 'pointer',
          }}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer (Slide-in) */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            top: '68px',
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            zIndex: 99,
          }}
          onClick={() => setMobileOpen(false)}
        >
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              width: '280px',
              height: '100%',
              padding: '20px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: 'var(--shadow-lg)',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {isAuthenticated && (
              <div
                style={{
                  paddingBottom: '12px',
                  borderBottom: '1px solid var(--color-border)',
                  marginBottom: '6px',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '15px' }}>{user?.fullName || user?.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Signed in as {role}</div>
              </div>
            )}

            {!isAuthenticated ? (
              <>
                <NavLink to="/jobs" style={navLinkStyle}>
                  <Search size={18} />
                  <span>Find Jobs</span>
                </NavLink>
                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Link to="/login" className="btn btn-secondary" style={{ width: '100%' }}>
                    Sign in
                  </Link>
                  <Link to="/register" className="btn btn-primary" style={{ width: '100%' }}>
                    Get Started
                  </Link>
                </div>
              </>
            ) : role === 'employer' ? (
              <>
                <NavLink to="/employer/dashboard" style={navLinkStyle}>
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </NavLink>
                <NavLink to="/employer/jobs/create" style={navLinkStyle}>
                  <PlusCircle size={18} />
                  <span>Post a Job</span>
                </NavLink>
                <NavLink to="/employer/jobs" style={navLinkStyle}>
                  <Briefcase size={18} />
                  <span>Manage Jobs</span>
                </NavLink>
                <NavLink to="/employer/applicants" style={navLinkStyle}>
                  <Users size={18} />
                  <span>Applicants</span>
                </NavLink>
                <NavLink to="/employer/profile" style={navLinkStyle}>
                  <Building size={18} />
                  <span>Company Profile</span>
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to="/employee/dashboard" style={navLinkStyle}>
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </NavLink>
                <NavLink to="/jobs" style={navLinkStyle}>
                  <Search size={18} />
                  <span>Find Jobs</span>
                </NavLink>
                <NavLink to="/employee/recommendations" style={navLinkStyle}>
                  <Sparkles size={18} />
                  <span>Recommendations</span>
                </NavLink>
                <NavLink to="/employee/applications" style={navLinkStyle}>
                  <FileCheck2 size={18} />
                  <span>My Applications</span>
                </NavLink>
                <NavLink to="/employee/profile" style={navLinkStyle}>
                  <User size={18} />
                  <span>My Profile</span>
                </NavLink>
              </>
            )}

            {isAuthenticated && (
              <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn btn-secondary"
                  style={{ width: '100%', color: 'var(--color-danger)' }}
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Media query helper styles */}
      <style>{`
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
          .mobile-toggle { display: none !important; }
        }
        .dropdown-item:hover {
          background-color: var(--color-surface-hover);
        }
      `}</style>
    </header>
  );
}
