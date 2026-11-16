/**
 * True while an IME (Japanese/Chinese/Korean input) is composing text. The Enter that
 * confirms a candidate must not submit. keyCode 229 covers Safari, which reports
 * isComposing=false on that confirming keydown.
 */
export const isImeComposing = event => {
  const native = event?.nativeEvent ?? event;
  return Boolean(native?.isComposing) || native?.keyCode === 229;
};
