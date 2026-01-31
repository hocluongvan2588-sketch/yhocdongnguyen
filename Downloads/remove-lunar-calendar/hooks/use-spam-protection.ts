'use client';

import { useState, useCallback, useEffect } from 'react';
import { HONEYPOT_FIELD_NAMES, MIN_FORM_SUBMIT_TIME_MS } from '@/lib/utils/spam-protection';

/**
 * USE SPAM PROTECTION HOOK
 * ═══════════════════════════════════════════════════════════
 * Client-side spam protection hook
 * - Track form start time để detect submit quá nhanh
 * - Collect honeypot values để gửi lên server
 * - Cung cấp helper functions cho form submission
 * ═══════════════════════════════════════════════════════════
 */

export interface SpamProtectionData {
  formStartTime: number;
  honeypotValues: Record<string, string>;
}

export function useSpamProtection() {
  const [formStartTime, setFormStartTime] = useState<number>(0);
  const [isReady, setIsReady] = useState(false);

  // Set form start time khi component mount
  useEffect(() => {
    setFormStartTime(Date.now());
    setIsReady(true);
  }, []);

  // Collect honeypot values từ form
  const getHoneypotValues = useCallback((form: HTMLFormElement): Record<string, string> => {
    const values: Record<string, string> = {};
    
    for (const fieldName of Object.values(HONEYPOT_FIELD_NAMES)) {
      const field = form.elements.namedItem(fieldName) as HTMLInputElement | null;
      if (field) {
        values[fieldName] = field.value;
      }
    }
    
    return values;
  }, []);

  // Check client-side nếu form submit quá nhanh
  const isSubmitTooFast = useCallback((): boolean => {
    if (!formStartTime) return false;
    const elapsed = Date.now() - formStartTime;
    return elapsed < MIN_FORM_SUBMIT_TIME_MS;
  }, [formStartTime]);

  // Get protection data để gửi lên server
  const getProtectionData = useCallback((form: HTMLFormElement): SpamProtectionData => {
    return {
      formStartTime,
      honeypotValues: getHoneypotValues(form),
    };
  }, [formStartTime, getHoneypotValues]);

  // Append protection data vào FormData
  const appendProtectionData = useCallback((formData: FormData, form: HTMLFormElement): FormData => {
    const protectionData = getProtectionData(form);
    formData.append('_formStartTime', protectionData.formStartTime.toString());
    
    // Honeypot values should already be in formData from the form
    return formData;
  }, [getProtectionData]);

  // Append protection data vào JSON body
  const appendProtectionToJson = useCallback(<T extends Record<string, unknown>>(
    data: T,
    form: HTMLFormElement
  ): T & { _formStartTime: number; _honeypot: Record<string, string> } => {
    const protectionData = getProtectionData(form);
    return {
      ...data,
      _formStartTime: protectionData.formStartTime,
      _honeypot: protectionData.honeypotValues,
    };
  }, [getProtectionData]);

  // Reset form start time (gọi sau khi submit thành công)
  const resetFormTiming = useCallback(() => {
    setFormStartTime(Date.now());
  }, []);

  return {
    formStartTime,
    isReady,
    isSubmitTooFast,
    getHoneypotValues,
    getProtectionData,
    appendProtectionData,
    appendProtectionToJson,
    resetFormTiming,
  };
}
