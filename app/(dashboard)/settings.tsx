import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, StatusBar, SafeAreaView, ScrollView } from 'react-native';
import { ChevronRight, Sun, Moon } from 'lucide-react-native';

const SettingScreen = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(previousState => !previousState);
  };

  const colors = {
    background: isDarkMode ? '#1f2937' : '#f3f4f6',
    text: isDarkMode ? '#e5e7eb' : '#1f2937',
    cardBackground: isDarkMode ? '#374151' : '#ffffff',
    cardBorder: isDarkMode ? '#4b5563' : '#e5e7eb',
    switchOn: '#34d399',
    switchOff: '#9ca3af',
    icon: isDarkMode ? '#e5e7eb' : '#1f2937',
    headerBackground: isDarkMode ? '#111827' : '#ffffff',
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBackground }]}>
        <Text style={[styles.headerText, { color: colors.text }]}>Settings</Text>
      </View>
      
      <ScrollView style={styles.contentContainer}>
        {/* Account Section */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
        <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={[styles.settingText, { color: colors.text }]}>Profile</Text>
            <ChevronRight size={20} color={colors.text} />
          </TouchableOpacity>
          <View style={[styles.separator, { backgroundColor: colors.cardBorder }]} />
          <TouchableOpacity style={styles.settingItem}>
            <Text style={[styles.settingText, { color: colors.text }]}>Privacy</Text>
            <ChevronRight size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Display Section */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Display</Text>
        <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
          <View style={styles.settingItem}>
            <View style={styles.iconTextContainer}>
              <View style={styles.iconContainer}>
                {isDarkMode ? <Moon size={24} color={colors.icon} /> : <Sun size={24} color={colors.icon} />}
              </View>
              <Text style={[styles.settingText, { color: colors.text }]}>Dark Mode</Text>
            </View>
            <Switch
              trackColor={{ false: colors.switchOff, true: colors.switchOn }}
              thumbColor={colors.cardBackground}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleTheme}
              value={isDarkMode}
            />
          </View>
        </View>

        {/* General Section */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>General</Text>
        <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={[styles.settingText, { color: colors.text }]}>Notifications</Text>
            <ChevronRight size={20} color={colors.text} />
          </TouchableOpacity>
          <View style={[styles.separator, { backgroundColor: colors.cardBorder }]} />
          <TouchableOpacity style={styles.settingItem}>
            <Text style={[styles.settingText, { color: colors.text }]}>Language</Text>
            <ChevronRight size={20} color={colors.text} />
          </TouchableOpacity>
          <View style={[styles.separator, { backgroundColor: colors.cardBorder }]} />
          <TouchableOpacity style={styles.settingItem}>
            <Text style={[styles.settingText, { color: colors.text }]}>Help & Support</Text>
            <ChevronRight size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  settingText: {
    fontSize: 16,
    flex: 1,
  },
  separator: {
    height: 1,
    marginHorizontal: 20,
  },
  iconTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: 10,
  },
});

export default SettingScreen;