# End-to-End (E2E) Testing Guide - Sprint 2
## Rental Car Booking System

**Project:** Rental Car Booking System  
**Focus:** EPIC 1 (Review Management) and EPIC 2 (Chat System)  
**Date:** April 27, 2026  
**Version:** 2.0.0

---

## Quick Overview

This guide provides comprehensive manual E2E testing scenarios for Sprint 2 features. Each scenario includes positive tests (should work) and negative tests (should fail appropriately).

**Two Main Features:**
1. **Epic 1 - Review Management:** Admin dashboard, review deletion
2. **Epic 2 - Chat System:** Message editing, deletion, and admin viewing

---

# EPIC 1: RATING & REVIEW SYSTEM

---

## US1-3: Admin View Reviews & Ratings Dashboard

**Goal:** Admin can view all reviews with ratings for their providers and filter them effectively.

### Positive Scenario: Admin Successfully Views Review Dashboard

**Preconditions:**
- Admin is logged into their account with admin role
- At least 5 reviews exist in the system for different providers
- Reviews have varying ratings (1-5 stars)

**Test Steps:**
1. Log in as admin
2. Navigate to "Review Management" or "Admin Dashboard"
3. Click "View Reviews" or similar button
4. Wait for dashboard to load

**Expected Result:**
- Dashboard loads within 2 seconds
- All reviews are displayed in a list
- Each review shows: rating (stars), comment, user name, provider, timestamp
- Review count displays correctly (e.g., "Showing 25 of 150 reviews")
- Page is responsive on mobile/tablet
- No error messages visible

---

### Positive Scenario: Admin Filters Reviews by Rating

**Preconditions:**
- Admin is logged in
- Review dashboard is loaded
- Reviews with different ratings (1-5) exist

**Test Steps:**
1. On the review dashboard, locate filter section
2. Click "Filter by Rating" or rating buttons
3. Select "5 stars" filter
4. Wait for list to update
5. Clear filter and select "1-2 stars"

**Expected Result:**
- Dashboard updates within 500ms
- Only 5-star reviews display when filtering for 5 stars
- Only 1-2 star reviews display when filtering for 1-2 stars
- Filter indicator shows active filter
- Review count updates (e.g., "Showing 5 of 150 reviews")
- "Clear Filter" button appears and works

---

### Positive Scenario: Admin Filters Reviews by Date Range

**Preconditions:**
- Admin dashboard is open
- Reviews from different dates exist (past 7, 30, 90 days)

**Test Steps:**
1. Locate date filter on dashboard
2. Select "Past 7 days" option
3. Verify list updates
4. Select custom date range (e.g., April 1-15)
5. Click "Apply" or similar

**Expected Result:**
- Reviews update to show only past 7 days
- Custom date range filter works correctly
- No reviews outside selected range appear
- Date format is clear (YYYY-MM-DD or similar)
- Calendar picker is easy to use

---

### Positive Scenario: Admin Searches Reviews by Keyword

**Preconditions:**
- Admin dashboard is open
- Reviews with various keywords exist

**Test Steps:**
1. Locate search bar on dashboard
2. Type keyword (e.g., "excellent" or provider name)
3. Press Enter or click Search
4. Wait for results

**Expected Result:**
- Dashboard updates with matching reviews
- Results appear within 500ms
- Only reviews containing keyword display
- Search highlights matching text
- Result count shows (e.g., "5 matching reviews found")
- Clear search button resets list

---

### Positive Scenario: Admin Views Review Statistics

**Preconditions:**
- Admin dashboard is open
- Multiple reviews exist (at least 10)

**Test Steps:**
1. Look for "Statistics" or "Analytics" section
2. Observe displayed data
3. Scroll through stats

**Expected Result:**
- Average rating displays (e.g., 4.2 stars)
- Rating distribution chart shows (number of 1-star, 2-star, etc.)
- Total review count displays
- Most reviewed provider listed
- Least reviewed provider listed
- Stats update when filters change

---

### Negative Scenario 1: Non-Admin Cannot Access Dashboard

**Preconditions:**
- Regular user is logged in (not admin)

