import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Search, ShoppingCart, User, Menu, X, Package, Calendar, LogOut, BarChart3, Home, Info, Phone, Bot, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Header: React.FC = () => {
    const { user, logout } = useAuth();
    const { getTotalItems } = useCart();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const navLinks = [
        { to: "/", icon: <Home />, title: "Trang chủ" },
        { to: "/products", icon: <Package />, title: "Sản phẩm" },
        { to: "/health-news", icon: <Info />, title: "Tin tức sức khỏe" }, // Add Health News link
        { to: "/about", icon: <Info />, title: "Giới thiệu" },
        { to: "/contact", icon: <Phone />, title: "Liên hệ" }
    ];

    const userLinks = [
        { to: "/account", icon: <User />, title: "Tài khoản" },
        { to: "/account?tab=orders", icon: <Package />, title: "Đơn hàng" },
        { to: "/account?tab=appointments", icon: <Calendar />, title: "Lịch hẹn" }
    ];

    if (user?.userType === 'admin') {
        userLinks.splice(1, 0, { to: "/admin", icon: <BarChart3 />, title: "Admin Dashboard" });
    }
    if (user?.userType === 'pharmacist') {
        userLinks.splice(1, 0, { to: "/pharmacist", icon: <Bot />, title: "Pharmacist Dashboard" });
    }

    return (
        <StyledHeader>
            <div className="header-container">
                <Link to="/" className="logo">
                    <div className="logo-icon">HC</div>
                    <span className="logo-text">HealthCare</span>
                </Link>

                <div className="search-wrapper">
                    <form onSubmit={handleSearch} className="search-form">
                        <Search className="search-icon" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                    </form>
                </div>
                
                <div className="menu">
                    {navLinks.map(link => (
                        <Link to={link.to} key={link.to} className="link">
                            <span className="link-icon">{link.icon}</span>
                            <span className="link-title">{link.title}</span>
                        </Link>
                    ))}
                </div>


                <div className="user-actions">
                    <Link to="/cart" className="link cart-link">
                        <span className="link-icon"><ShoppingCart /></span>
                        <span className="link-title">Giỏ hàng</span>
                        {getTotalItems() > 0 && <span className="cart-badge">{getTotalItems()}</span>}
                    </Link>

                    {user ? (
                        <div className="user-menu">
                            <div className="link" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                                <span className="link-icon"><User /></span>
                                <span className="link-title">{user.userName || user.email}</span>
                            </div>
                            {isMenuOpen && (
                                <div className="dropdown-menu">
                                    {userLinks.map(link => (
                                        <Link to={link.to} key={link.to} className="dropdown-link" onClick={() => setIsMenuOpen(false)}>
                                            {link.icon}<span>{link.title}</span>
                                        </Link>
                                    ))}
                                    <button onClick={handleLogout} className="dropdown-link logout">
                                        <LogOut /><span>Đăng xuất</span>
                                    </button>
                                </div>
                            )}
                        </div>

                    ) : (
                        <>
                            <Link to="/login" className="link">
                                <span className="link-icon"><User /></span>
                                <span className="link-title">Đăng nhập</span>
                            </Link>
                            <Link to="/register" className="link">
                                <span className="link-icon"><UserPlus /></span>
                                <span className="link-title">Đăng ký</span>
                            </Link>
                        </>
                    )}
                </div>

                <div className="mobile-menu-toggle">
                     <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X/> : <Menu/>}
                    </button>
                </div>
            </div>

            {isMenuOpen && (
                <div className="mobile-menu">
                     <form onSubmit={handleSearch} className="search-form">
                        <Search className="search-icon" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                    </form>
                     {navLinks.map(link => (
                        <Link to={link.to} key={link.to} className="mobile-link" onClick={() => setIsMenuOpen(false)}>
                           {link.icon}<span>{link.title}</span>
                        </Link>
                    ))}
                    <div className="divider" />
                    {user ? userLinks.map(link => (
                        <Link to={link.to} key={link.to} className="mobile-link" onClick={() => setIsMenuOpen(false)}>
                           {link.icon}<span>{link.title}</span>
                        </Link>
                    )) :
                    (<>
                        <Link to="/login" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
                            <User /><span>Đăng nhập</span>
                        </Link>
                        <Link to="/register" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
                            <UserPlus /><span>Đăng ký</span>
                        </Link>
                    </>)}
                     {user && <button onClick={handleLogout} className="mobile-link logout">
                                <LogOut /><span>Đăng xuất</span>
                             </button>}
                </div>
            )}

        </StyledHeader>
    );
};

