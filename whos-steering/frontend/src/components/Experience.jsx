import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
export function RouteExperience() {
  const {
    pathname
  } = useLocation();
  const navigationType = useNavigationType();
  const previous = useRef(pathname);
  useEffect(() => {
    if (previous.current !== pathname && navigationType !== 'POP') window.scrollTo({
      top: 0,
      behavior: 'instant'
    });
    previous.current = pathname;
    document.body.dataset.route = pathname.split('/')[1] || 'home';
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    }), {
      threshold: .08
    });
    const watch = () => document.querySelectorAll('.reveal:not(.revealed)').forEach(el => observer.observe(el));
    const mutations = new MutationObserver(watch);
    mutations.observe(document.getElementById('route-content'), {
      childList: true,
      subtree: true
    });
    watch();
    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, [pathname, navigationType]);
  return null;
}
export function useDialog(ref, open, onClose) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!open || !ref.current) return;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const root = ref.current;
    const focusable = () => [...root.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]')].filter(el => el.getClientRects().length);
    (focusable()[0] || root).focus();
    const keydown = e => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        closeRef.current();
      }
      if (e.key !== 'Tab') return;
      const nodes = focusable();
      if (!nodes.length) {
        e.preventDefault();
        root.focus();
        return;
      }
      if (e.shiftKey && (document.activeElement === nodes[0] || document.activeElement === root)) {
        e.preventDefault();
        nodes[nodes.length - 1].focus();
      } else if (!e.shiftKey && document.activeElement === nodes[nodes.length - 1]) {
        e.preventDefault();
        nodes[0].focus();
      }
    };
    root.addEventListener('keydown', keydown);
    return () => {
      document.body.style.overflow = overflow;
      root.removeEventListener('keydown', keydown);
      previous?.focus();
    };
  }, [open, ref]);
}
