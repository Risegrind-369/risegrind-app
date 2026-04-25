# Phase 4: Health Integration Design

## Overview
Phase 4 implements health data tracking and analysis, integrating with Apple HealthKit, wearable devices, and stress tracking through HRV analysis. This document outlines the architecture, data models, and implementation strategy.

## Architecture

### Health Data Flow
```
Device Health Data (HealthKit, Pedometer, etc.)
    ↓
Expo Health Modules (expo-sensors, expo-health)
    ↓
Backend Health API (/api/health/...)
    ↓
Database (health_data, stress_scores, sleep_records)
    ↓
Frontend Health Dashboard
    ↓
Visualizations & Insights
```

### Modules & Permissions
- **Pedometer** (expo-sensors): Step count tracking
- **Accelerometer** (expo-sensors): Motion data for activity detection
- **Health Connect** (future): Full HealthKit integration
- **Background Tasks** (expo-task-manager): Periodic health data sync

### Data Models

#### Health Data Record
```typescript
{
  id: number;
  userId: number;
  dataType: 'steps' | 'sleep' | 'exercise' | 'heart_rate' | 'hrv' | 'stress';
  value: number;
  unit: string; // 'steps', 'minutes', 'bpm', 'ms', 'score'
  timestamp: Date;
  source: 'healthkit' | 'pedometer' | 'manual' | 'wearable';
  metadata?: Record<string, any>;
}
```

#### Sleep Record
```typescript
{
  id: number;
  userId: number;
  startTime: Date;
  endTime: Date;
  duration: number; // minutes
  quality: 'poor' | 'fair' | 'good' | 'excellent';
  deepSleep: number; // minutes
  remSleep: number; // minutes
  lightSleep: number; // minutes
  interruptions: number;
  habitImpact: number; // -100 to 100 (negative = bad sleep, positive = good sleep)
  habitCorrelations: string[]; // habits that correlate with this sleep quality
}
```

#### Stress Score
```typescript
{
  id: number;
  userId: number;
  timestamp: Date;
  hrvScore: number; // 0-100 (higher = lower stress)
  stressLevel: 'low' | 'medium' | 'high';
  triggers: string[]; // habits or activities that might cause stress
  recommendations: string[];
  habitImpact: number; // -100 to 100
}
```

#### Wearable Device
```typescript
{
  id: number;
  userId: number;
  deviceType: 'apple_watch' | 'oura_ring' | 'whoop' | 'garmin' | 'fitbit';
  deviceName: string;
  isConnected: boolean;
  lastSync: Date;
  accessToken?: string; // encrypted
  refreshToken?: string; // encrypted
}
```

## Backend API Endpoints

### Health Data Sync
- `POST /api/health/sync` - Sync health data from device
- `GET /api/health/data/:dataType` - Get health data by type
- `GET /api/health/data/range/:startDate/:endDate` - Get data for date range
- `POST /api/health/data/manual` - Manually log health data

### Sleep Tracking
- `POST /api/health/sleep/record` - Log sleep session
- `GET /api/health/sleep/history` - Get sleep history
- `GET /api/health/sleep/analysis` - Get sleep quality analysis
- `POST /api/health/sleep/correlations` - Analyze sleep-habit correlations

### Stress Tracking
- `POST /api/health/stress/calculate` - Calculate stress score from HRV
- `GET /api/health/stress/history` - Get stress history
- `POST /api/health/stress/triggers` - Identify stress triggers
- `GET /api/health/stress/recommendations` - Get stress management recommendations

### Wearable Integration
- `POST /api/health/wearables/connect` - Connect wearable device
- `GET /api/health/wearables/list` - List connected devices
- `POST /api/health/wearables/:id/sync` - Sync specific device
- `DELETE /api/health/wearables/:id` - Disconnect device

## Frontend Screens

### 1. Health Dashboard
**Route:** `app/health/index.tsx`
**Purpose:** Overview of health metrics and insights

**Layout:**
```
┌─────────────────────────────┐
│  Health & Wellness          │
├─────────────────────────────┤
│                             │
│  Today's Metrics:           │
│  • Steps: 8,234 / 10,000    │
│  • Sleep: 7h 23m (Good)     │
│  • Stress: 32 (Low)         │
│  • Heart Rate: 68 bpm       │
│                             │
│  [Sleep] [Steps] [Stress]   │
│  [Exercise] [Heart Rate]    │
│                             │
│  Habit Impact:              │
│  ✅ Morning run helped      │
│  ❌ Late coffee affected    │
│                             │
└─────────────────────────────┘
```