const StyledHeader = styled.header`
  background-color: #fff;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 50;

  .header-container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 4.5rem;
  }

  .logo {
    display: flex;
    align-items: center;
    text-decoration: none;
    color: inherit;
  }

  .logo-icon {
    width: 2.5rem;
    height: 2.5rem;
    background: linear-gradient(to right, #3b82f6, #16a34a);
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 1rem;
  }

  .logo-text {
    font-size: 1.5rem;
    font-weight: bold;
    margin-left: 0.5rem;
    background: linear-gradient(to right, #3b82f6, #16a34a);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  .search-wrapper {
      flex: 1;
      margin: 0 2rem;
      max-width: 600px;
  }

  .search-form {
      position: relative;
  }

  .search-icon {
      position: absolute;
      left: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      color: #9ca3af;
      width: 1rem;
      height: 1rem;
  }

  .search-input {
      width: 100%;
      padding: 0.5rem 2.5rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      transition: all 0.2s;
      &:focus {
          ring: 2px solid #3b82f6;
          border-color: transparent;
          outline: none;
      }
  }

  .menu {
    padding: 0.5rem;
    background-color: #fff;
    position: relative;
    display: none;
    justify-content: center;
    border-radius: 15px;
    box-shadow: 0 10px 25px 0 rgba(0,0,0, 0.075);

    @media (min-width: 1024px) {
        display: flex;
    }
  }

  .link {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    width: 60px;
    height: 45px;
    border-radius: 8px;
    position: relative;
    z-index: 1;
    overflow: hidden;
    transform-origin: center left;
    transition: width 0.2s ease-in;
    text-decoration: none;
    color: #374151;
    &:before {
      position: absolute;
      z-index: -1;
      content: "";
      display: block;
      border-radius: 8px;
      width: 100%;
      height: 100%;
      top: 0;
      transform: translateX(100%);
      transition: transform 0.2s ease-in;
      transform-origin: center right;
      background-color: #f3f4f6;
    }

    &:hover,
    &:focus {
      outline: 0;
      width: 130px;

      &:before,
      .link-title {
        transform: translateX(0);
        opacity: 1;
      }
    }
  }

  .link-icon {
    width: 24px;
    height: 24px;
    display: block;
    flex-shrink: 0;
    left: 18px;
    position: absolute;
    svg {
      width: 24px;
      height: 24px;
    }
  }

  .link-title {
    transform: translateX(100%);
    transition: transform 0.2s ease-in;
    transform-origin: center right;
    display: block;
    text-align: center;
    text-indent: 20px;
    width: 100%;
    font-size: 0.875rem;
  }
  
  .user-actions {
      display: none;
      align-items: center;
      gap: 0.5rem;
      @media (min-width: 1024px) {
        display: flex;
    }
  }

  .cart-link {
      position: relative;
  }

  .cart-badge {
      position: absolute;
      top: -5px;
      right: -5px;
      background-color: #ef4444;
      color: white;
      font-size: 0.75rem;
      width: 1.25rem;
      height: 1.25rem;
      border-radius: 9999px;
      display: flex;
      align-items: center;
      justify-content: center;
  }

  .user-menu {
      position: relative;
  }
  
  .dropdown-menu {
      position: absolute;
      right: 0;
      margin-top: 0.5rem;
      width: 200px;
      background-color: white;
      border-radius: 0.5rem;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
      border: 1px solid #e5e7eb;
      padding: 0.5rem 0;
      display: flex;
      flex-direction: column;
  }

  .dropdown-link {
      display: flex;
      align-items: center;
      padding: 0.75rem 1rem;
      text-decoration: none;
      color: #374151;
      transition: background-color 0.2s;
      
      svg {
          width: 1rem;
          height: 1rem;
          margin-right: 0.75rem;
      }

      &:hover {
          background-color: #f3f4f6;
      }
  }
   .logout {
       color: #ef4444;
       &:hover {
           background-color: #fee2e2;
       }
   }
   
   .mobile-menu-toggle {
       display: block;
       @media (min-width: 1024px) {
           display: none;
       }
       button {
           background: none;
           border: none;
           cursor: pointer;
           padding: 0.5rem;
           svg {
               width: 1.5rem;
               height: 1.5rem;
           }
       }
   }
    
   .mobile-menu {
       padding: 1rem 0;
       border-top: 1px solid #e5e7eb;
       display: flex;
       flex-direction: column;
       gap: 0.5rem;

       @media (min-width: 1024px) {
           display: none;
       }
        
       .search-form {
           margin-bottom: 1rem;
       }

       .mobile-link {
           display: flex;
           align-items: center;
           padding: 0.75rem 1rem;
           text-decoration: none;
           color: #374151;
            border-radius: 0.5rem;
           transition: background-color 0.2s;
            &:hover {
                background-color: #f3f4f6;
            }
            svg {
                width: 1rem;
                height: 1rem;
                margin-right: 0.75rem;
            }
       }

       .divider {
           height: 1px;
           background: #e5e7eb;
           margin: 0.5rem 0;
       }
   }

`;

export default Header;