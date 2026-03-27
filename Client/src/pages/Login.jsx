import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi, setAuthSession } from '../services/api';
import './login.css';

export default function Login() {
  const location = useLocation();
  const [isActive, setIsActive] = useState(location.state?.signup === true);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', email: '', phone: '', password: '', role: 'passenger' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await authApi.login(loginData);
      const authData = response?.data || {};
      setAuthSession({ token: authData.token, user: authData.user });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.register(registerData);
      setIsActive(false);
    } catch (err) {
      setError(err.message || 'Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login_center_wrapper">
      <div className={`login_main_page${isActive ? ' active' : ''}`}>
        <div className="curved-shape"></div>
        <div className="curved-shape2"></div>

        <div className="form-side login">
          <h2 className="animation" style={{ '--D': 0, '--S': 21 }}>Login</h2>
          <form onSubmit={handleLogin}>
            <div className="input-box animation" style={{ '--D': 1, '--S': 22 }}>
              <input
                type="email"
                required
                value={loginData.email}
                onChange={e => setLoginData({ ...loginData, email: e.target.value })}
              />
              <label>Email</label>
              <i className="bx bx-envelope"></i>
            </div>
            <div className="input-box animation" style={{ '--D': 2, '--S': 23 }}>
              <input
                type="password"
                required
                value={loginData.password}
                onChange={e => setLoginData({ ...loginData, password: e.target.value })}
              />
              <label>Password</label>
              <i className="bx bx-lock"></i>
            </div>
            {error && !isActive && <p className="error-msg">{error}</p>}
            <div className="input-box animation" style={{ '--D': 3, '--S': 24 }}>
              <button className="btn" type="submit" disabled={loading}>{loading ? 'Please wait...' : 'Login'}</button>
            </div>
            <div className="regi-link animation" style={{ '--D': 4, '--S': 25 }}>
              <p>
                Dont have an account ?{' '}
                <a href="#" onClick={e => { e.preventDefault(); setIsActive(true); setError(''); }}>
                  Sign up
                </a>
              </p>
            </div>
          </form>
        </div>

        <div className="login-text-side login">
          <h1 className="animation" style={{ '--D': 0, '--S': 20 }}>Welcome Back!</h1>
          <p className="animation" style={{ '--D': 1, '--S': 21 }}>Your journey, just one click away</p>
        </div>

        <div className="form-side Register">
          <h2 className="animation" style={{ '--li': 17, '--S': 0, paddingLeft: '60px' }}>
            Register
          </h2>
          <form onSubmit={handleRegister}>
            <div className="input-box animation" style={{ '--li': 18, '--S': 1 }}>
              <input
                type="text"
                required
                value={registerData.name}
                onChange={e => setRegisterData({ ...registerData, name: e.target.value })}
              />
              <label>Full Name</label>
              <i className="bx bx-user"></i>
            </div>
            <div className="input-box animation" style={{ '--li': 18, '--S': 1 }}>
              <input
                type="tel"
                required
                value={registerData.phone}
                onChange={e => setRegisterData({ ...registerData, phone: e.target.value })}
              />
              <label>Phone Number</label>
              <i className="bx bx-phone"></i>
            </div>
            <div className="input-box animation" style={{ '--li': 18, '--S': 1 }}>
              <input
                type="email"
                required
                value={registerData.email}
                onChange={e => setRegisterData({ ...registerData, email: e.target.value })}
              />
              <label>Email</label>
              <i className="bx bx-envelope"></i>
            </div>
            <div className="input-box animation" style={{ '--li': 19, '--S': 2 }}>
              <input
                type="password"
                required
                value={registerData.password}
                onChange={e => setRegisterData({ ...registerData, password: e.target.value })}
              />
              <label>Password</label>
              <i className="bx bx-lock"></i>
            </div>
            {error && isActive && <p className="error-msg">{error}</p>}
            <div className="input-box animation" style={{ '--li': 20, '--S': 3 }}>
              <button className="btn" type="submit" disabled={loading}>{loading ? 'Please wait...' : 'Register'}</button>
            </div>
            <div className="regi-link animation" style={{ '--li': 21, '--S': 4 }}>
              <p>
                Already have an account ?{' '}
                <a href="#" onClick={e => { e.preventDefault(); setIsActive(false); setError(''); }}>
                  Sign In
                </a>
              </p>
            </div>
          </form>
        </div>

        <div className="login-text-side Register">
          <h1 className="animation" style={{ '--li': 22, '--S': 0 }}>Welcome</h1>
          <h2 className="animation" style={{ '--li': 23, '--S': 1 }}>To</h2>
          <h3 className="animation" style={{ '--li': 24, '--S': 2 }}>Hamro Sawari</h3>
          <p className="animation" style={{ '--li': 25, '--S': 3 }}>Your journey, just one click away</p>
        </div>

      </div>
    </div>
  );
}
