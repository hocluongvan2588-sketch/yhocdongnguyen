'use client';

import { HONEYPOT_FIELD_NAMES } from '@/lib/utils/spam-protection';

/**
 * HONEYPOT FIELDS COMPONENT
 * ═══════════════════════════════════════════════════════════
 * Render các trường ẩn để bẫy bot
 * - CSS ẩn hoàn toàn với screen readers
 * - Bot sẽ điền vào vì nghĩ đây là trường thật
 * - Người dùng thật không thấy và không điền
 * ═══════════════════════════════════════════════════════════
 */
export default function HoneypotFields() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: '-9999px',
        top: '-9999px',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
        opacity: 0,
        pointerEvents: 'none',
        tabIndex: -1,
      }}
    >
      {/* Email honeypot - bot thường điền email */}
      <label htmlFor={HONEYPOT_FIELD_NAMES.email}>
        Leave this field empty
        <input
          type="email"
          id={HONEYPOT_FIELD_NAMES.email}
          name={HONEYPOT_FIELD_NAMES.email}
          autoComplete="off"
          tabIndex={-1}
        />
      </label>

      {/* Website honeypot - bot thường điền URL */}
      <label htmlFor={HONEYPOT_FIELD_NAMES.website}>
        Do not fill this
        <input
          type="url"
          id={HONEYPOT_FIELD_NAMES.website}
          name={HONEYPOT_FIELD_NAMES.website}
          autoComplete="off"
          tabIndex={-1}
        />
      </label>

      {/* Phone honeypot */}
      <label htmlFor={HONEYPOT_FIELD_NAMES.phone}>
        Leave empty
        <input
          type="tel"
          id={HONEYPOT_FIELD_NAMES.phone}
          name={HONEYPOT_FIELD_NAMES.phone}
          autoComplete="off"
          tabIndex={-1}
        />
      </label>
    </div>
  );
}
