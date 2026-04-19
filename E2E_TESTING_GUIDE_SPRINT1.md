# End-to-End (E2E) Testing Guide
## Rental Car Booking System

**Project:** Rental Car Booking System  
**Focus:** EPIC1 (Rating & Review System) and EPIC2 (Chat System)  
**Date:** April 19, 2026

---

## Quick Overview

This guide helps testers manually test 4 key features. Each feature has **positive tests** (should work) and **negative tests** (should fail appropriately).

---

# US1-1: Create a Review

**Goal:** User can share their experience with a service provider by leaving a rating and comment.

## Positive Scenario: Create a Review Successfully

**Preconditions:**
- User is logged into their account
- User has previously booked a car from the provider they want to review
- User has not reviewed this provider before

**Test Steps:**
1. Navigate to the provider's profile or booking history
2. Click "Write a Review" or "Create Review" button
3. Enter a rating (must be between 1 and 5 stars)
4. Enter a comment (text, between 1 and 1000 characters)
5. Click "Submit Review" button

**Expected Result:**
- Review appears immediately on the provider's page
- Success message displays: "Review created successfully"
- The provider's average rating updates to include the new review
- User can see their review in their review history

---

## Negative Scenario 1: Submit Review Without Login

**Preconditions:**
- User is NOT logged in

**Test Steps:**
1. Try to access the review creation form directly
2. Click "Create Review" without logging in

**Expected Result:**
- System shows error message: "Please log in first" or similar
- Review form does not open
- No review is created

---

## Negative Scenario 2: Submit Review Without Previous Booking

**Preconditions:**
- User is logged in
- User has NEVER booked from this provider

**Test Steps:**
1. Navigate to a provider's profile (that user has not booked from)
2. Click "Write a Review"
3. Try to submit a review

**Expected Result:**
- System shows error message: "You must book this provider before leaving a review"
- Review is not created

---

## Negative Scenario 3: Submit Review Without Required Information

**Preconditions:**
- User is logged in
- User has booked this provider

**Test Steps:**
1. Click "Write a Review"
2. Leave the rating field empty OR leave the comment field empty
3. Click "Submit Review"

**Expected Result:**
- System shows error message indicating what's missing
- Review is not created
- Form highlights missing fields in red

---

## Negative Scenario 4: Submit Invalid Rating

**Preconditions:**
- User is logged in
- User has booked this provider

**Test Steps:**
1. Click "Write a Review"
2. Try to enter a rating of 0, 6, or a decimal like 4.5
3. Try to submit

**Expected Result:**
- System shows error: "Rating must be a whole number between 1 and 5"
- Review is not created

---

## Negative Scenario 5: Submit Comment That's Too Long

**Preconditions:**
- User is logged in
- User has booked this provider

**Test Steps:**
1. Click "Write a Review"
2. Enter a rating (1-5)
3. Paste or type more than 1000 characters in the comment field
4. Click "Submit Review"

**Expected Result:**
- System shows error: "Comment cannot exceed 1000 characters"
- Character counter shows how many characters are over the limit
- Review is not created

---

## Negative Scenario 6: Submit Duplicate Review

**Preconditions:**
- User is logged in
- User has already created a review for this provider

**Test Steps:**
1. Navigate to the same provider
2. Try to create another review by clicking "Write a Review" again
3. Try to submit a second review

**Expected Result:**
- System shows error: "You have already reviewed this provider"
- Second review is not created
- User's first review is still displayed

---

# US1-2: Edit a Review

**Goal:** User can update their existing review to change the rating or comment.

## Positive Scenario: Edit a Review Successfully

**Preconditions:**
- User is logged in
- User has an existing review on a provider
- User is viewing their own review

**Test Steps:**
1. Navigate to the provider's page or user's review history
2. Find the user's own review
3. Click the "Edit" button on their review
4. Change the rating (e.g., from 5 to 4)
5. Change the comment text
6. Click "Save Changes" button

**Expected Result:**
- Review is updated with new rating and comment
- Success message displays: "Review updated successfully"
- The updated timestamp shows a more recent date/time
- Provider's average rating recalculates immediately
- Updated review is visible on the provider's page

---

## Negative Scenario 1: Edit Review With Missing Information

**Preconditions:**
- User is logged in
- User is editing their own review
- Edit form is open

**Test Steps:**
1. Click "Edit" on their review
2. Clear the comment field completely
3. Click "Save Changes"

**Expected Result:**
- System shows error: "Comment is required"
- Review is not updated
- Original review content is preserved

---

## Negative Scenario 2: Edit Review With Invalid Rating

**Preconditions:**
- User is logged in
- User is editing their own review

**Test Steps:**
1. Click "Edit" on the review
2. Try to change the rating to 0 or 6
3. Click "Save Changes"

**Expected Result:**
- System shows error: "Rating must be between 1 and 5"
- Review is not updated with invalid rating
- Original rating remains unchanged

---

## Negative Scenario 3: Edit Another User's Review

