# Step 1: Dataverse Data Model Setup

## 1. Create Solution
1.  Go to [make.powerapps.com](https://make.powerapps.com).
2.  Select your Environment.
3.  Navigate to **Solutions** -> **New Solution**.
    *   **Display Name**: Sweet Reach
    *   **Name**: `SweetReach`
    *   **Publisher**: Create a new publisher (e.g., "Jimfolio", prefix `jim`).
    *   **Version**: 1.0.0.0
4.  Click **Create**. Open the new solution.

## 2. Configure Choice Columns (Enums)
Before creating tables, define the global choices (Option Sets) to ensure consistency.

### A. Insight Type
*   **Display Name**: Insight Type
*   **Name**: `jim_insighttype`
*   **Choices**:
    *   Observation
    *   ITN (Intelligence/Information)
    *   Action

### B. Insight Status
*   **Display Name**: Insight Status
*   **Name**: `jim_insightstatus`
*   **Choices**:
    *   New (Default)
    *   Reviewed
    *   Actioned
    *   Closed

### C. Action Status
*   **Display Name**: Action Status
*   **Name**: `jim_actionstatus`
*   **Choices**:
    *   Pending
    *   In Progress
    *   Completed

### D. User Role
*   **Display Name**: User Role
*   **Name**: `jim_userrole`
*   **Choices**:
    *   Officer
    *   Manager
    *   Stakeholder

## 3. Create Tables
*Note: For the `User` table, we will utilize the out-of-the-box (OOTB) **User** (`systemuser`) table in Dataverse, but we may extend it or create a custom `Profile` table if we need specific metadata not available in Entra ID (Azure AD).*

### Table: Tasking
*   **Display Name**: Tasking
*   **Plural Name**: Taskings
*   **Primary Column**: Title
*   **Columns**:
    *   `Description` (Multiple lines of text)
    *   `Requesting Team` (Single line of text)
    *   `Deadline` (Date and Time)
    *   `Status` (Choice: Active/Inactive - *Use OOTB Status reason or custom choice*)

### Table: Insight
*   **Display Name**: Insight
*   **Plural Name**: Insights
*   **Primary Column**: Title
*   **Columns**:
    *   `Description` (Multiple lines of text / Rich Text)
    *   `Date` (Date Only) - *Default to Today*
    *   `Type` (Choice: `jim_insighttype`)
    *   `Status` (Choice: `jim_insightstatus`)
    *   `Team Tag` (Single line of text / or Lookup to a Team table if you want strict governance)
    *   `Topic Tag` (Single line of text)
    *   `Country` (Single line of text / or Lookup to Country table)
    *   `Tasking` (Lookup -> **Tasking**)
    *   `Author` (Lookup -> **User**)
*   **Relationships**:
    *   Many-to-One with **Tasking**.
    *   Many-to-One with **User** (Created By/Author).

### Table: Action
*   **Display Name**: Action
*   **Plural Name**: Actions
*   **Primary Column**: Action ID (Auto-number) or Title
*   **Columns**:
    *   `Description` (Multiple lines of text)
    *   `Status` (Choice: `jim_actionstatus`)
    *   `Assigned To` (Lookup -> **User** or Team)
    *   `Due Date` (Date only)
    *   `Insight` (Lookup -> **Insight**)
*   **Relationships**:
    *   Many-to-One with **Insight** (Parent).

### Table: Review
*   **Display Name**: Review
*   **Plural Name**: Reviews
*   **Primary Column**: Review ID (Auto-number)
*   **Columns**:
    *   `Content` (Multiple lines of text)
    *   `Insight` (Lookup -> **Insight**)
    *   `Manager` (Lookup -> **User**)

### Table: Feedback (Social)
*   **Display Name**: Insight Feedback
*   **Plural Name**: Insight Feedbacks
*   **Primary Column**: ID
*   **Columns**:
    *   `Rating` (Whole Number: 1-5)
    *   `Comment` (Multiple lines of text)
    *   `Insight` (Lookup -> **Insight**)
    *   `User` (Lookup -> **User**)

### Table: Subscription
*   **Display Name**: Subscription
*   **Plural Name**: Subscriptions
*   **Primary Column**: Topic Name
*   **Columns**:
    *   `Topic` (Single line of text)
    *   `Subscriber` (Lookup -> **User**)

### Table: App Feedback
*   **Display Name**: App Feedback
*   **Plural Name**: App Feedbacks
*   **Columns**:
    *   `Rating` (Whole Number)
    *   `Comment` (Multiple lines of text)

---
**Next Step**: Proceed to `02-Model-Driven-App.md` to build the administrative interface.
