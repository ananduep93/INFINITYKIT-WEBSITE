const fs = require('fs');
let css = fs.readFileSync('app.css', 'utf8');

css += `
/* Navbar sizing */
.navbar {
    padding: 8px 20px !important;
}

/* Nav Dropdown */
.nav-dropdown {
    position: relative;
    display: inline-block;
}

.mega-menu {
    display: none;
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: white;
    border: 1px solid var(--glass-border);
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    min-width: 400px;
}

.nav-dropdown.active .mega-menu {
    display: block;
}

.nav-dropdown-toggle {
    display: flex;
    align-items: center;
    gap: 5px;
}

.nav-dropdown-toggle span {
    transition: transform 0.3s ease;
}

.nav-dropdown.active .nav-dropdown-toggle span {
    transform: rotate(180deg);
}

.mega-menu-content {
    display: flex;
    gap: 30px;
}

.mega-menu-column {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.mega-menu-column h4 {
    margin: 0 0 10px 0;
    color: var(--text-color);
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    border-bottom: 1px solid var(--glass-border);
    padding-bottom: 5px;
}

.mega-menu-column a {
    color: var(--text-secondary);
    text-decoration: none;
    font-size: 0.95rem;
    transition: color 0.2s;
    padding: 5px 0;
}

.mega-menu-column a:hover {
    color: var(--primary-color);
}
`;

fs.writeFileSync('app.css', css);
