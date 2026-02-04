# Blocked Contacts Feature - Fix Summary

## Problem
The blocked contacts feature was not properly persisting blocked contacts. When users blocked contacts from either:
1. The user profile screen
2. The select-contact screen (using "Add new..." button)

The blocked contacts were not consistently showing up in the "Blocked contacts" list.

## Root Cause
The `blocked-contacts.tsx` screen was only listening to block/unblock events via `DeviceEventEmitter`, but was not:
1. Initializing the blocked contacts list from the existing `blockedIds` array on mount
2. Refreshing the list when navigating back to the screen

This meant that if you blocked someone and then navigated to the blocked contacts screen, the list would be empty until you blocked someone else while on that screen.

## Solution Implemented

### 1. Initialize Blocked Contacts on Mount
Added initialization logic in the `useEffect` hook to load all currently blocked contacts from the `blockedIds` array when the component mounts:

```typescript
useEffect(() => {
    // Initialize blocked contacts from blockedIds array
    const initialBlockedContacts = chat.filter(c =>
        blockedIds.includes(c.id.toString()) || blockedIds.includes(c.id)
    );
    setBlockedContacts(initialBlockedContacts);
    // ... rest of the event listeners
}, []);
```

### 2. Refresh on Screen Focus
Added `useFocusEffect` hook to refresh the blocked contacts list whenever the user navigates back to the screen:

```typescript
useFocusEffect(
    React.useCallback(() => {
        const currentBlockedContacts = chat.filter(c =>
            blockedIds.includes(c.id.toString()) || blockedIds.includes(c.id)
        );
        setBlockedContacts(currentBlockedContacts);
    }, [])
);
```

### 3. Proper Unblock Handling
Updated the `handleUnblock` function to remove contacts from the `blockedIds` array when unblocking:

```typescript
const handleUnblock = (user: any) => {
    Alert.alert(
        'Unblock contact',
        `Are you sure you want to unblock ${user.name}?`,
        [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Unblock',
                onPress: () => {
                    // Remove from blockedIds array
                    const userId = user.id.toString();
                    const index = blockedIds.findIndex(bid => bid === userId || bid === user.id);
                    if (index > -1) {
                        blockedIds.splice(index, 1);
                    }
                    DeviceEventEmitter.emit('userUnblocked', user.id);
                    Alert.alert('Unblocked', `${user.name} has been unblocked.`);
                }
            }
        ]
    );
};
```

## Files Modified

1. **`app/blocked-contacts.tsx`**
   - Added import for `blockedIds` from DemoChat
   - Added import for `useFocusEffect` from expo-router
   - Added initialization logic in useEffect
   - Added useFocusEffect to refresh on screen focus
   - Updated handleUnblock to remove from blockedIds array

## How It Works Now

### Blocking a Contact from Profile
1. User opens a contact's profile
2. User taps "Block [Contact Name]"
3. Contact is added to `blockedIds` array
4. `userBlocked` event is emitted
5. User navigates to "Blocked contacts" screen
6. Screen initializes/refreshes and shows the blocked contact

### Blocking a Contact from Select Contact
1. User goes to Settings → Privacy → Blocked contacts
2. User taps "Add new..."
3. User selects a contact to block
4. Contact is added to `blockedIds` array
5. `userBlocked` event is emitted
6. User is navigated back to "Blocked contacts" screen
7. Screen refreshes on focus and shows the newly blocked contact

### Unblocking a Contact
1. User goes to "Blocked contacts" screen
2. User taps on a blocked contact
3. User confirms unblock
4. Contact is removed from `blockedIds` array
5. `userUnblocked` event is emitted
6. Contact is removed from the displayed list

## Testing Checklist

- [x] Block contact from profile → Shows in blocked contacts
- [x] Block contact from select-contact → Shows in blocked contacts
- [x] Unblock contact → Removes from blocked contacts
- [x] Navigate away and back → Blocked contacts persist
- [x] Multiple blocks → All show in blocked contacts
- [x] Already blocked contact → Shows "Already blocked" message

## Notes

- The `blockedIds` array is currently in-memory only (resets on app restart)
- For production, this should be persisted using AsyncStorage or a backend API
- All blocking/unblocking operations maintain consistency across the app using DeviceEventEmitter
