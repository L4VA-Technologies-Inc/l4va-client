/**
 * Buffers incoming stream chunks and reveals them at a steady pace so the UI
 * doesn't jump when the network dumps large deltas at once.
 */
export const createSmoothTextRevealer = (onUpdate, options = {}) => {
  const charsPerTick = options.charsPerTick ?? 1;
  const tickMs = options.tickMs ?? 22;

  let buffer = '';
  let displayed = '';
  let timerId = null;
  let streamDone = false;
  let settle = null;
  const settled = new Promise(resolve => {
    settle = resolve;
  });

  const clearTimer = () => {
    if (timerId != null) {
      clearTimeout(timerId);
      timerId = null;
    }
  };

  const maybeSettle = () => {
    if (streamDone && displayed.length >= buffer.length) {
      clearTimer();
      settle?.();
      settle = null;
    }
  };

  const tick = () => {
    timerId = null;

    if (displayed.length < buffer.length) {
      const nextIndex = Math.min(displayed.length + charsPerTick, buffer.length);
      // Prefer finishing the current word so pacing feels less mechanical.
      let end = nextIndex;
      if (end < buffer.length && !/\s/.test(buffer[end - 1])) {
        const nextSpace = buffer.indexOf(' ', end);
        if (nextSpace !== -1 && nextSpace - displayed.length <= 8) {
          end = nextSpace + 1;
        }
      }

      displayed = buffer.slice(0, end);
      onUpdate(displayed);
      timerId = setTimeout(tick, tickMs);
      return;
    }

    maybeSettle();
  };

  const schedule = () => {
    if (timerId == null && displayed.length < buffer.length) {
      timerId = setTimeout(tick, tickMs);
    }
  };

  return {
    push(text) {
      if (!text) return;
      buffer += text;
      schedule();
    },
    async finish() {
      streamDone = true;
      if (displayed.length >= buffer.length) {
        settle?.();
        settle = null;
      } else {
        schedule();
        await settled;
      }
      return buffer;
    },
    cancel() {
      streamDone = true;
      clearTimer();
      settle?.();
      settle = null;
    },
  };
};