### 2. Sleep Tracking
**Route:** `app/health/sleep.tsx`
**Purpose:** Track and analyze sleep quality

**Features:**
- Log sleep sessions (start/end time, quality rating)
- Sleep history with duration and quality
- Sleep-habit correlation analysis
- Sleep quality trends
- Recommendations based on sleep patterns

### 3. Stress & HRV Tracking
**Route:** `app/health/stress.tsx`
**Purpose:** Monitor stress levels and HRV

**Features:**
- Real-time HRV measurement (if available)
- Stress level history
- Stress triggers identification
- Stress management recommendations
- Correlation with habits

### 4. Activity & Steps
**Route:** `app/health/activity.tsx`
**Purpose:** Track daily activity and steps

**Features:**
- Daily step count with goal progress
- Activity history
- Step trends (weekly, monthly)
- Activity recommendations

### 5. Wearable Devices
**Route:** `app/health/wearables.tsx`
**Purpose:** Manage connected wearable devices

**Features:**
- List connected devices
- Connect new devices (Apple Watch, Oura Ring, etc.)
- Sync device data
- Device settings and permissions

## Components to Create

### Health Metric Card
- Display metric name, value, unit, trend
- Progress bar for goals
- Status indicator (good/fair/poor)

### Sleep Quality Badge
- Visual representation of sleep quality
- Duration display
- Quality rating

### Stress Level Indicator
- Color-coded stress level (green/yellow/red)
- HRV score visualization
- Trend indicator

### Activity Progress Ring
- Circular progress indicator for steps/goals
- Animated ring fill
- Percentage display

### Health Chart
- Line chart for trends (sleep, stress, steps)
- Date range selector
- Data point tooltips

## Implementation Strategy

### Phase 4.1: Backend Health API
1. Create health data schema in database
2. Implement health data sync endpoints
3. Implement sleep tracking endpoints
4. Implement stress calculation and tracking
5. Add wearable device management endpoints

### Phase 4.2: Frontend Components
1. Create HealthMetricCard component
2. Create SleepQualityBadge component
3. Create StressIndicator component
4. Create ActivityProgressRing component
5. Create HealthChart component

### Phase 4.3: Frontend Screens
1. Build health dashboard (app/health/index.tsx)
2. Build sleep tracking screen (app/health/sleep.tsx)
3. Build stress tracking screen (app/health/stress.tsx)
4. Build activity screen (app/health/activity.tsx)
5. Build wearables management screen (app/health/wearables.tsx)

### Phase 4.4: Integration & Testing
1. Integrate Pedometer API for step tracking
2. Implement background health data sync
3. Add unit tests for health calculations
4. Add integration tests for API endpoints
5. Test on iOS and Android devices

## Key Algorithms

### Consistency Score Impact from Sleep
```
If sleep_quality == 'excellent' && sleep_duration >= 7h:
  habit_impact = +10
Else if sleep_quality == 'good' && sleep_duration >= 6h:
  habit_impact = +5
Else if sleep_quality == 'fair':
  habit_impact = 0
Else:
  habit_impact = -10
```

### Stress Score Calculation (HRV-based)
```
stress_score = 100 - (hrv / max_hrv * 100)
If stress_score < 30:
  stress_level = 'low'
Else if stress_score < 60:
  stress_level = 'medium'
Else:
  stress_level = 'high'
```

### Sleep-Habit Correlation
```
For each habit on day X:
  If sleep_quality[X] > average_sleep_quality:
    correlation_score += 1
  Else if sleep_quality[X] < average_sleep_quality:
    correlation_score -= 1

Sort habits by correlation_score
Display top positive and negative correlations
```

## Permissions Required

### iOS
- `NSHealthKitUsageDescription` - Health data access
- `NSMotionUsageDescription` - Motion/pedometer data
- `NSLocalNetworkUsageDescription` - Wearable device communication

### Android
- `android.permission.ACTIVITY_RECOGNITION` - Step counting
- `android.permission.ACCESS_FINE_LOCATION` - Activity location
- `android.permission.BODY_SENSORS` - Heart rate sensors

## Next Steps

1. Implement backend health API endpoints
2. Create frontend health components
3. Build health dashboard screens
4. Integrate Pedometer for step tracking
5. Add sleep tracking functionality
6. Implement stress calculation
7. Add wearable device integration
8. Test and save checkpoint
