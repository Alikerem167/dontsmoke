import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Vibration, Animated, Modal } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { firestore, auth } from '../services/firebase';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';
import { saveLastSmokeAt, getLastSmokeAt } from '../services/persistence';
import { getRandomMessage } from '../utils/motivationalMessages';
import { formatDuration } from '../utils/formatDuration';

const HomeScreen = () => {
  const [lastSmokeAt, setLastSmokeAt] = useState<number | null>(null);
  const [timer, setTimer] = useState('');
  const [lastMessages, setLastMessages] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'motivation' | 'relapse'>('motivation');
  const [motivationText, setMotivationText] = useState('');
  const [bestStreakMs, setBestStreakMs] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const timestamp = await getLastSmokeAt();
        if (timestamp && timestamp > 0) setLastSmokeAt(timestamp);

        const userRef = doc(firestore, 'users', auth.currentUser?.uid || 'user-id');
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const savedBestStreakMs = userDoc.data()?.bestStreakMs || 0;
          setBestStreakMs(savedBestStreakMs);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (lastSmokeAt) {
      const interval = setInterval(() => {
        const elapsed = Date.now() - lastSmokeAt;
        const formatted = formatDuration(elapsed);
        setTimer(formatted);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [lastSmokeAt]);

  const handleStart = async () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    Vibration.vibrate(50);

    const now = Date.now();
    setLastSmokeAt(now);
    await saveLastSmokeAt(now);
    const userRef = doc(collection(firestore, 'users'), 'user-id');
    await setDoc(userRef, { lastSmokeAt: now }, { merge: true });
  };

  const handleMotivation = () => {
    Vibration.vibrate(30);
    const message = getRandomMessage(lastMessages);
    setLastMessages((prev) => [message, ...prev].slice(0, 5));
    setMotivationText(message);
    setModalType('motivation');
    setShowModal(true);
  };

  const handleDidSmoke = async () => {
    Vibration.vibrate(100);
    
    // Calculate current streak before resetting
    const currentStreakMs = lastSmokeAt ? Date.now() - lastSmokeAt : 0;
    
    // Update best streak if current is higher
    let newBestStreakMs = bestStreakMs;
    if (currentStreakMs > bestStreakMs) {
      newBestStreakMs = currentStreakMs;
      setBestStreakMs(newBestStreakMs);
    }
    
    // Show relapse modal FIRST (before async operations)
    setModalType('relapse');
    setShowModal(true);
    
    // Reset timer
    setLastSmokeAt(null);
    setTimer('');
    
    // Async operations after modal is shown
    try {
      await saveLastSmokeAt(0);
      const userRef = doc(firestore, 'users', auth.currentUser?.uid || 'user-id');
      await setDoc(userRef, { 
        lastSmokeAt: 0,
        bestStreakMs: newBestStreakMs,
      }, { merge: true });
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      Vibration.vibrate(50); // Haptic feedback when screen is focused
    }, [])
  );

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <View style={styles.container}>
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {modalType === 'motivation' ? (
              <>
                <Text style={styles.modalTitle}>💪 Stay Strong!</Text>
                <Text style={styles.modalMessage}>{motivationText}</Text>
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>🔄 Fresh Start</Text>
                <Text style={styles.modalMessage}>
                  Don't worry. We restart now.{'\n'}One slip doesn't erase your progress.{'\n\n'}Press Start when you're ready!
                </Text>
              </>
            )}
            <Pressable style={styles.modalButton} onPress={() => setShowModal(false)}>
              <Text style={styles.modalButtonText}>OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <Text style={styles.bestStreakLabel}>🏆 Best Streak</Text>
        <Text style={styles.bestStreakValue}>{bestStreakMs > 0 ? formatDuration(bestStreakMs) : 'No record yet'}</Text>
      </View>

      <View style={styles.timerContainer}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.timerLabel}>You haven't smoked for</Text>
          <Text style={styles.timer}>{timer || 'Press Start to begin'}</Text>
        </Animated.View>
      </View>

      <View style={styles.buttonContainer}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Pressable
            style={[styles.bigButton, lastSmokeAt ? styles.bigButtonSecondary : styles.bigButtonPrimary]}
            onPress={lastSmokeAt ? handleMotivation : handleStart}
            accessibilityLabel={lastSmokeAt ? "I want to smoke button" : "Start timer button"}
            accessibilityRole="button"
          >
            <Text style={styles.bigButtonText}>
              {lastSmokeAt ? "I wanna smoke" : "Start"}
            </Text>
          </Pressable>
        </Animated.View>
      </View>

      <View style={styles.secondaryButtonContainer}>
        <Pressable 
          style={styles.secondaryButton} 
          onPress={handleDidSmoke}
          accessibilityLabel="I did smoke button - resets timer"
          accessibilityRole="button"
        >
          <Text style={styles.secondaryButtonText}>I did smoke</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
    backgroundColor: '#fafafa',
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  bestStreakLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 5,
  },
  bestStreakValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  timerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  timerLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  timer: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#d32f2f',
    textAlign: 'center',
  },
  buttonContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  bigButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  bigButtonPrimary: {
    backgroundColor: '#d32f2f',
  },
  bigButtonSecondary: {
    backgroundColor: '#f57c00',
  },
  bigButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  secondaryButtonContainer: {
    alignItems: 'center',
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 40,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#1976d2',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976d2',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '85%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    color: '#666',
    lineHeight: 24,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 40,
    backgroundColor: '#d32f2f',
    borderRadius: 8,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default HomeScreen;