**Test Steps:**
1. Try to navigate directly to admin dashboard URL
2. Or look for admin menu option

**Expected Result:**
- System shows error: "Access Denied" or "Admin Access Required"
- User redirected to regular user dashboard
- Dashboard does not load
- No admin controls visible

---

### Negative Scenario 2: Unauthenticated User Cannot Access Dashboard

**Preconditions:**
- User is NOT logged in

**Test Steps:**
1. Try to access admin dashboard URL directly
2. Navigate via menu if possible

**Expected Result:**
- System redirects to login page
- Dashboard does not load
- Message: "Please log in first" or similar
- Admin dashboard completely inaccessible

---

### Negative Scenario 3: Dashboard Shows Empty State Correctly

**Preconditions:**
- Admin is logged in
- No reviews exist in the system

**Test Steps:**
1. Navigate to review dashboard
2. Observe display

**Expected Result:**
- Dashboard loads without errors
- Empty state message displays: "No reviews found"
- Or: "No reviews match your filters"
- Page is still functional (filters can be used)
- No broken UI elements

---

### Negative Scenario 4: Invalid Filter Parameters

**Preconditions:**
- Admin dashboard is open

**Test Steps:**
1. Try to set invalid date range (end date before start date)
2. Or enter invalid rating (0 or 6)
3. Apply filter

**Expected Result:**
- System shows error message: "Invalid date range"
- Or: "Rating must be between 1 and 5"
- Filter does not apply
- Dashboard continues working
- Error message is clear

---

## US1-4: Admin Delete Inappropriate Reviews

**Goal:** Admin can safely delete inappropriate reviews with confirmation and audit trail.

### Positive Scenario: Admin Successfully Deletes a Review

**Preconditions:**
- Admin is logged in
- Admin is viewing review dashboard
- A review is selected for deletion

**Test Steps:**
1. Find a review to delete
2. Click "Delete" button on review card/row
3. Review deletion modal/confirmation appears
4. Read confirmation message
5. Enter deletion reason (e.g., "Spam content")
6. Click "Confirm Delete" button
7. Modal closes

**Expected Result:**
- Deletion confirmation modal appears
- Modal includes: review preview, reason dropdown/field
- Delete button is disabled until reason entered
- Review disappears from list within 1 second
- Success message displays: "Review deleted successfully"
- Review count decreases by 1
- Deleted review no longer visible on provider's page

---

### Positive Scenario: Admin Re-verifies Admin Password During Delete

**Preconditions:**
- Admin is logged in
- Delete action initiated
- System requires password verification

**Test Steps:**
1. Click delete on a review
2. Confirmation modal appears with password field
3. Leave password field empty
4. Try to click confirm delete

**Expected Result:**
- Confirm button is disabled if password empty
- After entering correct admin password
- Password is masked (shown as dots)
- Delete proceeds after verification
- Message: "Deleted successfully"

---

### Positive Scenario: Admin Can Undo Delete (24-hour window)

**Preconditions:**
- Admin just deleted a review within last hour
- Undo feature is implemented

**Test Steps:**
1. After deleting review, notification appears
2. Click "Undo" in notification or message
3. Wait for restoration

**Expected Result:**
- Review reappears in dashboard
- Original timestamps preserved
- Message: "Review restored successfully"
- After 24 hours, undo is no longer available

---

### Positive Scenario: Deletion Reason Recorded in Audit Log

**Preconditions:**
- Review has been deleted
- Audit log is accessible to system administrators

**Test Steps:**
1. Review admin activity log or audit trail
2. Find deletion entry
3. Click to view details

**Expected Result:**
- Log entry shows: admin name, review ID, deletion reason
- Timestamp of deletion recorded
- Action recorded as "deleted_review"
- Audit trail cannot be modified

---

### Negative Scenario 1: Non-Admin Cannot Delete Reviews

**Preconditions:**
- Regular user is logged in
- User is viewing reviews

**Test Steps:**
1. Find review to delete
2. Look for delete button
3. Try to delete

**Expected Result:**
- Delete button not visible for regular users
- If URL accessed directly, error: "Unauthorized"
- No confirmation modal appears
- Review not deleted

