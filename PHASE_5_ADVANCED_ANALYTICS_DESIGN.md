# Phase 5: Advanced Analytics + Wearable OAuth + Health Insights Engine

## Overview
Phase 5 extends RiseGrind with enterprise-grade analytics, secure wearable device integration, and AI-powered health insights. Users can connect Apple Watch, Oura Ring, and Whoop devices to unlock personalized recommendations based on sleep-habit correlations and stress patterns.

## Architecture

### 1. Wearable OAuth Flows

#### Apple Watch Integration
- **OAuth Flow**: OAuth 2.0 with HealthKit permissions
- **Scopes**: `health:read` (steps, heart rate, workouts)
- **Token Storage**: Secure keychain via `expo-secure-store`
- **Sync**: Background task every 6 hours
- **Data Types**: Steps, heart rate, active energy, workouts

#### Oura Ring Integration
- **OAuth Flow**: OAuth 2.0 with Oura Cloud API
- **Scopes**: `personal:read` (sleep, activity, readiness)
- **Token Storage**: Secure keychain
- **Sync**: Daily sync at 6 AM (after sleep data is available)
- **Data Types**: Sleep duration, sleep quality, HRV, readiness score

#### Whoop Integration
- **OAuth Flow**: OAuth 2.0 with Whoop API
- **Scopes**: `read:cycles` (strain, recovery, sleep)
- **Token Storage**: Secure keychain
- **Sync**: Real-time sync via webhook
- **Data Types**: Strain score, recovery score, sleep performance

### 2. Health Insights Engine

#### Sleep-Habit Correlations
```
Algorithm:
1. Collect 30-day sleep data and habit completion data
2. For each habit, calculate correlation coefficient with sleep quality
3. Identify top positive correlations (habits that improve sleep)
4. Identify negative correlations (habits that harm sleep)
5. Generate personalized recommendations
```

**Example Insights:**
- "Evening meditation correlates with 1.2 hours more sleep (+0.85 correlation)"
- "Late coffee reduces sleep quality by 30% (-0.72 correlation)"

#### Stress-Habit Correlations
```
Algorithm:
1. Collect stress scores and habit completion data
2. Calculate correlation between habits and stress levels
3. Identify stress-reducing habits
4. Identify stress-inducing habits
5. Generate stress management recommendations
```

#### Morning Energy Score
```
Formula:
Energy = (Sleep_Quality * 0.5) + (HRV_Score * 0.3) + (Activity_Level * 0.2)

Where:
- Sleep_Quality: 0-100 (based on duration, quality, interruptions)
- HRV_Score: 0-100 (normalized from HRV data)
- Activity_Level: 0-100 (based on morning steps/exercise)
```

### 3. Advanced Analytics

#### Predictive Streak Break Alerts
```
Algorithm:
1. Analyze 60-day habit completion patterns
2. Calculate streak break probability using:
   - Recent completion rate (last 7 days)
   - Historical break patterns
   - Stress levels (if available)
   - Sleep quality (if available)
3. Trigger alert if probability > 40%
4. Suggest intervention strategies
```

#### Habit Correlation Analysis
```
Algorithm:
1. Build correlation matrix of all habits
2. Identify positive correlations (habits that help each other)
3. Identify negative correlations (habits that conflict)
4. Suggest habit stacking for positive correlations
5. Suggest timing adjustments for negative correlations
```

**Example:**
- "Morning run + cold shower" (correlation: +0.78) → Stack these habits
- "Late work + meditation" (correlation: -0.65) → Do meditation before work

#### Success Pattern Identification
```
Algorithm:
1. Analyze optimal time of day for each habit
2. Identify optimal environment/location
3. Find optimal habit sequence
4. Calculate success rate by time, location, sequence
5. Generate personalized schedule recommendations
```

### 4. Database Schema Extensions

