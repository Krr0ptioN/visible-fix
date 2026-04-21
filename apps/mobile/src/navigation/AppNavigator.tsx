import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import type { MainTabParamList, RootStackParamList } from './types';
import IssueDetailScreen from '../screens/IssueDetailScreen';
import MapScreen from '../screens/MapScreen';
import OperationsScreen from '../screens/OperationsScreen';
import OverviewScreen from '../screens/OverviewScreen';
import ReportScreen from '../screens/ReportScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function TabIcon({ routeName, focused }: { routeName: keyof MainTabParamList; focused: boolean }) {
  const labelByRoute: Record<keyof MainTabParamList, string> = {
    Overview: 'OV',
    Discovery: 'MAP',
    Report: 'NEW',
    Operations: 'OPS',
  };

  return <Text style={{ fontSize: 10, fontWeight: '800', color: focused ? '#0f1012' : '#6d7078' }}>{labelByRoute[routeName]}</Text>;
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => <TabIcon routeName={route.name as keyof MainTabParamList} focused={focused} />,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          textTransform: 'uppercase',
        },
        tabBarItemStyle: {
          borderRightWidth: 1,
          borderRightColor: 'rgba(12,12,13,0.12)',
        },
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: 'rgba(12,12,13,0.14)',
          backgroundColor: '#ffffff',
          minHeight: 58,
          paddingTop: 4,
          paddingBottom: 4,
        },
        tabBarActiveTintColor: '#0f1012',
        tabBarInactiveTintColor: '#6d7078',
        headerStyle: {
          backgroundColor: '#f3f3f1',
        },
        headerShadowVisible: false,
        headerTintColor: '#0f1012',
        headerTitleStyle: {
          fontSize: 16,
          fontWeight: '800',
        },
      })}
    >
      <Tab.Screen name="Overview" component={OverviewScreen} />
      <Tab.Screen name="Discovery" component={MapScreen} />
      <Tab.Screen name="Report" component={ReportScreen} />
      <Tab.Screen name="Operations" component={OperationsScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#f3f3f1',
          },
          headerShadowVisible: false,
          headerTintColor: '#0f1012',
          headerTitleStyle: {
            fontSize: 16,
            fontWeight: '800',
          },
        }}
      >
        <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="IssueDetail" component={IssueDetailScreen} options={{ title: 'Issue record' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
