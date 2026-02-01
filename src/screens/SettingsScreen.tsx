import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { getBestStreakMs, getRelapseCount, resetAllData } from '../services/persistence';
import { formatDuration } from '../utils/formatDuration';

const SettingsScreen = () => {
  const [stats, setStats] = useState({
    bestStreak: 'No record yet',
    relapseCount: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const bestStreakMs = await getBestStreakMs();
        const relapseCount = await getRelapseCount();
        setStats({
          bestStreak: bestStreakMs > 0 ? formatDuration(bestStreakMs) : 'No record yet',
          relapseCount,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, []);

  const handleResetAccount = () => {
    Alert.alert(
      'Reset Account',
      'Are you sure? This will reset your timer and all stats.',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Reset',
          onPress: async () => {
            try {
              await resetAllData();
              setStats({ bestStreak: 'No record yet', relapseCount: 0 });
              Alert.alert('Success', 'Your data has been reset.');
            } catch (error) {
              console.error('Error resetting account:', error);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Your Stats</Text>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Best Streak:</Text>
          <Text style={styles.statValue}>{stats.bestStreak}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Relapses:</Text>
          <Text style={styles.statValue}>{stats.relapseCount}</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Reset All Data" onPress={handleResetAccount} color="#d32f2f" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
  },
  statsContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 20,
    marginBottom: 30,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 16,
    color: '#666',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  buttonContainer: {
    marginBottom: 15,
  },
});

export default SettingsScreen;
