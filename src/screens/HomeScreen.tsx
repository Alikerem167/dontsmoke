import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Vibration, Animated, Modal } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { saveLastSmokeAt, getLastSmokeAt, saveBestStreakMs, getBestStreakMs } from '../services/persistence';
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
  const modalScaleAnim = useRef(new Animated.Value(0.8)).current;
  const modalOpacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const timestamp = await getLastSmokeAt();
        if (timestamp && timestamp > 0) setLastSmokeAt(timestamp);

        const savedBestStreakMs = await getBestStreakMs();
        setBestStreakMs(savedBestStreakMs);
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
  };

  const handleMotivation = () => {
    Vibration.vibrate(30);
    const message = getRandomMessage(lastMessages);
    setLastMessages((prev) => [message, ...prev].slice(0, 5));
    setMotivationText(message);
    setModalType('motivation');
    openModal();
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
      await saveBestStreakMs(newBestStreakMs);
    }
    
    // Show relapse modal FIRST (before async operations)
    setModalType('relapse');
    openModal();
    
    // Reset timer
    setLastSmokeAt(null);
    setTimer('');
    
    // Save reset state
    try {
      await saveLastSmokeAt(0);
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      Vibration.vibrate(50);
    }, [])
  );

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const openModal = () => {
    setShowModal(true);
    modalScaleAnim.setValue(0.8);
    modalOpacityAnim.setValue(0);
    Animated.parallel([
      Animated.spring(modalScaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(modalScaleAnim, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowModal(false);
    });
  };

  return (
    <View style={styles.container}>
      <Modal visible={showModal} transparent animationType="none">
        <Animated.View style={[styles.modalOverlay, { opacity: modalOpacityAnim }]}>
          <Animated.View style={[styles.modalContent, { transform: [{ scale: modalScaleAnim }] }]}>
            {modalType === 'motivation' ? (
              <>
                <View style={styles.modalTitleRow}>
                  <MaterialCommunityIcons name="arm-flex" size={28} color="#d32f2f" />
                  <Text style={styles.modalTitle}> Stay Strong!</Text>
                </View>
                <Text style={styles.modalMessage}>{motivationText}</Text>
              </>
            ) : (
              <>
                <View style={styles.modalTitleRow}>
                  <Ionicons name="refresh" size={28} color="#1976d2" />
                  <Text style={styles.modalTitle}> Fresh Start</Text>
                </View>
                <Text style={styles.modalMessage}>
                  Don't worry. We restart now.{'\n'}One slip doesn't erase your progress.{'\n\n'}Press Start when you're ready!
                </Text>
              </>
            )}
            <Pressable style={styles.modalButton} onPress={closeModal}>
              <Text style={styles.modalButtonText}>OK</Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </Modal>

      <View style={styles.header}>
        <View style={styles.bestStreakLabelRow}>
          <Ionicons name="trophy" size={18} color="#f9a825" />
          <Text style={styles.bestStreakLabel}> Best Streak</Text>
        </View>
        <Text style={styles.bestStreakValue}>{bestStreakMs > 0 ? formatDuration(bestStreakMs) : 'No record yet'}</Text>
      </View>

      <View style={styles.mainContent}>
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
      </View>

      <View style={styles.secondaryButtonContainer}>
        <Pressable 
          style={styles.secondaryButton} 
          onPress={handleDidSmoke}
          accessibilityLabel="I did smoke button - resets timer"
          accessibilityRole="button"
        >
          <Ionicons name="alert-circle-outline" size={18} color="#999" style={{ marginRight: 8 }} />
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
    paddingTop: 50,
    paddingBottom: 30,
    backgroundColor: '#fafafa',
  },
  header: {
    alignItems: 'center',
    marginBottom: 10,
  },
  bestStreakLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  bestStreakLabel: {
    fontSize: 14,
    color: '#999',
  },
  bestStreakValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  timerLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  timer: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#d32f2f',
    textAlign: 'center',
  },
  buttonContainer: {
    alignItems: 'center',
  },
  bigButton: {
    width: 180,
    height: 180,
    borderRadius: 90,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  secondaryButtonContainer: {
    alignItems: 'center',
    marginTop: 20,
    paddingBottom: 10,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: 'transparent',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#888',
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
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
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