**Preconditions:**
- User A is logged in
- User B has written a review
- User A tries to edit User B's review

**Test Steps:**
1. Find another user's review on a provider's page
2. Try to click an "Edit" button on that review
   - OR try to access the edit URL directly if possible

**Expected Result:**
- "Edit" button does not appear for other users' reviews
- If user tries to force access: System shows error "You are not authorized to edit this review"
- Review is not editable

---

---

# US2-1: Send Messages to Admins

**Goal:** User can send a message to an admin to ask questions or request support.

## Positive Scenario: Send a Message Successfully

**Preconditions:**
- User is logged in
- Chat interface or support section is visible

**Test Steps:**
1. Open the chat/messaging section
2. Click "New Message" or the message input field
3. Type a message (e.g., "Can I extend my booking?")
4. Click "Send" button

**Expected Result:**
- Message appears in the chat history immediately
- Message shows as "Sent" or "Pending"
- User can see their message in the conversation thread
- Timestamp is recorded for the message
- Admin receives notification that a new message arrived

---

## Negative Scenario 1: Send Message Without Login

**Preconditions:**
- User is NOT logged in

**Test Steps:**
1. Try to access the chat feature
2. Try to type a message
3. Try to click "Send"

**Expected Result:**
- System shows error: "Please log in to send a message"
- Chat interface does not open
- Message is not sent

---

## Negative Scenario 2: Send Empty Message

**Preconditions:**
- User is logged in
- Chat window is open

**Test Steps:**
1. Click in the message input field
2. Leave it empty (or only spaces)
3. Click "Send" button

**Expected Result:**
- System shows error: "Message cannot be empty"
- "Send" button may be disabled or greyed out
- No message is sent or delivered

---

## Negative Scenario 3: Send Message That's Too Long

**Preconditions:**
- User is logged in
- Chat window is open

**Test Steps:**
1. Click in the message input field
2. Paste or type more than 1000 characters
3. Click "Send" button

**Expected Result:**
- System shows error: "Message cannot exceed 1000 characters"
- Character counter displays remaining characters available
- Message is not sent
- User can see how many characters to delete

---

---

# US2-2: Receive Messages from Admins

**Goal:** User can see responses from admins in their chat to continue the conversation.

## Positive Scenario: Receive and View Admin Messages

**Preconditions:**
- User is logged in
- Admin has sent a message to the user
- User opens the chat

**Test Steps:**
1. Log in as the user
2. Open the chat/messaging section
3. View the conversation with the admin
4. Look at the message history

**Expected Result:**
- All admin messages appear in the chat history
- Admin messages are clearly marked as "Admin" or from support team
- Messages are displayed in chronological order (oldest at top, newest at bottom)
- Each message shows who sent it and what time it was sent
- User can read the full message content
- User can reply to the admin's message

---

## Negative Scenario 1: View Messages Without Login

**Preconditions:**
- Admin has sent messages to the user
- User is NOT logged in

**Test Steps:**
1. Try to access chat page without logging in
2. Try to view message history

**Expected Result:**
- System shows error: "Please log in to view messages"
- Chat history is NOT visible
- User is redirected to login page
- No messages are displayed

---

## Negative Scenario 2: Try to View Another User's Messages

**Preconditions:**
- User A is logged in
- User B has received messages from admin
- User A tries to access User B's chat

**Test Steps:**
1. User A logs in
2. User A tries to navigate to User B's chat directly (via URL or link)
3. Try to view User B's message history

**Expected Result:**
- System shows error: "You do not have permission to view these messages"
- User A cannot see User B's messages
- User A only sees their own chat history

---

---

## Testing Checklist

Use this checklist to track which tests have been completed:

### US1-1: Create Review
- [ ] Positive: Create review successfully
- [ ] Negative: Not logged in
- [ ] Negative: No previous booking
- [ ] Negative: Missing required info
- [ ] Negative: Invalid rating
- [ ] Negative: Comment too long
- [ ] Negative: Duplicate review

### US1-2: Edit Review
- [ ] Positive: Edit review successfully
- [ ] Negative: Missing information
- [ ] Negative: Invalid rating
- [ ] Negative: Try to edit another user's review

### US2-1: Send Message
- [ ] Positive: Send message successfully
- [ ] Negative: Not logged in
- [ ] Negative: Empty message
- [ ] Negative: Message too long

### US2-2: Receive Message
- [ ] Positive: View admin messages
- [ ] Negative: Not logged in
- [ ] Negative: Try to view another user's messages

---

## Notes for Testers

- **Be thorough:** Test each scenario completely before marking it done
- **Note any errors:** If something behaves differently than expected, document it with a screenshot or description
- **Test on different devices:** If possible, test on mobile and desktop
- **Check timing:** Verify that messages/reviews appear in real-time where applicable
- **Verify UI:** Check that error messages are clear and helpful to users
- **Test order:** Users should be able to perform steps in any order (except where prerequisites block it)

---

**Last Updated:** April 19, 2026
