# Step 2: Model-Driven App (Admin/Manager View)

This app provides the back-office interface for Managers and Stakeholders to review Insights, manage Taskings, and oversee system usage.

## 1. Create the App
1.  Inside your **Sweet Reach** solution, click **New** -> **App** -> **Model-driven app**.
2.  **Name**: Sweet Reach Admin
3.  **Description**: Management interface for Sweet Reach taskings and insights.
4.  Click **Create**.

## 2. Configure Sitemap (Navigation)
Setup the left-hand navigation menu.
*   **Group 1: Operations**
    *   Subarea: **Insights** (Entity: Insight)
    *   Subarea: **Actions** (Entity: Action)
    *   Subarea: **Taskings** (Entity: Tasking)
*   **Group 2: Engagement**
    *   Subarea: **Reviews** (Entity: Review)
    *   Subarea: **Insight Feedbacks** (Entity: Insight Feedback)
*   **Group 3: Configuration**
    *   Subarea: **Subscriptions** (Entity: Subscription)
    *   Subarea: **App Feedbacks** (Entity: App Feedback)
    *   Subarea: **Users** (Entity: User)

## 3. Configure Forms & Views
For each table, we need to configure how data is presented.

### A. Insight Table
*   **View (Active Insights)**:
    *   Add columns: Title, Author, Date, Type, Status, Tasking.
    *   Sort by: Date (Newest to Oldest).
*   **Form (Main)**:
    *   **Header**: Status, Owner, Date.
    *   **General Tab**:
        *   Section: **Details** (Title, Type, Description - make this large).
        *   Section: **Context** (Tasking, Team Tag, Topic Tag, Country).
    *   **Reviews Tab**:
        *   Add a **Subgrid** showing related **Reviews**.
    *   **Actions Tab**:
        *   Add a **Subgrid** showing related **Actions**.

### B. Tasking Table
*   **Form (Main)**:
    *   **General Tab**: Title, Requesting Team, Deadline, Status.
    *   **Related Insights Tab**:
        *   Add a **Subgrid** related to Insights (to see all insights filed against this tasking).

### C. Action Table
*   **Form (Main)**: Description, Status, Assigned To, Due Date, Related Insight.

## 4. Business Process Flows (Optional)
You can add a Business Process Flow (BPF) to the **Insight** table to guide the lifecycle.
*   **Stages**:
    1.  **Draft**: Capture details.
    2.  **Review**: Manager reviews and adds comments.
    3.  **Action**: Actions are assigned and tracked.
    4.  **Close**: Final status set to Closed.

## 5. Publish
1.  Save the App.
2.  Click **Publish**.
3.  Click **Play** to test the navigation and data entry.

---
**Next Step**: Proceed to `03-Canvas-App.md` to build the primary User Interface.