---

### Negative Scenario 2: User Cannot Delete Others' Reviews

**Preconditions:**
- User A is logged in
- Review was written by User B
- User A somehow accesses delete mechanism

**Test Steps:**
1. Try to delete review written by another user
2. Either through UI or direct API call

**Expected Result:**
- System shows error: "You can only delete your own reviews"
- Or: "Access Denied"
- Review not deleted
- No error logs on frontend

---

### Negative Scenario 3: Delete With Missing Reason

**Preconditions:**
- Admin clicked delete button
- Confirmation modal is open

**Test Steps:**
1. Leave "Deletion Reason" field empty
2. Click "Confirm Delete"

**Expected Result:**
- Submit button is disabled
- Error message: "Please provide a reason for deletion"
- Modal stays open
- Review not deleted

---

### Negative Scenario 4: Delete Reason Too Short

**Preconditions:**
- Admin deletion modal is open

**Test Steps:**
1. Enter reason less than 50 characters (e.g., "Bad")
2. Try to submit

**Expected Result:**
- Error message: "Reason must be 50-500 characters"
- Delete button disabled
- Review not deleted

---

### Negative Scenario 5: Delete Reason Too Long

**Preconditions:**
- Admin deletion modal is open

**Test Steps:**
1. Paste or type more than 500 characters in reason field
2. Try to submit

**Expected Result:**
- Error message: "Reason cannot exceed 500 characters"
- Character counter shows: "XXX/500 characters"
- Delete button disabled
- Review not deleted

---

### Negative Scenario 6: Double-Delete Prevention

**Preconditions:**
- Review is already deleted
- Admin somehow tries to delete same review again

**Test Steps:**
1. Attempt to delete already-deleted review

**Expected Result:**
- Error message: "Review not found" or "Already deleted"
- HTTP 404 status
- No second deletion record

---

# EPIC 2: CHAT SYSTEM

---

## US2-3: User Edits Messages

**Goal:** Users can edit their messages to correct information.

### Positive Scenario: User Successfully Edits Their Message

**Preconditions:**
- User is logged in
- User sent a message (at least 1 minute ago)
- Chat window is open
- User is viewing their own message

**Test Steps:**
1. Find user's message in chat
2. Hover over message or click three-dot menu
3. Click "Edit" button
4. Verify message text appears in edit box
5. Change message content (e.g., fix typo)
6. Click "Save" or "Update"
7. Wait for update

**Expected Result:**
- Edit form appears with original message text
- User can modify the message
- "Save" button becomes enabled after change
- Message updates within 1 second
- "Edited" indicator/timestamp appears below message
- Shows timestamp: "Edited at: 2:15 PM"
- Message appears in all open chat windows (real-time)

---

### Positive Scenario: Message Edit Shows in Chat History

**Preconditions:**
- User edited a message
- Chat history is visible

**Test Steps:**
1. Look at edited message in chat
2. Click on message to view details
3. Or hover to see "Edit History"

**Expected Result:**
- "Edited at: 2:15 PM" shows on message
- Edit history button/link available
- Clicking shows original and edited versions
- Timestamps for each edit version shown

---

### Positive Scenario: Undo Recent Edit

**Preconditions:**
- User edited message less than 30 minutes ago
- Undo feature available

**Test Steps:**
1. Click on edited message
2. Look for "Undo Edit" button
3. Click it

**Expected Result:**
- Message reverts to previous version
- "Edited" indicator removed
- Notification: "Edit undone"
- After 30 minutes, undo no longer available

---

### Negative Scenario 1: Edit Button Not Visible for Others' Messages

**Preconditions:**
- User is viewing chat
- Message was sent by another user

**Test Steps:**
1. Find message from different user
2. Hover over message or click menu

**Expected Result:**
- Edit button not visible
- Only "Delete" and "Report" buttons available (if any)
- Cannot edit others' messages

---

### Negative Scenario 2: Cannot Edit Someone Else's Message (Direct API Call)

**Preconditions:**
- User somehow attempts API call to edit another user's message