```sql
-- Wearable Device Connections
CREATE TABLE wearable_connections (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  device_type ENUM('apple_watch', 'oura_ring', 'whoop'),
  access_token TEXT ENCRYPTED,
  refresh_token TEXT ENCRYPTED,
  expires_at TIMESTAMP,
  last_sync TIMESTAMP,
  is_active BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Health Insights
CREATE TABLE health_insights (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  insight_type ENUM('sleep_habit_correlation', 'stress_habit_correlation', 'energy_score', 'streak_break_alert', 'habit_correlation', 'success_pattern'),
  title TEXT,
  description TEXT,
  data JSON,
  confidence FLOAT (0-1),
  action_items JSON[],
  created_at TIMESTAMP,
  expires_at TIMESTAMP
);

-- Habit Correlations
CREATE TABLE habit_correlations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  habit_1_id UUID REFERENCES habits(id),
  habit_2_id UUID REFERENCES habits(id),
  correlation_coefficient FLOAT (-1 to 1),
  sample_size INT,
  significance FLOAT (0-1),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Success Patterns
CREATE TABLE success_patterns (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  habit_id UUID REFERENCES habits(id),
  time_of_day VARCHAR (e.g., 'morning', 'afternoon', 'evening'),
  success_rate FLOAT (0-1),
  sample_size INT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 5. API Endpoints

#### Wearable OAuth
- `POST /api/wearables/oauth/authorize/:device` - Start OAuth flow
- `POST /api/wearables/oauth/callback/:device` - Handle OAuth callback
- `GET /api/wearables/list` - List connected wearables
- `DELETE /api/wearables/:id/disconnect` - Disconnect wearable
- `POST /api/wearables/:id/sync` - Trigger manual sync

#### Health Insights
- `GET /api/insights/health` - Get all health insights
- `GET /api/insights/health/:type` - Get insights by type
- `POST /api/insights/health/generate` - Generate new insights
- `GET /api/insights/correlations` - Get habit correlations
- `GET /api/insights/patterns` - Get success patterns

#### Advanced Analytics
- `GET /api/analytics/streak-break-risk` - Get streak break probability
- `GET /api/analytics/habit-correlations` - Get habit correlation matrix
- `GET /api/analytics/success-patterns` - Get success patterns by habit
- `GET /api/analytics/morning-energy` - Get morning energy score

### 6. Frontend Screens

#### Wearable Connections Screen
- List connected wearables with sync status
- Connect new wearable (OAuth flow)
- Disconnect wearable
- Manual sync button
- Last sync timestamp

#### Health Insights Screen
- Display AI-generated insights
- Insight cards with title, description, confidence
- Action items for each insight
- Filter by insight type
- Archive insights

#### Analytics Dashboard
- Habit correlation heatmap
- Success pattern timeline
- Streak break risk gauge
- Morning energy score trend
- Recommended habit stacking

## Security Considerations

1. **Token Storage**: Use `expo-secure-store` for OAuth tokens
2. **Token Encryption**: Encrypt tokens in database with AES-256
3. **Token Rotation**: Automatically refresh tokens before expiration
4. **Scope Minimization**: Request only necessary OAuth scopes
5. **Rate Limiting**: Implement rate limiting on OAuth endpoints
6. **HTTPS Only**: All API calls use HTTPS
7. **CORS**: Restrict CORS to app domain only

## Implementation Timeline

- **Phase 5.1**: Wearable OAuth flows (2 hours)
- **Phase 5.2**: Secure token storage (1 hour)
- **Phase 5.3**: Health insights engine (3 hours)
- **Phase 5.4**: Advanced analytics (2 hours)
- **Phase 5.5**: Frontend screens (2 hours)
- **Phase 5.6**: Testing & optimization (1 hour)

**Total: ~11 hours**

## Success Metrics

- OAuth flows work for all 3 wearables
- Insights generated with >80% confidence
- Correlations identified with >0.7 correlation coefficient
- Streak break alerts triggered with >70% accuracy
- All tokens securely stored and rotated
- <100ms insight generation time
- 0 security vulnerabilities
