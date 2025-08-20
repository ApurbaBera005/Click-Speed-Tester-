// app/index.tsx  (or App.tsx)
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const DURATION_MS = 5000;

type Scheme = 'light' | 'dark';

const PALETTE = {
  light: {
    bg: '#f8fafc',
    text: '#0f172a',
    card: '#ffffff',
    border: '#cbd5e1',
    primary: '#2563eb',
    muted: '#e2e8f0',
  },
  dark: {
    bg: '#0b0f19',
    text: '#e5e7eb',
    card: '#111827',
    border: '#374151',
    primary: '#60a5fa',
    muted: '#1f2937',
  },
};

export default function ClickSpeedTester() {
  const system = useColorScheme(); // 'light' | 'dark' | null
  const [scheme, setScheme] = useState<Scheme>((system ?? 'light') as Scheme);

  const [running, setRunning] = useState(false);
  const [clicks, setClicks] = useState(0);
  const [remaining, setRemaining] = useState(DURATION_MS);

  const timerRef = useRef<NodeJS.Timer | null>(null);
  const endAtRef = useRef<number>(0);

  const theme = useMemo(() => PALETTE[scheme], [scheme]);
  const styles = useMemo(() => makeStyles(theme), [theme]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const start = () => {
    // reset + start
    if (timerRef.current) clearInterval(timerRef.current);
    setClicks(0);
    setRemaining(DURATION_MS);
    setRunning(true);
    endAtRef.current = Date.now() + DURATION_MS;

    timerRef.current = setInterval(() => {
      const left = Math.max(0, endAtRef.current - Date.now());
      setRemaining(left);
      if (left <= 0) {
        setRunning(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    }, 50);
  };

  const reset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setRunning(false);
    setClicks(0);
    setRemaining(DURATION_MS);
  };

  const handleClick = () => {
    if (!running) return;
    setClicks((c) => c + 1);
  };

  const seconds = (remaining / 1000).toFixed(2);
  const cps = (clicks / (DURATION_MS / 1000)).toFixed(2);

  return (
    <View style={styles.container}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />

      {/* Header + Theme toggle */}
      <View style={styles.topBar}>
        <Text style={styles.title}>Click Speed Tester</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => setScheme((s) => (s === 'light' ? 'dark' : 'light'))}
          style={({ pressed }) => [styles.toggle, pressed && { opacity: 0.8 }]}
        >
          <Text style={styles.toggleText}>{scheme === 'light' ? '🌙 Dark' : '☀️ Light'}</Text>
        </Pressable>
      </View>

      {/* Card */}
      <View style={styles.card}>
        <Text style={styles.timerLabel}>Time Left</Text>
        <Text style={styles.timerValue}>{seconds}s</Text>

        <View style={styles.actionsRow}>
          <Pressable
            disabled={running}
            onPress={start}
            style={({ pressed }) => [
              styles.primaryBtn,
              running && styles.disabledBtn,
              pressed && { transform: [{ scale: 0.98 }] },
            ]}
          >
            <Text style={styles.primaryBtnText}>{running ? 'Running…' : 'Start Test'}</Text>
          </Pressable>

          <Pressable
            onPress={reset}
            style={({ pressed }) => [styles.resetBtn, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.resetText}>Reset</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={handleClick}
          disabled={!running}
          style={({ pressed }) => [
            styles.clickArea,
            !running && styles.disabledBtn,
            pressed && running && { transform: [{ scale: 0.98 }] },
          ]}
        >
          <Text style={styles.clickAreaText}>{running ? 'CLICK ME!' : 'Click disabled'}</Text>
        </Pressable>

        <View style={styles.scoreRow}>
          <Text style={styles.scoreLabel}>Clicks:</Text>
          <Text style={styles.scoreValue}>{clicks}</Text>
        </View>

        {!running && remaining === 0 && (
          <Text style={styles.summary}>You got {clicks} clicks • {cps} CPS</Text>
        )}
      </View>
    </View>
  );
}

const makeStyles = (t: typeof PALETTE.light | typeof PALETTE.dark) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: t.bg,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    topBar: {
      position: 'absolute',
      top: 24,
      left: 24,
      right: 24,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    title: { fontSize: 20, fontWeight: '700', color: t.text },
    toggle: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: t.muted,
      borderWidth: 1,
      borderColor: t.border,
    },
    toggleText: { color: t.text, fontWeight: '600' },
    card: {
      width: '100%',
      maxWidth: 520,
      backgroundColor: t.card,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: t.border,
      gap: 12,
    },
    timerLabel: { color: t.text, opacity: 0.9, fontSize: 14 },
    timerValue: { color: t.text, fontSize: 48, fontWeight: '800', letterSpacing: 1 },
    actionsRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
    primaryBtn: {
      flex: 1,
      backgroundColor: t.primary,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    resetBtn: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.muted,
    },
    resetText: { color: t.text, fontWeight: '700' },
    clickArea: {
      marginTop: 8,
      borderRadius: 14,
      borderWidth: 2,
      borderColor: t.primary,
      paddingVertical: 24,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.bg,
    },
    clickAreaText: { color: t.text, fontSize: 18, fontWeight: '800', letterSpacing: 1 },
    scoreRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
    scoreLabel: { color: t.text, fontSize: 16, opacity: 0.9 },
    scoreValue: { color: t.text, fontSize: 20, fontWeight: '800' },
    disabledBtn: { opacity: 0.5 },
    summary: { marginTop: 8, color: t.text, fontSize: 16, fontWeight: '600' },
  });