**Test Steps:**
1. Intercept and modify edit API call
2. Or use developer tools to send edit request

**Expected Result:**
- Server responds: "Unauthorized - message not owned by user"
- HTTP 403 status
- Message not updated
- No error on frontend

---

### Negative Scenario 3: Edit Message Too Long

**Preconditions:**
- User is editing a message
- Edit form is open

**Test Steps:**
1. Type message exceeding 2000 characters
2. Try to save

**Expected Result:**
- Error message: "Message cannot exceed 2000 characters"
- Character counter shows: "2050/2000"
- Save button disabled
- Message not updated

---

### Negative Scenario 4: Edit Message Empty

**Preconditions:**
- User editing a message

**Test Steps:**
1. Clear all message text
2. Click Save

**Expected Result:**
- Error message: "Message cannot be empty"
- Save button disabled
- Original message preserved

---

### Negative Scenario 5: Edit After Message Deleted

**Preconditions:**
- Message was deleted by owner or admin

**Test Steps:**
1. Try to edit deleted message

**Expected Result:**
- Error: "Message no longer exists"
- Or: "Message has been deleted"
- Edit form does not appear

---

## US2-4: User Deletes Messages

**Goal:** Users can delete their messages to remove incorrect information.

### Positive Scenario: User Successfully Deletes Their Message

**Preconditions:**
- User is logged in
- User sent a message
- Message is visible in chat
- User is message owner

**Test Steps:**
1. Find user's message in chat
2. Click message menu/three-dots
3. Click "Delete Message"
4. Confirmation dialog appears
5. Dialog shows message preview
6. Click "Yes, Delete" or similar
7. Wait for deletion

**Expected Result:**
- Confirmation modal appears with message preview
- Modal shows message will be removed
- After clicking delete, message disappears within 1 second
- Message replaced with "[deleted message]" placeholder (optional)
- Success message shows: "Message deleted successfully"
- Deletion instant in all open chat windows
- Message no longer visible for other users

---

### Positive Scenario: Delete Confirmation Has Countdown

**Preconditions:**
- Delete confirmation modal is open

**Test Steps:**
1. Observe confirmation modal
2. Look for countdown timer
3. Wait for confirmation to timeout or click delete

**Expected Result:**
- Modal shows countdown (e.g., "Auto-canceling in 5 seconds")
- If no action, modal closes after countdown
- User can still click delete before countdown ends
- Deletion proceeds if confirmed

---

### Negative Scenario 1: Delete Button Not Visible for Others' Messages

**Preconditions:**
- User viewing message from another user

**Test Steps:**
1. Find other user's message
2. Try to find delete option

**Expected Result:**
- Delete button not visible
- Cannot delete others' messages
- Only options are: Report, Reply, etc.

---

### Negative Scenario 2: Cannot Delete Others' Messages (Direct API)

**Preconditions:**
- User attempts API call to delete another user's message

**Test Steps:**
1. Send DELETE request for message not owned by user

**Expected Result:**
- Server responds: "Unauthorized - message not owned by user"
- HTTP 403 status
- Message not deleted
- Audit log records attempted unauthorized deletion

---

### Negative Scenario 3: Delete Non-Existent Message

**Preconditions:**
- User tries to delete message that doesn't exist

**Test Steps:**
1. Modify message ID and send delete request
2. Or refresh and try to delete already-deleted message

**Expected Result:**
- Error: "Message not found"
- HTTP 404 status
- No error on frontend

---

### Negative Scenario 4: Double-Delete Prevention

**Preconditions:**
- Message already deleted by user

**Test Steps:**
1. Try to delete same message again

**Expected Result:**
- Error: "Message already deleted"
- Or message already gone from UI

---

## US2-5: Admin Views User Messages

**Goal:** Admin can view all user messages to respond to inquiries.

### Positive Scenario: Admin Successfully Accesses Chat Admin Panel

**Preconditions:**
- Admin is logged in with admin role
- At least 10 messages exist from various users

**Test Steps:**
1. Log in as admin
2. Navigate to "Admin" menu or "Chat Management"
3. Click "View All Messages" or "Chat Admin Panel"
4. Wait for page to load

