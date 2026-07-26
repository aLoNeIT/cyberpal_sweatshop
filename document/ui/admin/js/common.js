/**
 * CyberPal SaaS · Shared JavaScript
 * Handles: theme toggle, sidebar navigation, modal, common utilities
 */
(function() {
  'use strict';

  // ===== Theme Management =====
  const ThemeManager = {
    init() {
      const saved = localStorage.getItem('cyberpal-theme');
      if (saved) {
        document.documentElement.setAttribute('data-theme', saved);
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          document.documentElement.setAttribute('data-theme', 'dark');
        }
      }
      this._bindToggle();
    },

    toggle() {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? '' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('cyberpal-theme', next);
    },

    _bindToggle() {
      document.querySelectorAll('.theme-toggle').forEach(btn => {
        btn.addEventListener('click', () => this.toggle());
      });
    }
  };

  // ===== Sidebar =====
  const Sidebar = {
    init() {
      this._highlightCurrent();
      // Mobile trigger
      const trigger = document.querySelector('.menu-trigger');
      const sidebar = document.querySelector('.app-sidebar');
      if (trigger && sidebar) {
        trigger.addEventListener('click', () => {
          sidebar.classList.toggle('open');
        });
        // Click outside to close
        document.addEventListener('click', (e) => {
          if (!sidebar.contains(e.target) && !trigger.contains(e.target)) {
            sidebar.classList.remove('open');
          }
        });
      }
    },

    _highlightCurrent() {
      const path = window.location.pathname;
      document.querySelectorAll('.nav-item').forEach(item => {
        const href = item.getAttribute('href');
        if (href && path.includes(href.replace(/^\//, ''))) {
          item.classList.add('active');
        }
      });
    }
  };

  // ===== Modal Manager =====
  const Modal = {
    open(id) {
      const modal = document.getElementById(id);
      if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
      }
    },

    close(id) {
      const modal = document.getElementById(id);
      if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
      }
    },

    init() {
      document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', function(e) {
          if (e.target === this) {
            this.style.display = 'none';
            document.body.style.overflow = '';
          }
        });
      });

      document.querySelectorAll('[data-modal-close]').forEach(btn => {
        btn.addEventListener('click', function() {
          const id = this.getAttribute('data-modal-close');
          const modal = document.getElementById(id);
          if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
          }
        });
      });

      document.querySelectorAll('[data-modal-open]').forEach(btn => {
        btn.addEventListener('click', function() {
          const id = this.getAttribute('data-modal-open');
          Modal.open(id);
        });
      });
    }
  };

  // ===== Toast =====
  const Toast = {
    show(msg, type = 'info', duration = 3000) {
      const container = document.getElementById('toast-container') || this._createContainer();
      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      toast.innerHTML = `
        <span>${msg}</span>
        <button class="toast-close">&times;</button>
      `;
      toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.remove();
      });
      container.appendChild(toast);

      requestAnimationFrame(() => toast.classList.add('show'));

      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
      }, duration);
    },

    _createContainer() {
      const el = document.createElement('div');
      el.id = 'toast-container';
      document.body.appendChild(el);
      // Inject toast styles
      const style = document.createElement('style');
      style.textContent = `
        #toast-container {
          position: fixed; top: 16px; right: 16px; z-index: 10000;
          display: flex; flex-direction: column; gap: 8px;
        }
        .toast {
          padding: 12px 16px; border-radius: 8px; font-size: 14px;
          background: var(--color-surface); color: var(--color-text);
          border: 1px solid var(--color-border);
          box-shadow: var(--shadow-lg);
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px; min-width: 280px; max-width: 420px;
          opacity: 0; transform: translateX(20px);
          transition: all .3s ease;
        }
        .toast.show { opacity: 1; transform: translateX(0); }
        .toast-success { border-left: 3px solid var(--color-success); }
        .toast-error { border-left: 3px solid var(--color-danger); }
        .toast-warning { border-left: 3px solid var(--color-warning); }
        .toast-info { border-left: 3px solid var(--color-info); }
        .toast-close {
          background: none; border: none; font-size: 18px;
          color: var(--color-text-tertiary); cursor: pointer;
          padding: 0; line-height: 1;
        }
      `;
      document.head.appendChild(style);
      return el;
    }
  };

  // ===== Utils =====
  window.CyberPal = {
    ThemeManager,
    Sidebar,
    Modal,
    Toast,
    confirm(msg, onConfirm) {
      const modalId = 'confirm-modal';
      let modal = document.getElementById(modalId);

      if (!modal) {
        modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal-overlay';
        modal.style.display = 'none';
        modal.innerHTML = `
          <div class="modal">
            <div class="modal-header">
              <h3>确认操作</h3>
              <button class="modal-close" onclick="document.getElementById('${modalId}').style.display='none';document.body.style.overflow=''">&times;</button>
            </div>
            <div class="modal-body" id="${modalId}-body"></div>
            <div class="modal-footer">
              <button class="btn btn-secondary" onclick="document.getElementById('${modalId}').style.display='none';document.body.style.overflow=''">取消</button>
              <button class="btn btn-danger" id="${modalId}-confirm">确认</button>
            </div>
          </div>
        `;
        document.body.appendChild(modal);

        modal.addEventListener('click', function(e) {
          if (e.target === this) {
            this.style.display = 'none';
            document.body.style.overflow = '';
          }
        });
      }

      document.getElementById(`${modalId}-body`).innerHTML = msg;
      const confirmBtn = document.getElementById(`${modalId}-confirm`);
      const newBtn = confirmBtn.cloneNode(true);
      confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);
      newBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.style.overflow = '';
        if (onConfirm) onConfirm();
      });

      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    },

    placeholder() {
      Toast.show('功能开发中，敬请期待', 'info');
    },

    formatNumber(num) {
      if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
      if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
      return String(num);
    },

    formatDate(ts) {
      const d = new Date(ts * 1000);
      const now = new Date();
      const diff = now - d;
      if (diff < 60000) return '刚刚';
      if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
      if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${month}-${day} ${hours}:${minutes}`;
    },

    costDisplay(usd) {
      return '$' + usd.toFixed(4);
    }
  };

  // ===== Init on DOM Ready =====
  document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
    Sidebar.init();
    Modal.init();
  });

})();
