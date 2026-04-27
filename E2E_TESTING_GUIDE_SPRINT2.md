# End-to-End (E2E) Testing Guide - Sprint 2
## Rental Car Booking System

**Project:** Rental Car Booking System  
**Focus:** EPIC 1 (Review Management) and EPIC 2 (Chat System)  
**Date:** April 27, 2026

---

## Quick Overview

This guide helps testers manually test Sprint 2 features. Each feature has **positive tests** (should work) and **negative tests** (should fail appropriately).

---

# SPRINT 2 EPIC 1: RATING & REVIEW SYSTEM

---

## US1-3: Admin View Reviews & Ratings Dashboard

**Goal:** Admin can view all reviews and ratings for their providers to understand customer feedback.

### Positive Scenario: Admin Views Review Dashboard Successfully

**Preconditions:**
- Admin is logged in
- Multiple reviews exist for providers

**Test Steps:**
1. Log in as admin
2. Navigate to review dashboard

**Expected Result:**
- Dashboard loads with all reviews displayed
- Each review shows: rating, comment, user name, provider, timestamp

---

### Positive Scenario: Admin Dashboard Shows Empty State

**Preconditions:**
- Admin is logged in
- No reviews exist in the system

**Test Steps:**
1. Navigate to review dashboard

**Expected Result:**
- Dashboard loads without errors
- Empty state message displays: "No reviews found"

---

### Negative Scenario 1: Non-Admin Cannot Access Dashboard

**Preconditions:**
- Regular user is logged in (not admin)

**Test Steps:**
1. Try to access admin dashboard URL

**Expected Result:**
- System shows error: "Access Denied"
- No admin controls visible

---

### Negative Scenario 2: Unauthenticated User Redirected to Login

**Preconditions:**
- User is NOT logged in

**Test Steps:**
1. Try to access admin dashboard URL

**Expected Result:**
- System redirects to login page
- Message: "Please log in first"

---

## US1-4: Admin Delete Reviews

**Goal:** Admin can delete inappropriate or unnecessary reviews from the system.

### Positive Scenario: Admin Successfully Deletes a Review

**Preconditions:**
- Admin is logged in
- Review dashboard is displayed

**Test Steps:**
1. Find a review in the dashboard
2. Click "Delete" button
3. Confirmation modal appears
4. Enter deletion reason
5. Click "Confirm Delete"

**Expected Result:**
- Confirmation modal appears with review details
- After confirmation, review disappears from dashboard
- Success message: "Review deleted successfully"

---

### Negative Scenario 1: Regular User Cannot Delete Reviews

**Preconditions:**
- Regular user is logged in

**Test Steps:**
1. Look for delete button on reviews

**Expected Result:**
- Delete button not visible
- User cannot access delete functionality

---

### Negative Scenario 2: Delete Requires Reason

**Preconditions:**
- Admin delete modal is open

**Test Steps:**
1. Leave deletion reason field empty
2. Try to click Delete

**Expected Result:**
- Delete button is disabled
- Error message: "Please provide a deletion reason"
---

# SPRINT 2 EPIC 2: CHAT SYSTEM

---

## US2-3: User Edits Messages

**Goal:** Logged-in users can edit their messages to correct information.

### Positive Scenario: User Successfully Edits Their Message

**Preconditions:**
- User is logged in
- User has sent a message

**Test Steps:**
1. Find user's own message in chat
2. Click "Edit" button on the message
3. Edit form appears with original text
4. Modify the message content
5. Click "Save" button

**Expected Result:**
- Edit form displays with original message text
- After saving, message updates in chat
- "Edited" timestamp indicator appears on message

---

### Negative Scenario 1: User Cannot Edit Others' Messages

**Preconditions:**
- User is logged in
- Another user's message is visible

**Test Steps:**
1. Look for edit button on another user's message

**Expected Result:**
- Edit button not visible for others' messages
- Cannot modify messages they don't own
- Edit action is denied

---

### Negative Scenario 2: Edit Message Cannot Be Empty

**Preconditions:**
- User editing a message

**Test Steps:**
1. Clear all message text
2. Try to save

**Expected Result:**
- Error message: "Message cannot be empty"
- Original message preserved

---

## US2-4: User Deletes Messages

**Goal:** Logged-in users can delete their messages to remove incorrect information.

### Positive Scenario: User Successfully Deletes Their Message

**Preconditions:**
- User is logged in
- User has sent a message

**Test Steps:**
1. Find user's own message in chat
2. Click "Delete" button on message
3. Confirmation dialog appears
4. Click "Confirm"

**Expected Result:**
- Message disappears from chat within 1-2 seconds
- Success message: "Message deleted successfully"
- Message no longer visible to other users

---

### Negative Scenario 1: User Cannot Delete Others' Messages

**Preconditions:**
- User is logged in
- Another user's message is visible

**Test Steps:**
1. Look for delete button on another user's message

**Expected Result:**
- Delete button not visible for others' messages
- Cannot delete messages they don't own

---

### Negative Scenario 2: Delete Action Denied for Non-Owner

**Preconditions:**
- User attempts to delete message they don't own

**Test Steps:**
1. Try to access delete function via API

**Expected Result:**
- Server responds: "Unauthorized"
- HTTP 403 Forbidden status
- Message not deleted

---

## US2-5: Admin View User Messages

**Goal:** Admin can view all user messages to respond to their inquiries.

### Positive Scenario: Admin Successfully Views All Messages

**Preconditions:**
- Admin is logged in with admin role
- Multiple user messages exist

**Test Steps:**
1. Log in as admin
2. Navigate to chat admin section

**Expected Result:**
- All user messages are displayed
- Each message shows: sender, content, timestamp

---

### Negative Scenario 1: Non-Logged-In User Redirected to Login

**Preconditions:**
- User is NOT logged in

**Test Steps:**
1. Try to access admin chat panel

**Expected Result:**
- System redirects to login page
- Message: "Please log in first"

---

### Negative Scenario 2: Non-Admin Cannot Access Admin Messages

**Preconditions:**
- Regular user is logged in (not admin)

**Test Steps:**
1. Try to access admin message viewing section

**Expected Result:**
- System shows: "Access Denied"
- Regular user cannot see admin panel

---

## Summary

**Key Verification Points:**
✅ Admin can view reviews and messages  
✅ Users can edit and delete their own content  
✅ Users cannot edit/delete others' content  
✅ Proper authorization enforced  
✅ Confirmation dialogs appear before destructive actions  
✅ Non-authenticated users redirected to login