**Expected Result:**
- Admin panel loads within 2 seconds
- All user messages displayed in list
- Each message shows: sender name, content preview, timestamp
- Total message count displayed (e.g., "Showing 50 of 523 messages")
- Messages sorted by most recent first
- No error messages

---

### Positive Scenario: Admin Filters Messages by User

**Preconditions:**
- Admin is on chat admin panel
- Multiple messages from different users exist

**Test Steps:**
1. Locate user filter field
2. Type user name (e.g., "John")
3. Press Enter or wait for autocomplete
4. See filtered results

**Expected Result:**
- Messages filter to show only from selected user
- List updates within 500ms
- Only John's messages display
- Message count updates (e.g., "Showing 5 of 523 messages")
- User name appears as active filter chip

---

### Positive Scenario: Admin Filters Messages by Date Range

**Preconditions:**
- Admin panel is open
- Messages from different dates exist

**Test Steps:**
1. Click date filter
2. Select "Past 24 hours"
3. Verify results update
4. Try custom date range

**Expected Result:**
- Messages filter by selected time period
- Only messages within date range show
- Results update within 500ms
- Custom date picker is intuitive
- "Clear Filter" button appears

---

### Positive Scenario: Admin Searches Message Content

**Preconditions:**
- Admin panel is open
- Messages with various keywords exist

**Test Steps:**
1. Use search bar at top
2. Type keyword (e.g., "problem", "help")
3. Press Enter or wait for results

**Expected Result:**
- Messages containing keyword appear
- Search highlights matching text
- Result count shows (e.g., "12 messages match 'help'")
- Search completes within 500ms
- Results are accurate

---

### Positive Scenario: Admin Responds to User Message

**Preconditions:**
- Admin is on chat admin panel
- Admin selected a user message

**Test Steps:**
1. Click on user message
2. Message detail panel opens or expands
3. Click "Reply" button
4. Message compose field appears
5. Type admin response message
6. Click "Send Reply"

**Expected Result:**
- Reply compose area appears with user message context
- Admin can type response (up to 2000 chars)
- Reply sends within 1 second
- Response marked as "Admin Reply"
- User receives notification of admin response
- Admin action logged with timestamp

---

### Positive Scenario: Admin Can View Message Flagged as Spam

**Preconditions:**
- Some messages are flagged as inappropriate
- Admin is on chat admin panel

**Test Steps:**
1. Look for filter by status
2. Select "Flagged" or "Inappropriate"
3. View flagged messages

**Expected Result:**
- Only flagged messages display
- Flag reason shows (e.g., "Spam", "Offensive")
- Admin notes visible if any
- Admin can take action (delete, approve, etc.)

---

### Negative Scenario 1: Non-Admin Cannot Access Chat Admin Panel

**Preconditions:**
- Regular user is logged in

**Test Steps:**
1. Try to navigate to admin panel URL
2. Look for admin menu option

**Expected Result:**
- Page shows: "Access Denied"
- User redirected to regular chat view
- Admin panel not accessible
- No admin controls visible

---

### Negative Scenario 2: Unauthenticated User Redirected to Login

**Preconditions:**
- No user is logged in

**Test Steps:**
1. Try to access admin chat panel directly
2. Paste URL in browser

**Expected Result:**
- System redirects to login page
- Message: "Please log in first"
- Admin panel not accessible without login

---

### Negative Scenario 3: Admin Cannot See Other Admins' Private Messages

**Preconditions:**
- System has private admin-to-admin messages
- Another admin logged in

**Test Steps:**
1. Try to view private messages between other admins

**Expected Result:**
- Private messages not visible
- System shows: "Access Denied"
- Or: "These messages are private"
- Only user public messages visible

---

### Negative Scenario 4: Admin Search with No Results

**Preconditions:**
- Admin panel is open
- Search term has no matching messages

**Test Steps:**
1. Search for unique keyword that doesn't exist (e.g., "xyzabc12345")
2. Press Enter

**Expected Result:**
- Empty state displays: "No messages found"
- Or: "No messages match 'xyzabc12345'"
- Suggestion to try different search term
- No errors displayed

