import { useEffect, useRef, useCallback } from 'react';

/**
 * Scroll-reveal: adds `.revealed` to `[data-reveal]` elements
 * when they become visible. Works with nested scroll containers.
 */
export default function useScrollReveal(rootRef) {
  const seen = useRef(new Set());

  const reveal = useCallback(() => {
    const container = rootRef?.current || document.body;
    const els = container.querySelectorAll('[data-reveal]:not(.revealed)');
    const vh = window.innerHeight;

    els.forEach((el) => {
      if (seen.current.has(el)) return;

      // Use getBoundingClientRect — works for any scroll context
      // because it returns position relative to viewport
      const rect = el.getBoundingClientRect();
      if (rect.top < vh + 50 && rect.bottom > -50) {
        seen.current.add(el);
        const delay = Number(el.dataset.revealDelay || 0);
        setTimeout(() => el.classList.add('revealed'), delay);
      }
    });
  }, [rootRef]);

  useEffect(() => {
    const container = rootRef?.current || document.body;

    // Find all scrollable ancestors to listen on
    const scrollTargets = [window];
    let node = container;
    while (node && node !== document.body) {
      const ov = window.getComputedStyle(node).overflowY;
      if (ov === 'auto' || ov === 'scroll') {
        scrollTargets.push(node);
      }
      node = node.parentElement;
    }
    // Also listen on the container itself
    if (!scrollTargets.includes(container)) {
      scrollTargets.push(container);
    }

    const onScroll = () => requestAnimationFrame(reveal);

    // Initial reveal after render
    requestAnimationFrame(reveal);
    setTimeout(reveal, 100);

    scrollTargets.forEach((t) => t.addEventListener('scroll', onScroll, { passive: true }));

    // Watch for new DOM nodes
    const mo = new MutationObserver(() => requestAnimationFrame(reveal));
    mo.observe(container, { childList: true, subtree: true });

    return () => {
      scrollTargets.forEach((t) => t.removeEventListener('scroll', onScroll));
      mo.disconnect();
    };
  }, [rootRef, reveal]);
}
