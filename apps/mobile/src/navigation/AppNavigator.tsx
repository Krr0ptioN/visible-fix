import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';

import MapScreen from '../screens/MapScreen';
import ReportScreen from '../screens/ReportScreen';
import MyIssuesScreen from '../screens/MyIssuesScreen';
import IssueDetailScreen from '../screens/IssueDetailScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabBarIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Map: '🗺️',
    Report: '➕',
    'My Issues': '📋',
  };
  return (
    <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.5 }}>
      {icons[name] || '○'}
    </Text>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => <TabBarIcon name={route.name} focused={focused} />,
        tabBarActiveTintColor: '#1E3A8A',
        tabBarInactiveTintColor: '#6B7280',
        headerStyle: { backgroundColor: '#1E3A8A' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      })}
    >
      <Tab.Screen 
        name="Map" 
        component={MapScreen}
        options={{ title: 'Harita' }}
      />
      <Tab.Screen 
        name="Report" 
        component={ReportScreen}
        options={{ title: 'Bildir' }}
      />
      <Tab.Screen 
        name="My Issues" 
        component={MyIssuesScreen}
        options={{ title: 'Bildirimlerim' }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#1E3A8A' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen 
          name="Main" 
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="IssueDetail" 
          component={IssueDetailScreen}
          options={{ title: 'Detaylar' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