---

## Cross-Feature Tests

### Scenario 1: Message Edit Then Delete

**Preconditions:**
- User edited a message
- Message shows "[edited]" indicator

**Test Steps:**
1. Edit message (change content)
2. Message updates successfully
3. Now delete the edited message
4. Confirm deletion

**Expected Result:**
- Message deletes successfully
- Both edit and delete are recorded in audit log
- Message completely removed from chat
- Edit history preserved in audit trail

---

### Scenario 2: Admin Reviews Chat, Then Flags and Deletes Inappropriate Message

**Preconditions:**
- Admin on chat admin panel
- Message contains inappropriate content

**Test Steps:**
1. Admin finds message
2. Clicks "Flag as Inappropriate"
3. Selects reason (e.g., "Offensive language")
4. Confirms flagging
5. Then clicks "Delete Message"
6. Confirms deletion

**Expected Result:**
- Message flagged with reason
- Message then deleted
- Both actions logged: flag + delete
- Both timestamp and admin ID recorded
- Message no longer visible

---

### Scenario 3: Real-time Sync - Edit Message Then View in Another Browser

**Preconditions:**
- Chat window open in Browser A and Browser B
- Same user logged in both
- User sends message

**Test Steps:**
1. In Browser A, send message
2. In Browser B, see message appear in real-time
3. In Browser A, edit the message
4. In Browser B, observe message update immediately

**Expected Result:**
- Message appears in both browsers simultaneously
- Edit in one browser updates both windows instantly
- No refresh needed
- Timestamps consistent across browsers

---

## Performance & Edge Cases

### Scenario 1: Dashboard Loads With Large Dataset

**Preconditions:**
- System has 1000+ reviews or messages
- Admin accessing dashboard

**Test Steps:**
1. Open admin review dashboard or chat panel
2. Wait for loading

**Expected Result:**
- Page loads within 2 seconds
- Pagination works correctly
- First 50 items load only (not all 1000)
- Scrolling/paging works smoothly
- No lag or freezing

---

### Scenario 2: Filter With Multiple Criteria

**Preconditions:**
- Admin dashboard open
- Multiple filter types available

**Test Steps:**
1. Apply rating filter (4-5 stars)
2. Apply date filter (past 7 days)
3. Apply provider filter (specific provider)
4. Wait for results

**Expected Result:**
- All filters applied simultaneously
- Results show intersection of all criteria
- Active filters display clearly
- Results update within 500ms
- "Clear All Filters" button works

---

## Accessibility Tests

### Scenario 1: Keyboard Navigation

**Preconditions:**
- Review dashboard or chat panel open

**Test Steps:**
1. Use Tab key to navigate through interface
2. Use Enter to activate buttons
3. Use arrow keys for dropdowns
4. Use Escape to close modals

**Expected Result:**
- All interactive elements reachable via keyboard
- Focus indicator visible
- Tab order logical and sequential
- Escape closes modals
- No keyboard traps

---

### Scenario 2: Screen Reader Compatibility

**Preconditions:**
- Screen reader enabled (NVDA, JAWS, etc.)

**Test Steps:**
1. Navigate admin dashboard with screen reader
2. Read review content
3. Access delete button
4. Activate delete flow

**Expected Result:**
- All elements announced correctly
- Button purposes clear
- Modal purpose explained
- Confirmation dialog readable
- Form labels associated with inputs

---

## Conclusion

All test scenarios should be executed in the following order:
1. Positive scenarios first (happy path)
2. Negative scenarios (error cases)
3. Cross-feature tests
4. Performance tests
5. Accessibility tests

**Critical Success Criteria:**
- ✅ No data loss
- ✅ Proper authorization on all operations
- ✅ Real-time updates working
- ✅ Audit trail maintained
- ✅ User experience smooth
- ✅ Error messages helpful
- ✅ Performance acceptable (< 2 second load times)

**Defects Found Should Be Logged With:**
- Test scenario name
- Steps to reproduce
- Expected vs actual result
- Screenshot/video if applicable
- Environment (browser, OS, network speed)
